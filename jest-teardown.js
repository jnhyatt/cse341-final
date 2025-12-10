export default async function globalTeardown() {
    const instance = global.__MONGOINSTANCE__;
    if (instance) {
        await instance.stop();
    }
}
