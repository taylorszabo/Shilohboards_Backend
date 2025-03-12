const request = require("supertest");

describe("Numbers API Tests", () => {
    it("should return an array of numbers with correct level 1 data", async () => {
        const response = await request(global.app).get("/numbers/level1");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach((question) => {
            expect(question).toHaveProperty("level", 1);
            expect(question).toHaveProperty("letter");
            expect(question).toHaveProperty("voice");
            expect(question).toHaveProperty("object");
            expect(question).toHaveProperty("objectImage");

            expect(typeof question.letter).toBe("number");
            expect(/[0-9]/.test(question.letter)).toBe(true);

            expect(typeof question.object).toBe("string");
            expect(question.object.length).toBeGreaterThan(0);

            expect(typeof question.objectImage).toBe("string");
            expect(question.objectImage.length).toBeGreaterThan(0);

            expect(typeof question.voice).toBe("string");
            expect(question.voice.length).toBeGreaterThan(0);
        });
    });

    it("should return an array of questions with three number options for level 2", async () => {
        const response = await request(global.app).get("/numbers/level2");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const firstQuestion = response.body[0];

        expect(firstQuestion).toHaveProperty("level", 2);
        expect(firstQuestion).toHaveProperty("number");
        expect(firstQuestion).toHaveProperty("voice");
        expect(firstQuestion).toHaveProperty("options");

        expect(typeof firstQuestion.number).toBe("number");
        expect(/[0-9]/.test(firstQuestion.number)).toBe(true);

        expect(typeof firstQuestion.voice).toBe("string");
        expect(firstQuestion.voice.length).toBeGreaterThan(0);

        expect(Array.isArray(firstQuestion.options)).toBe(true);
        expect(firstQuestion.options.length).toBe(3);
    });

    it("should update the child's number score", async () => {
        const response = await request(global.app).post("/numbers/score").send({
            childId: "mocked_child_id",
            gameId: "test_game_123",
            level: 1,
            score: 10,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("gameId", "test_game_123");
    });
});
