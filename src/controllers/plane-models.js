import { db } from "../config/db.js";

export async function getPlaneModels(req, res) {
    res.json(await db.collection("plane-models").find({}).toArray());
}

export async function getPlaneModelById(req, res) {
    const result = await db.collection("plane-models").findOne({ _id: req.params.id });
    if (!result) {
        return res.status(404).send("Plane model not found");
    }
    res.json(result);
}
