// server/src/routes/__tests__/auth.integration.test.js
//
// Integration test: registration and login

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await prisma.$disconnect();
});

test("a user who registers can then log in with the same credentials (US-01, US-02)", async () => {
    // register a real user
    const registerRes = await request(app)
        .post("/api/auth/register")
        .send({ email: "alice@example.com", displayName: "Alice", password: "correcthorse" });

    expect(registerRes.status).toBe(201);
    const registeredUser = registerRes.body.user;

    // log in with the same email and password
    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "correcthorse" });

    // login succeeds and identifies the same user
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
    expect(loginRes.body.user.id).toBe(registeredUser.id);
    expect(loginRes.body.user.email).toBe("alice@example.com");
});