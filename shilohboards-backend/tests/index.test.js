const request = require("supertest");

jest.mock("firebase-admin");

const app = require("../index");

describe("API Tests", () => {
    it("should create a parent user", async () => {
        const response = await request(app).post("/create-parent").send({
            email: "testparent@example.com",
            password: "testpassword"
        });

        console.log(response.body);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("userId", "mocked_uid");
    });

    it("should create a child user", async () => {
        const response = await request(app).post("/create-child").send({
            parentId: "mocked_uid",
            displayName: "Shiloh",
            characterId: "character_1"
        });

        console.log(response.body);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("childId");
    });

    it("should return an error when creating a parent with invalid data", async () => {
        const response = await request(app).post("/create-parent").send({
            email: "",
            password: "",
        });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error");
    });

    it("should return a list of users", async () => {
        const response = await request(app).get("/users");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty("email", "mockuser@example.com");
    });

    it("should return a list of children", async () => {
        const response = await request(app).get("/children");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return an error for invalid login token", async () => {
        const response = await request(app).post("/login").send({
            idToken: "invalid_token",
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Invalid token");
    });

    it("should return login success for valid token", async () => {
        const response = await request(app).post("/login").send({
            idToken: "valid_token",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("uid", "mocked_uid");
    });

    it("should return default values if no query parameters are provided", async () => {
        const response = await request(app).get("/game-over");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Game Complete!");
        expect(response.body).toHaveProperty("gameType", "unknown");
        expect(response.body).toHaveProperty("level", 1);
        expect(response.body).toHaveProperty("score");
        expect(response.body).toHaveProperty("accuracy");
        expect(response.body).toHaveProperty("rewardsEarned");
        expect(Array.isArray(response.body.rewardsEarned)).toBe(true);
    });

    it("should return the correct gameType and level from query params", async () => {
        const response = await request(app).get("/game-over").query({
            gameType: "puzzle",
            level: 5
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("gameType", "puzzle");
        expect(response.body).toHaveProperty("level", "5");
    });

    it("should generate a valid score and accuracy", async () => {
        const response = await request(app).get("/game-over");

        expect(response.status).toBe(200);
        expect(response.body.score).toBeGreaterThanOrEqual(0);
        expect(response.body.score).toBeLessThanOrEqual(100);

        // Check accuracy format
        expect(typeof response.body.accuracy).toBe("string");
        expect(response.body.accuracy).toMatch(/^\d+\.\d{2}%$/);
    });

    it("should include rewardsEarned array with 'Star'", async () => {
        const response = await request(app).get("/game-over");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("rewardsEarned");
        expect(Array.isArray(response.body.rewardsEarned)).toBe(true);
        expect(response.body.rewardsEarned).toContain("Star");
    });
});
