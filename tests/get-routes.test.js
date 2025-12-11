import request from "supertest";
import { describe, test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { MongoClient } from "mongodb";
import app from "../src/app.js";

let connection;
let db;

beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URI_TEST);
    db = connection.db("test");

    // Create indexes (only needs to be done once)
    await db.collection("airports").createIndex({ location: "2dsphere" });
    await db.collection("packages").createIndex({ expiration: 1 });
});

beforeEach(async () => {
    // Clear collections before each test
    await db.collection("airports").deleteMany({});
    await db.collection("plane-models").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("planes").deleteMany({});
    await db.collection("packages").deleteMany({});

    // Seed test data
    await db.collection("airports").insertMany([
        {
            _id: "KSLC",
            name: "Salt Lake City International Airport",
            location: { type: "Point", coordinates: [-111.977772, 40.785749] },
        },
        {
            _id: "KJFK",
            name: "John F Kennedy International Airport",
            location: { type: "Point", coordinates: [-73.778925, 40.639447] },
        },
        {
            _id: "KORD",
            name: "Chicago O'Hare International Airport",
            location: { type: "Point", coordinates: [-87.9048, 41.9742] },
        },
    ]);

    await db.collection("plane-models").insertMany([
        {
            _id: "cessna-172-skyhawk",
            name: "Cessna 172 Skyhawk",
            baseCruise: 67,
            cost: 100000,
            cargoCapacity: 250,
            baseFuelBurn: 0.009,
            fuelCapacity: 212,
            passengerSeats: 3,
        },
        {
            _id: "boeing-737-800",
            name: "Boeing 737-800",
            baseCruise: 230,
            cost: 50000000,
            cargoCapacity: 15000,
            baseFuelBurn: 0.7,
            fuelCapacity: 26020,
            passengerSeats: 162,
        },
    ]);

    await db.collection("users").insertMany([
        { _id: "test-user-1", name: "Test User 1", funds: 100000 },
        { _id: "test-user-2", name: "Test User 2", funds: 500000 },
    ]);

    await db.collection("planes").insertMany([
        {
            _id: "N123AB",
            owner: "test-user-1",
            modelId: "cessna-172-skyhawk",
            whereabouts: { type: "airport", airport: "KSLC" },
            fuel: 200,
            upgradeLevel: 0,
            condition: 100,
        },
        {
            _id: "N456CD",
            owner: "test-user-2",
            modelId: "boeing-737-800",
            whereabouts: { type: "airport", airport: "KJFK" },
            fuel: 20000,
            upgradeLevel: 2,
            condition: 95,
        },
    ]);

    await db.collection("packages").insertMany([
        {
            name: "Medical Supplies",
            type: "cargo",
            count: 5,
            goal: "KJFK",
            whereabouts: { type: "airport", airport: "KSLC" },
            payout: 5000,
            unitMass: 50,
            expiration: new Date(Date.now() + 86400000), // 24 hours
        },
        {
            name: "Business Travelers",
            type: "passenger",
            count: 3,
            goal: "KORD",
            whereabouts: { type: "plane", plane: "N123AB" },
            payout: 3000,
            unitMass: 75,
            expiration: new Date(Date.now() + 86400000),
        },
    ]);
});

afterAll(async () => {
    await connection.close();
});

describe("GET Routes - Airports", () => {
    test("GET /airports returns paginated list of airports", async () => {
        const response = await request(app).get("/airports?limit=2&page=1");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeLessThanOrEqual(2);
        expect(response.body[0]).toHaveProperty("_id");
        expect(response.body[0]).toHaveProperty("name");
        expect(response.body[0]).toHaveProperty("location");
    });

    test("GET /airports/:id returns specific airport", async () => {
        const response = await request(app).get("/airports/KSLC");

        expect(response.status).toBe(200);
        expect(response.body._id).toBe("KSLC");
        expect(response.body.name).toBe("Salt Lake City International Airport");
        expect(response.body.location.type).toBe("Point");
    });

    test("GET /airports/:id returns 404 for non-existent airport", async () => {
        const response = await request(app).get("/airports/XXXX");

        expect(response.status).toBe(404);
    });

    test("GET /airports/near/:id returns nearby airports sorted by distance", async () => {
        const response = await request(app).get("/airports/near/KSLC?radius=5000000&limit=10");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        // Should not include KSLC itself
        expect(response.body.every((a) => a._id !== "KSLC")).toBe(true);
    });
});

describe("GET Routes - Plane Models", () => {
    test("GET /plane-models returns all airplane models", async () => {
        const response = await request(app).get("/plane-models");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty("_id");
        expect(response.body[0]).toHaveProperty("name");
        expect(response.body[0]).toHaveProperty("cost");
        expect(response.body[0]).toHaveProperty("baseCruise");
    });

    test("GET /plane-models/:id returns specific model", async () => {
        const response = await request(app).get("/plane-models/cessna-172-skyhawk");

        expect(response.status).toBe(200);
        expect(response.body._id).toBe("cessna-172-skyhawk");
        expect(response.body.name).toBe("Cessna 172 Skyhawk");
        expect(response.body.cost).toBe(100000);
    });

    test("GET /plane-models/:id returns 404 for non-existent model", async () => {
        const response = await request(app).get("/plane-models/fake-model");

        expect(response.status).toBe(404);
    });
});

describe("GET Routes - Users", () => {
    test("GET /users/:id returns specific user", async () => {
        const response = await request(app).get("/users/test-user-1");

        expect(response.status).toBe(200);
        expect(response.body._id).toBe("test-user-1");
        expect(response.body.name).toBe("Test User 1");
        expect(response.body.funds).toBe(100000);
    });

    test("GET /users/:id returns 404 for non-existent user", async () => {
        const response = await request(app).get("/users/fake-user");

        expect(response.status).toBe(404);
    });
});

describe("GET Routes - Planes", () => {
    test("GET /planes returns all planes", async () => {
        const response = await request(app).get("/planes");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty("_id");
        expect(response.body[0]).toHaveProperty("owner");
        expect(response.body[0]).toHaveProperty("whereabouts");
    });

    test("GET /planes/:id returns specific plane", async () => {
        const response = await request(app).get("/planes/N123AB");

        expect(response.status).toBe(200);
        expect(response.body._id).toBe("N123AB");
        expect(response.body.owner).toBe("test-user-1");
        expect(response.body.whereabouts.type).toBe("airport");
        expect(response.body.upgradeLevel).toBe(0);
    });

    test("GET /planes/:id returns 404 for non-existent plane", async () => {
        const response = await request(app).get("/planes/N999ZZ");

        expect(response.status).toBe(404);
    });
});

describe("GET Routes - Packages", () => {
    test("GET /packages returns paginated list of packages", async () => {
        const response = await request(app).get("/packages?limit=10&page=1");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty("_id");
        expect(response.body[0]).toHaveProperty("whereabouts");
        expect(response.body[0]).toHaveProperty("payout");
    });

    test("GET /packages/at-airport/:airport returns packages at airport", async () => {
        const response = await request(app).get("/packages/at-airport/KSLC");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].whereabouts.type).toBe("airport");
        expect(response.body[0].whereabouts.airport).toBe("KSLC");
    });

    test("GET /packages/onboard/:id returns packages on plane", async () => {
        const response = await request(app).get("/packages/onboard/N123AB");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].whereabouts.type).toBe("plane");
        expect(response.body[0].whereabouts.plane).toBe("N123AB");
    });

    test("GET /packages/onboard/:id returns 400 for invalid tail number", async () => {
        const response = await request(app).get("/packages/onboard/INVALID");

        expect(response.status).toBe(400);
    });
});
