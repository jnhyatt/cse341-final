import { gameTick, shouldTick, updateLastTickTime } from "../services/gameTick.js";

export function performGameTicks(req, res, next) {
    const currentTime = Date.now();
    if (shouldTick(currentTime)) {
        gameTick();
        updateLastTickTime(currentTime);
    }
    next();
}
