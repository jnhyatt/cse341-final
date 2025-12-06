import { db } from "../config/db.js";
import { createUser } from "../services/createUser.js";

export async function handleCallback(req, res) {
    try {
        // Check if user exists, create if not
        const existingUser = await db.collection("users").findOne({ _id: req.user.id });
        if (!existingUser) {
            await createUser(req.user.displayName || "Player", req.user.id);
        }
        res.redirect("/me");
    } catch (err) {
        console.error("Error creating user:", err);
        res.redirect("/me");
    }
}

export function logout(req, res) {
    req.logout(() => {
        res.redirect("/me");
    });
}
