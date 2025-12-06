import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await client.connect();
    console.log("Connected to MongoDB");
} catch (e) {
    console.error(e);
    await client.close();
    process.exit(1);
}

const db = client.db("planes");

export { db, client as mongoClient };
