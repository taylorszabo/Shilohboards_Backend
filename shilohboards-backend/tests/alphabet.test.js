const request = require("supertest");

describe("Alphabet API Tests", () => {
    it("should return an array of letters with correct level 1 data", async () => {
        const response = await request(global.app).get("/alphabet/level1");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach((question) => {
            expect(question).toHaveProperty("level", 1);
            expect(question).toHaveProperty("letter");
            expect(question).toHaveProperty("voice");
            expect(question).toHaveProperty("object");
            expect(question).toHaveProperty("objectImage");

            expect(typeof question.letter).toBe("string");
            expect(question.letter.length).toBe(1);
            expect(/[A-Z]/.test(question.letter)).toBe(true);

            expect(typeof question.object).toBe("string");
            expect(question.object.length).toBeGreaterThan(0);

            expect(typeof question.objectImage).toBe("string");
            expect(question.objectImage.length).toBeGreaterThan(0);

            expect(typeof question.voice).toBe("string");
            expect(question.voice.length).toBeGreaterThan(0);
        });
    });

    it("should return an array of questions with three object options for level 2", async () => {
        const response = await request(global.app).get("/alphabet/level2");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const firstQuestion = response.body[0];

        expect(firstQuestion).toHaveProperty("level", 2);
        expect(firstQuestion).toHaveProperty("letter");
        expect(firstQuestion).toHaveProperty("voice");
        expect(firstQuestion).toHaveProperty("options");
        expect(Array.isArray(firstQuestion.options)).toBe(true);
        expect(firstQuestion.options.length).toBe(3);
    });

    it("should return an array of questions with four object options for level 3", async () => {
        const response = await request(global.app).get("/alphabet/level3");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const firstQuestion = response.body[0];

        expect(firstQuestion).toHaveProperty("level", 3);
        expect(firstQuestion).toHaveProperty("letter");
        expect(firstQuestion).toHaveProperty("sound");
        expect(firstQuestion).toHaveProperty("wordExample");
        expect(firstQuestion).toHaveProperty("options");
        expect(Array.isArray(firstQuestion.options)).toBe(true);
        expect(firstQuestion.options.length).toBe(4);

        // Ensure that exactly one correct answer exists
        const correctAnswers = firstQuestion.options.filter(option => option.correct);
        expect(correctAnswers.length).toBe(1);
    });

    it("should save the child's score for a given game", async () => {
        const response = await request(global.app).post("/alphabet/score").send({
            childId: "mocked_child_id",
            gameId: "test_game_123",
            level: 1,
            score: 10,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Score saved successfully");
        expect(response.body).toHaveProperty("gameId", "test_game_123");
    });


});
