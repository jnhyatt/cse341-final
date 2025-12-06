import { db } from "../config/db.js";

export async function getAirports(_req, res) {
    res.json(await db.collection("airports").find({}).toArray());
}

export async function getAirportById(req, res) {
    const result = await db.collection("airports").findOne({ _id: req.params.id });
    if (!result) {
        return res.status(404).send("Airport not found");
    }
    res.json(result);
}
