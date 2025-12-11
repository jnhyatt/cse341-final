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
            // If the user deletes their account while a plane is in flight, planeOwner may be null
            if (planeOwner) {
                await db.collection("users").updateOne({ _id: planeOwner._id }, { $inc: { funds: cargo.payout } });
            }
            await db.collection("packages").deleteOne({ _id: cargo._id });
        }
    }

    // Remove expired packages
    await db.collection("packages").deleteMany({ expiresAt: { $lte: Date.now() } });

    // Spawn new packages at airports using aggregation pipeline
    const airportsWithDestinations = await db
        .collection("airports")
        .aggregate([
            {
                $lookup: {
                    from: "airports",
                    let: { airportLoc: "$location", airportId: "$_id" },
                    pipeline: [
                        {
                            $geoNear: {
                                near: "$$airportLoc",
                                distanceField: "distance",
                                maxDistance: 2000000,
                                query: { _id: { $ne: "$$airportId" } },
                                spherical: true,
                            },
                        },
                        { $limit: 20 }, // Keep only 20 nearest airports
                    ],
                    as: "nearby",
                },
            },
        ])
        .toArray();

    // Exponential distribution favoring nearby airports
    // Select the 20 nearest airports 80% of the time
    function selectNearbyIndex(maxIndex) {
        return Math.min(Math.floor(-Math.log(1 - Math.random()) / 0.08), maxIndex - 1);
    }

    const packagesToInsert = [];
    const now = Date.now();

    for (const airport of airportsWithDestinations) {
        if (airport.nearby.length === 0) continue;

        // Generate between 1 and 3 packages
        const numPackages = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPackages; i++) {
            const count = Math.floor(Math.random() * 10) + 1;
            const unitMass = Math.floor(Math.random() * 100) + 1;
            const goalIndex = selectNearbyIndex(airport.nearby.length);
            const goal = airport.nearby[goalIndex];

            packagesToInsert.push({
                name: `${count} things going to ${goal._id}`,
                type: "cargo",
                count,
                goal: goal._id,
                whereabouts: {
                    type: "airport",
                    airport: airport._id,
                },
                payout: count * unitMass * (Math.floor(Math.random() * 5) + 1),
                unitMass,
                expiration: new Date(now + 1000 * 60 * 60 * 48), // 48 hours from now
            });
        }
    }

    if (packagesToInsert.length > 0) {
        await db.collection("packages").insertMany(packagesToInsert);
    }
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
