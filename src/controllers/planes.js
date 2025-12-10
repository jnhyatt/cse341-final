import { db } from "../config/db.js";
import {
    getAllPlanes,
    purchasePlane as purchasePlaneService,
    upgradePlane as upgradePlaneService,
    embarkPlane as embarkPlaneService,
    refuelPlane as refuelPlaneService,
    repairPlane as repairPlaneService,
    decommissionPlane,
} from "../services/planeService.js";

export async function getPlanes(req, res) {
    const { limit, page } = req.validatedQuery;
    res.json(await getAllPlanes((page - 1) * limit, limit));
}

export async function getPlaneById(req, res) {
    const result = await db.collection("planes").findOne({ _id: req.params.id });
    if (!result) {
        return res.status(404).send("Plane not found");
    }
    res.json(result);
}

export async function purchasePlane(req, res) {
    await purchasePlaneService(req.body.tailNumber, req.body.model, req.body.airport, req.user._id);
    res.status(201).json({ message: "Plane purchased successfully" });
}

export async function upgradePlane(req, res) {
    await upgradePlaneService(req.params.id, req.user._id);
    res.json({ message: "Plane upgraded successfully" });
}

export async function embarkPlane(req, res) {
    await embarkPlaneService(req.params.id, req.body.destinaion);
    res.json({ message: "Plane embarked successfully" });
}

export async function refuelPlane(req, res) {
    await refuelPlaneService(req.params.id, req.body.amount, req.user._id);
    res.json({ message: "Plane refueled successfully" });
}

export async function repairPlane(req, res) {
    await repairPlaneService(req.params.id, req.user._id);
    res.json({ message: "Plane repaired successfully" });
}

export async function deletePlane(req, res) {
    await decommissionPlane(req.params.id, req.user._id);
    res.json({ message: "Plane decommissioned successfully" });
}
