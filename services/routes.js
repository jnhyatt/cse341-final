import { db } from "../config/db.js";

// Compute the arrival time of a plane based on its model and whereabouts. `plane` is a document ID.
export async function arrivalTime(enRoute, speed) {
    const origin = await db.collection("airports").findOne({ code: enRoute.origin });
    const destination = await db.collection("airports").findOne({ code: enRoute.destination });
    const distance = distanceBetween(
        { lat: origin.latitude, long: origin.longitude },
        { lat: destination.latitude, long: destination.longitude },
    );
    const travelTimeMs = (distance / speed) * 1000 * 60 * 60;
    return enRoute.departure + travelTimeMs;
}

function distanceBetween(originLatLong, destinationLatLong) {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((destinationLatLong.lat - originLatLong.lat) * Math.PI) / 180;
    const dLon = ((destinationLatLong.long - originLatLong.long) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((originLatLong.lat * Math.PI) / 180) *
            Math.cos((destinationLatLong.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
