import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongoServer;

export default async function globalSetup() {
    mongoServer = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: "wiredTiger",
        },
        binary: {
            version: "6.0.5",
            skipMD5: true,
        },
    });

    const uri = mongoServer.getUri();
    global.__MONGOINSTANCE__ = mongoServer;
    process.env.MONGO_URI_TEST = uri;

    console.log(`MongoDB Memory Server started at ${uri}`);
}
