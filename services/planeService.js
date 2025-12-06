import { db } from "../config/db.js";

export async function getAllPlanes() {
    return await db.collection("planes").find({}).toArray();
}

export async function getPlaneByTailNumber(tailNumber) {
    return await db.collection("planes").findOne({ _id: tailNumber });
}

export async function createPlane(_tailNumber, _modelId, _airportId, _userId) {
    // TODO
    // - Fetch plane model to get cost, check user has sufficient funds
    // - Deduct cost from user's funds
    // - Create plane document with initial state using supplied tail number
    throw new Error("Not implemented");
}

export async function upgradePlane(_tailNumber, _userId) {
    // TODO
    // - Check plane exists and user owns it
    // - Check upgrade level < 3
    // - Calculate upgrade cost
    // - Deduct cost from user's funds
    // - Increment upgradeLevel
    throw new Error("Not implemented");
}

export async function embarkPlane(_tailNumber, _destinationAirportId, _userId) {
    // TODO
    // - Check plane exists and user owns it
    // - Check plane is at airport (not already enRoute)
    // - Check destination != current location
    // - Calculate fuel required for journey
    // - Check plane has sufficient fuel
    // - Update plane whereabouts to enRoute with departure time
    throw new Error("Not implemented");
}

export async function refuelPlane(_tailNumber, _amount, _userId) {
    // TODO
    // - Check plane exists and user owns it
    // - Check plane is at airport (not enRoute)
    // - Check amount + current fuel <= max fuel capacity
    // - Calculate fuel cost
    // - Deduct cost from user's funds
    // - Add fuel to plane
    throw new Error("Not implemented");
}

export async function repairPlane(_tailNumber, _userId) {
    // TODO
    // - Check plane exists and user owns it
    // - Calculate repair cost based on damage
    // - Deduct cost from user's funds
    // - Set condition to 100
    throw new Error("Not implemented");
}

export async function decommissionPlane(_tailNumber, _userId) {
    // TODO
    // - Check plane exists and user owns it
    // - Delete plane from database
    // - No refund given
    throw new Error("Not implemented");
}
