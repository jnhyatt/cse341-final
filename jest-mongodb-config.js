export default {
    mongodbMemoryServerOptions: {
        binary: {
            version: "6.0.5",
            skipMD5: true,
        },
        autoStart: false,
        instance: {},
    },
    useSharedDBForAllJestWorkers: true,
};
