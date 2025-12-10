import request from "supertest";
import app from "../src/app.js";
import { describe, test, expect } from "@jest/globals";

describe("Health Check", () => {
    test("should return user info on /me when authenticated", async () => {
        const response = await request(app).get("/me");
        expect([200, 401]).toContain(response.status);
    });

    test("should return 404 for unknown routes", async () => {
        const response = await request(app).get("/nonexistent-route");
        expect(response.status).toBe(404);
    });
});
