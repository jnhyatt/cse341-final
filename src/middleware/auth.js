import { db } from "../config/db.js";

export function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized: Please log in");
    }
    next();
}

export function requireSelf(req, res, next) {
    const id = req.params.id;
    if (id !== req.user._id) {
        return res.status(403).send("Forbidden: You can only modify your own resources");
    }
    next();
}

export async function requirePlaneOwnership(req, res, next) {
    try {
        const resource = await db.collection("planes").findOne({ _id: req.params.id });

        if (!resource) {
            return res.status(404).send("plane not found");
        }

        if (resource.owner !== req.user._id) {
            return res.status(403).send("Forbidden: You can only modify your own resources");
        }

        // Attach resource to request for use in controller
        req.resource = resource;
        next();
    } catch (err) {
        next(err);
    }
}
