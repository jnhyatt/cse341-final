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

export function requireOwnership(collection) {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const resource = await db.collection(collection).findOne({ _id: resourceId });

            if (!resource) {
                return res.status(404).send(`${collection.slice(0, -1)} not found`);
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
    };
}
