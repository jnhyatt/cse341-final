import { db } from "../config/db.js";
import { arrivalTime } from "./routes.js";

const TICK_INTERVAL_MS = 1000 * 60 * 10; // 10 minutes per game tick
let lastTickTime = Date.now();

export function shouldTick(currentTime) {
    return lastTickTime + TICK_INTERVAL_MS <= currentTime;
}

export function updateLastTickTime(currentTime) {
    lastTickTime = currentTime;
}

export async function gameTick() {
    // Main game tick:
    // - Planes that have reached their destination have their whereabouts updated
    // - Packages that are now at their destination are cashed in and removed
    for (const plane of await arrivedPlanes()) {
        const destination = plane.whereabouts.enRoute.destination;
        await db.collection("planes").updateOne(
            { _id: plane._id },
            {
                $set: {
                    whereabouts: {
                        type: "airport",
                        airport: destination,
                    },
                },
            },
        );
        // For each package where package.whereabouts.type == "plane" && package.whereabouts.plane == plane._id, check if package.goal == plane.whereabouts.enRoute.destination
        const arrivedPackages = await db
            .collection("packages")
            .find({ "whereabouts.plane": plane._id })
            .toArray()
            .filter((pkg) => pkg.destination === destination);
        for (const cargo of arrivedPackages) {
            const planeOwner = await db.collection("users").findOne({ _id: plane.owner });
            await db.collection("users").updateOne({ _id: planeOwner._id }, { $inc: { funds: cargo.payout } });
            await db.collection("packages").deleteOne({ _id: cargo._id });
        }
    }

    // Remove expired packages
    await db.collection("packages").deleteMany({ expiresAt: { $lte: Date.now() } });

    // Spawn new packages at 20 random airports
    const allAirports = await db.collection("airports").find({}).toArray();
    const selectedAirports = allAirports.sort(() => Math.random() - 0.5).slice(0, 20);

    const allPackages = await Promise.all(
        selectedAirports.map(async (airport) => {
            // Generate between 1 and 15 new packages
            const packagePromises = [];
            const numPackages = Math.floor(Math.random() * 15) + 1;
            for (let i = 0; i < numPackages; i++) {
                packagePromises.push(newPackage(airport));
            }
            const packages = await Promise.all(packagePromises);
            return packages.filter((pkg) => pkg !== null);
        }),
    );

    // Flatten and insert all packages at once
    const packagesToInsert = allPackages.flat();
    if (packagesToInsert.length > 0) {
        console.log(`Inserting ${packagesToInsert.length} new packages`);
        await db.collection("packages").insertMany(packagesToInsert);
    }
}

async function newPackage(airport) {
    // Spatial query: find airports within 2000km
    const nearby = await db
        .collection("airports")
        .find({
            _id: { $ne: airport._id },
            location: {
                $geoWithin: {
                    $centerSphere: [[airport.location.coordinates[0], airport.location.coordinates[1]], 2000 / 6371],
                },
            },
        })
        .toArray();

    // If no nearby airports, return null
    if (nearby.length === 0) {
        return null;
    }

    const count = Math.floor(Math.random() * 10) + 1;
    const unitMass = Math.floor(Math.random() * 100) + 1;
    const goal = nearby[Math.floor(Math.random() * nearby.length)];
    return {
        name: `${count} things going to ${goal._id}`,
        type: "cargo",
        count,
        goal: goal._id,
        whereabouts: {
            type: "airport",
            airport: airport._id,
        },
        payout: count * unitMass * (Math.floor(Math.random() * 5) + 1), // Random payout based on weight
        unitMass,
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours from now
    };
}

async function arrivedPlanes() {
    // Planes have arrived if:
    // - plane.whereabouts.departure + travelTime <= currentTime
    const enRoutePlanes = await db
        .collection("planes")
        .find({
            "whereabouts.type": "enroute",
        })
        .toArray();
    const currentTime = Date.now();

    return (
        await Promise.all(
            enRoutePlanes.map(async (plane) => {
                const planeModel = await db.collection("plane-models").findOne({ _id: plane.modelId });
                const arrival = await arrivalTime(plane.whereabouts.enRoute, planeModel.speed);
                return { plane, arrival };
            }),
        )
    )
        .filter(({ arrival }) => arrival <= currentTime)
        .map(({ plane }) => plane);
}
