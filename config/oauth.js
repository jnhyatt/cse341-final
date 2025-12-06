import { db } from "./db.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createUser } from "../services/createUser.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: "222110725196-gc18d9ev95r9oq4gtnhm2rn85d53hr1t.apps.googleusercontent.com",
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            callbackURL: "/auth/callback",
        },
        async function (_accessToken, _refreshToken, profile, done) {
            try {
                let user = await db.collection("users").findOne({ _id: profile.id });

                if (!user) {
                    await createUser(profile.displayName || "Player", profile.id);
                    user = await db.collection("users").findOne({ _id: profile.id });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.collection("users").findOne({ _id: id });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
