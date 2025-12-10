import { db } from "../config/db.js";

export async function updateUser(req, res, next) {
    try {
        const result = await db
            .collection("users")
            .updateOne({ _id: req.params.id }, { $set: { name: req.body.name } });

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.send("User updated");
    } catch (err) {
        next(err);
    }
}

export async function getUserById(req, res, next) {
    try {
        const user = await db.collection("users").findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const result = await db.collection("users").deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.send("User deleted");
    } catch (err) {
        next(err);
    }
}
