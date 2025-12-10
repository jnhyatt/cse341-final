import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Use test database URI if in test environment
const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
const dbName = process.env.MONGO_URI_TEST ? "test" : "planes";

const client = new MongoClient(mongoUri, {
    serverApi: process.env.MONGO_URI_TEST
        ? undefined
        : {
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

const db = client.db(dbName);

export { db, client as mongoClient };
