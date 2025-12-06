import { db } from "../config/db.js";

export async function createUser(name, oauthId) {
    const newUser = {
        _id: oauthId,
        name,
        funds: 100000,
    };
    await db.collection("users").insertOne(newUser);
}
