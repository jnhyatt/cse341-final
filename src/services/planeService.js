import { db, mongoClient } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { distanceBetween } from "./routes.js";

export async function getAllPlanes(start, count) {
    return await db
        .collection("planes")
        .find({})
        // MongoDB doesn't guarantee stable ordering even between similar queries, so we add a
        // consistent sort. We'll choose the tail number so they'll be returned alphabetically (and
        // since that never changes).
        .sort({ _id: 1 })
        .skip(start)
        .limit(count)
        .toArray();
}

export async function getPlaneByTailNumber(tailNumber) {
    return await db.collection("planes").findOne({ _id: tailNumber });
}

export async function purchasePlane(tailNumber, modelId, airportId, userId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const model = await db.collection("plane-models").findOne({ _id: modelId }, { session });
            if (!model) {
                throw new AppError("Plane model not found", 400);
            }
            const user = await db.collection("users").findOne({ _id: userId }, { session });
            if (user.funds < model.cost) {
                throw new AppError("Insufficient funds", 400);
            }
            await db.collection("users").updateOne({ _id: userId }, { $inc: { funds: -model.cost } }, { session });
            const newPlane = {
                _id: tailNumber,
                modelId: modelId,
                owner: userId,
                whereabouts: { type: "airport", airport: airportId },
                fuel: model.fuelCapacity,
                condition: 100,
                upgradeLevel: 0,
            };
            await db.collection("planes").insertOne(newPlane, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function upgradePlane(tailNumber, userId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const plane = await db.collection("planes").findOne({ _id: tailNumber }, { session });
            if (plane.upgradeLevel >= 3) {
                throw new AppError("Plane already at max level", 400);
            }
            const upgradeCosts = [50000, 100000, 200000];
            const upgradeCost = upgradeCosts[plane.upgradeLevel];
            const user = await db.collection("users").findOne({ _id: userId }, { session });
            if (user.funds < upgradeCost) {
                throw new AppError("Insufficient funds", 400);
            }
            await db.collection("users").updateOne({ _id: userId }, { $inc: { funds: -upgradeCost } }, { session });
            await db.collection("planes").updateOne({ _id: tailNumber }, { $inc: { upgradeLevel: 1 } }, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function embarkPlane(tailNumber, destinationAirportId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const plane = await db.collection("planes").findOne({ _id: tailNumber }, { session });
            if (plane.whereabouts.type !== "airport") {
                throw new AppError("Plane is already en route", 400);
            }
            if (plane.whereabouts.airport === destinationAirportId) {
                throw new AppError("Destination airport must be different from current location", 400);
            }
            const originAirport = await db
                .collection("airports")
                .findOne({ _id: plane.whereabouts.airport }, { session });
            const destinationAirport = await db
                .collection("airports")
                .findOne({ _id: destinationAirportId }, { session });
            if (!destinationAirport) {
                throw new AppError("Destination airport not found", 404);
            }
            const distanceMeters = distanceBetween(
                { lat: originAirport.latitude, long: originAirport.longitude },
                { lat: destinationAirport.latitude, long: destinationAirport.longitude },
            );
            const model = await db.collection("plane-models").findOne({ _id: plane.modelId }, { session });
            const speedMs = model.speed * (1 + 0.1 * plane.upgradeLevel);
            const fuelBurnRateKgPerS = model.baseFuelBurn * (1 - 0.05 * plane.upgradeLevel);
            const travelTimeSeconds = distanceMeters / speedMs;
            const totalFuelBurnKg = fuelBurnRateKgPerS * travelTimeSeconds;
            if (plane.fuel < totalFuelBurnKg) {
                throw new AppError("Insufficient fuel for journey", 400);
            }
            await db.collection("planes").updateOne(
                { _id: tailNumber },
                {
                    $inc: { fuel: -totalFuelBurnKg },
                    $set: {
                        whereabouts: {
                            type: "enRoute",
                            origin: plane.whereabouts.airport,
                            destination: destinationAirportId,
                            departure: Date.now(),
                        },
                    },
                },
                { session },
            );
        });
    } finally {
        await session.endSession();
    }
}

export async function refuelPlane(tailNumber, amount, userId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const plane = await db.collection("planes").findOne({ _id: tailNumber }, { session });
            if (plane.whereabouts.type !== "airport") {
                if (plane.modelId === "starship") {
                    throw new AppError("SpaceX still haven't solved on-orbit refuelling. Try again next year!", 400);
                } else {
                    throw new AppError("Plane is currently en route", 400);
                }
            }
            const model = await db.collection("planeModels").findOne({ _id: plane.modelId }, { session });
            if (plane.fuel + amount > model.maxFuel) {
                throw new AppError("Refuel amount exceeds fuel capacity", 400);
            }
            const fuelCostPerKg = 5;
            const totalCost = fuelCostPerKg * amount;
            const user = await db.collection("users").findOne({ _id: userId }, { session });
            if (user.funds < totalCost) {
                throw new AppError("Insufficient funds", 400);
            }
            await db.collection("users").updateOne({ _id: userId }, { $inc: { funds: -totalCost } }, { session });
            await db.collection("planes").updateOne({ _id: tailNumber }, { $inc: { fuel: amount } }, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function repairPlane(tailNumber, userId) {
    const session = mongoClient.startSession();
    try {
        await session.withTransaction(async () => {
            const plane = await db.collection("planes").findOne({ _id: tailNumber }, { session });
            if (plane.whereabouts.type !== "airport") {
                throw new AppError("Plane is currently en route", 400);
            }
            const repairCostPerPercent = 1000;
            const damage = 100 - plane.condition;
            const totalCost = repairCostPerPercent * damage;
            const user = await db.collection("users").findOne({ _id: userId }, { session });
            if (user.funds < totalCost) {
                throw new AppError("Insufficient funds", 400);
            }
            await db.collection("users").updateOne({ _id: userId }, { $inc: { funds: -totalCost } }, { session });
            await db.collection("planes").updateOne({ _id: tailNumber }, { $set: { condition: 100 } }, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function decommissionPlane(tailNumber) {
    await db.collection("planes").deleteOne({ _id: tailNumber });
}
