import { tickCatchup } from "../services/gameTick.js";

export function performGameTicks(req, res, next) {
    tickCatchup(Date.now());
    next();
}
