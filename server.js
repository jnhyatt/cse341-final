import app from "./src/app.js";
import { mongoClient } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

// Gracefully close MongoDB connection on server shutdown (ctrl+C). Note to self: at least in
// Git Bash on Windows in VS Code's integrated terminal, running `npm start` launches `node` as a
// child process, so the SIGINT gets sent to `npm`, *not* `node`. This means this handler never gets
// called and `node` never exists. The most cursed thing is once we hit this state, every time we
// re-run `npm start`, we add another handler to the pile, so when we ctrl+c again, we get the
// "Closing MongoDB connection..." message *twice*. `npm start` + ctrl+c again, *three times!!!*
// These stack until we hit the maximum number of handlers, at which point we see a weird warning.
// At any rate, the fix for anyone who sees that behavior is to run `npm set script-shell bash` so
// SIGINT gets propagated correctly. That's an hour of my life I'm never going to get back.
process.on("SIGINT", async () => {
    console.log("\nClosing MongoDB connection...");
    await mongoClient.close();
    server.close(() => process.exit(0));
});
