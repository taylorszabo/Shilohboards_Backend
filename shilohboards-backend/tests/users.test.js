const request = require("supertest");

describe("Users API Tests", () => {
    it("should create a parent user", async () => {
        const response = await request(global.app).post("/users/create-parent").send({
            email: "testparent@example.com",
            password: "testpassword",
        });

        console.log("Response Status:", response.status);
        console.log("Response Body:", response.body);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("userId");
    });

    it("should return a list of users", async () => {
        const response = await request(global.app).get("/users");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return an error for invalid login token", async () => {
        const response = await request(global.app).post("/users/login").send({
            idToken: "invalid_token",
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Invalid token");
    });

    it("should return login success for valid token", async () => {
        const response = await request(global.app).post("/users/login").send({
            idToken: "valid_token",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("uid", "mocked_uid");
    });
});
