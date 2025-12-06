import { db } from "../config/db.js";

export async function getAirports(req, res) {
    const { limit, page } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const airports = await db
        .collection("airports")
        .find({})
        // MongoDB doesn't guarantee stable ordering even between similar queries, so we add a
        // consistent sort. We'll choose the ICAO code so they'll be returned alphabetically.
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    res.json(airports);
}

export async function getAirportById(req, res) {
    const result = await db.collection("airports").findOne({ _id: req.params.id });
    if (!result) {
        return res.status(404).send("Airport not found");
    }
    res.json(result);
}

export async function getNearbyAirports(req, res) {
    const centerAirport = await db.collection("airports").findOne({ _id: req.params.id });
    if (!centerAirport) {
        return res.status(404).send("Airport not found");
    }

    const radius = parseInt(req.validatedQuery.radius);
    const limit = parseInt(req.validatedQuery.limit);
    const page = parseInt(req.validatedQuery.page);
    const skip = (page - 1) * limit;

    const nearbyAirports = await db
        .collection("airports")
        .find({
            _id: { $ne: req.params.id }, // Exclude the center airport itself
            location: {
                $near: {
                    $geometry: centerAirport.location,
                    $maxDistance: radius,
                },
            },
        })
        .skip(skip)
        .limit(limit)
        .toArray();

    res.json(nearbyAirports);
}
