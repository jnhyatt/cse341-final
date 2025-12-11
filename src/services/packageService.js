import { ObjectId } from "mongodb";
import { db, mongoClient } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getAllPackagesService(start, count) {
    return await db
        .collection("packages")
        .find({})
        // MongoDB doesn't guarantee stable ordering even between similar queries, so we add a
        // consistent sort.
        .sort({ _id: 1 })
        .skip(start)
        .limit(count)
        .toArray();
}

export async function getPackageByIdService(id) {
    return await db.collection("packages").findOne({ _id: new ObjectId(id) });
}

export async function getPackagesAtAirportService(airportId) {
    return await db
        .collection("packages")
        .find({ whereabouts: { type: "airport", airport: airportId } })
        .toArray();
}

export async function getPackagesOnboardService(planeTailNumber) {
    return await db
        .collection("packages")
        .find({ whereabouts: { type: "plane", plane: planeTailNumber } })
        .toArray();
}

export async function loadPackage(packageId, planeTailNumber) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const pkg = await db.collection("packages").findOne({ _id: new ObjectId(packageId) }, { session });
            if (!pkg) {
                throw new AppError("Package not found", 404);
            }
            const plane = await db.collection("planes").findOne({ _id: planeTailNumber }, { session });
            if (pkg.whereabouts.type !== "airport" || pkg.whereabouts.airport !== plane.whereabouts.airport) {
                throw new AppError("Package and plane are not at the same airport", 400);
            }
            await db
                .collection("packages")
                .updateOne(
                    { _id: new ObjectId(packageId) },
                    { $set: { whereabouts: { type: "plane", plane: planeTailNumber } } },
                    { session },
                );
        });
    } finally {
        await session.endSession();
    }
}

export async function unloadPackage(packageId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const pkg = await db.collection("packages").findOne({ _id: new ObjectId(packageId) }, { session });
            if (!pkg) {
                throw new AppError("Package not found", 404);
            }
            if (pkg.whereabouts.type !== "plane") {
                throw new AppError("Package is not on a plane", 400);
            }
            const plane = await db.collection("planes").findOne({ _id: pkg.whereabouts.plane }, { session });
            if (plane.whereabouts.type !== "airport") {
                throw new AppError("Can't unload package while the plane is in the air", 400);
            }
            await db
                .collection("packages")
                .updateOne(
                    { _id: new ObjectId(packageId) },
                    { $set: { whereabouts: { type: "airport", airport: plane.whereabouts.airport } } },
                    { session },
                );
        });
    } finally {
        await session.endSession();
    }
}
