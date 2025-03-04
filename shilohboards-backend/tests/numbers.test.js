const request = require("supertest");

describe("Numbers API Tests", () => {
    it("should return a random number with correct level 1 data", async () => {
        const response = await request(global.app).get("/numbers/level1");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 1);
        expect(response.body).toHaveProperty("number");
    });

    it("should return a number with three options for level 2", async () => {
        const response = await request(global.app).get("/numbers/level2");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 2);
        expect(response.body.options.length).toBe(3);
    });

    it("should update the child's number score", async () => {
        const response = await request(global.app).post("/numbers/score").send({
            childId: "mocked_child_id",
            level: 1,
            scoreChange: 10,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("childId", "mocked_child_id");
        expect(response.body.scores).toHaveProperty("level1", 10);
    });
});
