import { db } from "./db.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: "222110725196-gc18d9ev95r9oq4gtnhm2rn85d53hr1t.apps.googleusercontent.com",
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            callbackURL: "/auth/callback",
        },
        async function (accessToken, refreshToken, profile, done) {
            // In a typical OAuth2 flow, we need to fetch the user profile
            // using the access token. This depends on your OAuth provider.
            try {
                // Fetch user info from the OAuth provider
                const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    return done(new Error("Failed to fetch user info"));
                }

                let user = await db.collection("users").findOne({ _id: profile.id });

                if (!user) {
                    user = {
                        _id: profile.id,
                        handle: "placeholder_handle",
                        bookmarkedPosts: [],
                        following: [],
                    };
                    await db.collection("users").insertOne(user);
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
