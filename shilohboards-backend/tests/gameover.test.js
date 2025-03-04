const request = require("supertest");

describe("Game Over API Tests", () => {
    it("should return default values if no query parameters are provided", async () => {
        const response = await request(global.app).get("/gameover");

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
        const response = await request(global.app).get("/gameover").query({
            gameType: "puzzle",
            level: 5
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("gameType", "puzzle");
        expect(response.body).toHaveProperty("level", "5");
    });
});
