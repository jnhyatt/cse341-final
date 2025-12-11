import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import { MongoClient } from "mongodb";

let connection;
let db;

beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URI_TEST);
    db = connection.db("test");

    // Create indexes
    await db.collection("airports").createIndex({ location: "2dsphere" });
    await db.collection("packages").createIndex({ expiration: 1 });
});

afterAll(async () => {
    await connection.close();
});

beforeEach(async () => {
    // Clear collections before each test
    await db.collection("airports").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("planes").deleteMany({});
    await db.collection("packages").deleteMany({});
    await db.collection("plane-models").deleteMany({});
});

describe("Service Tests - routes.js", () => {
    test("distanceBetween calculates correct distance between two points", async () => {
        // Import the service (you'll need to export distanceBetween)
        const { distanceBetween } = await import("../src/services/routes.js");

        // KSLC to KJFK is approximately 3,100 km
        const origin = { lat: 40.7899, long: -111.9778 }; // KSLC
        const destination = { lat: 40.6413, long: -73.7781 }; // KJFK

        const distance = distanceBetween(origin, destination);

        // Distance should be around 3,100,000-3,200,000 meters
        expect(distance).toBeGreaterThan(3100000);
        expect(distance).toBeLessThan(3250000);
    });

    test("distanceBetween returns 0 for same location", async () => {
        const { distanceBetween } = await import("../src/services/routes.js");

        const location = { lat: 40.7899, long: -111.9778 };
        const distance = distanceBetween(location, location);

        expect(distance).toBe(0);
    });

    test("distanceBetween calculates short distances correctly", async () => {
        const { distanceBetween } = await import("../src/services/routes.js");

        // Two points ~10km apart
        const origin = { lat: 40.7899, long: -111.9778 };
        const destination = { lat: 40.8799, long: -111.9778 }; // ~10km north

        const distance = distanceBetween(origin, destination);

        // Should be around 10,000 meters
        expect(distance).toBeGreaterThan(9000);
        expect(distance).toBeLessThan(11000);
    });
});

describe("Service Tests - createUser.js", () => {
    test("createUser inserts new user with correct defaults", async () => {
        const { createUser } = await import("../src/services/createUser.js");

        await createUser("Test User", "oauth-test-123");

        const user = await db.collection("users").findOne({ _id: "oauth-test-123" });

        expect(user).not.toBeNull();
        expect(user.name).toBe("Test User");
        expect(user.funds).toBe(100000);
        expect(user._id).toBe("oauth-test-123");
    });

    test("createUser throws on duplicate user ID", async () => {
        const { createUser } = await import("../src/services/createUser.js");

        await createUser("Test User", "oauth-test-456");

        // Second insert should fail
        await expect(createUser("Another User", "oauth-test-456")).rejects.toThrow();
    });
});

describe("Service Tests - planeService.js", () => {
    beforeEach(async () => {
        // Seed required data for plane tests
        await db.collection("plane-models").insertOne({
            _id: "test-model",
            name: "Test Aircraft",
            speed: 100,
            cost: 50000,
            fuelCapacity: 1000,
            baseFuelBurn: 0.01,
            cargoCapacity: 500,
            passengerSeats: 4,
        });

        await db.collection("users").insertOne({
            _id: "test-user",
            name: "Test User",
            funds: 100000,
        });

        await db.collection("airports").insertMany([
            {
                _id: "TEST",
                name: "Test Airport",
                latitude: 40.0,
                longitude: -110.0,
                location: { type: "Point", coordinates: [-110.0, 40.0] },
            },
            {
                _id: "DEST",
                name: "Destination Airport",
                latitude: 41.0,
                longitude: -110.0,
                location: { type: "Point", coordinates: [-110.0, 41.0] },
            },
        ]);
    });

    test("purchasePlane creates new plane and deducts funds", async () => {
        const { purchasePlane } = await import("../src/services/planeService.js");

        await purchasePlane("N123AB", "test-model", "TEST", "test-user");

        const plane = await db.collection("planes").findOne({ _id: "N123AB" });
        const user = await db.collection("users").findOne({ _id: "test-user" });

        expect(plane).not.toBeNull();
        expect(plane.owner).toBe("test-user");
        expect(plane.modelId).toBe("test-model");
        expect(plane.whereabouts.type).toBe("airport");
        expect(plane.whereabouts.airport).toBe("TEST");
        expect(plane.upgradeLevel).toBe(0);
        expect(plane.fuel).toBe(1000); // fuelCapacity from model

        expect(user.funds).toBe(50000); // 100000 - 50000
    });

    test("purchasePlane fails with insufficient funds", async () => {
        const { purchasePlane } = await import("../src/services/planeService.js");

        // Set user funds below cost
        await db.collection("users").updateOne({ _id: "test-user" }, { $set: { funds: 10000 } });

        await expect(purchasePlane("N123AB", "test-model", "TEST", "test-user")).rejects.toThrow("Insufficient funds");
    });

    test("upgradePlane increases level and deducts funds", async () => {
        const { upgradePlane } = await import("../src/services/planeService.js");

        // Create a plane first
        await db.collection("planes").insertOne({
            _id: "N123AB",
            owner: "test-user",
            modelId: "test-model",
            whereabouts: { type: "airport", airport: "TEST" },
            fuel: 500,
            upgradeLevel: 0,
            condition: 100,
        });

        await upgradePlane("N123AB", "test-user");

        const plane = await db.collection("planes").findOne({ _id: "N123AB" });
        const user = await db.collection("users").findOne({ _id: "test-user" });

        expect(plane.upgradeLevel).toBe(1);
        expect(user.funds).toBe(50000); // 100000 - 50000 (level 0→1 costs 50k)
    });

    test("upgradePlane fails at max level", async () => {
        const { upgradePlane } = await import("../src/services/planeService.js");

        // Create plane at max level
        await db.collection("planes").insertOne({
            _id: "N123AB",
            owner: "test-user",
            modelId: "test-model",
            whereabouts: { type: "airport", airport: "TEST" },
            fuel: 500,
            upgradeLevel: 3,
            condition: 100,
        });

        await expect(upgradePlane("N123AB", "test-user")).rejects.toThrow("already at max level");
    });

    test("embarkPlane calculates fuel correctly and updates whereabouts", async () => {
        const { embarkPlane } = await import("../src/services/planeService.js");

        // Create plane with plenty of fuel
        await db.collection("planes").insertOne({
            _id: "N123AB",
            owner: "test-user",
            modelId: "test-model",
            whereabouts: { type: "airport", airport: "TEST" },
            fuel: 1000,
            upgradeLevel: 0,
            condition: 100,
        });

        const beforeFuel = 1000;
        await embarkPlane("N123AB", "DEST");

        const plane = await db.collection("planes").findOne({ _id: "N123AB" });

        expect(plane.whereabouts.type).toBe("enRoute");
        expect(plane.whereabouts.origin).toBe("TEST");
        expect(plane.whereabouts.destination).toBe("DEST");
        expect(plane.whereabouts.departure).toBeDefined();
        expect(plane.fuel).toBeLessThan(beforeFuel); // Fuel was consumed
    });

    test("embarkPlane fails with insufficient fuel", async () => {
        const { embarkPlane } = await import("../src/services/planeService.js");

        // Create plane with minimal fuel
        await db.collection("planes").insertOne({
            _id: "N123AB",
            owner: "test-user",
            modelId: "test-model",
            whereabouts: { type: "airport", airport: "TEST" },
            fuel: 1, // Very low fuel
            upgradeLevel: 0,
            condition: 100,
        });

        await expect(embarkPlane("N123AB", "DEST")).rejects.toThrow("Insufficient fuel");
    });

    test("embarkPlane fails when already enroute", async () => {
        const { embarkPlane } = await import("../src/services/planeService.js");

        await db.collection("planes").insertOne({
            _id: "N123AB",
            owner: "test-user",
            modelId: "test-model",
            whereabouts: {
                type: "enRoute",
                origin: "TEST",
                destination: "DEST",
                departure: Date.now(),
            },
            fuel: 500,
            upgradeLevel: 0,
            condition: 100,
        });

        await expect(embarkPlane("N123AB", "TEST")).rejects.toThrow("already en route");
    });
});
