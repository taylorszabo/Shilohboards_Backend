const request = require("supertest");

jest.mock("firebase-admin");

const app = require("../index");

describe("API Tests", () => {
    it("should create a parent user", async () => {
        const response = await request(app).post("/create-parent").send({
            email: "testparent@example.com",
            password: "testpassword",
        });


        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("userId");
    });

    it("should create a child user", async () => {
        const response = await request(app).post("/create-child").send({
            parentId: "mocked_parent_id",
            displayName: "Test Child",
            characterId: "character_1",
        });


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

const mockLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const mockAlphabetData = {};
mockLetters.forEach((letter) => {
    mockAlphabetData[letter] = {
        object: `Object-${letter}`,
        sound: `${letter.toLowerCase()}.mp3`,
        image: `${letter.toLowerCase()}.png`,
    };
});

global.allLetters = mockLetters;
global.alphabetData = mockAlphabetData;

describe("Alphabet API Tests", () => {
    it("should return a random letter with correct level 1 data", async () => {
        const response = await request(app).get("/alphabet/level1");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 1);
        expect(mockLetters).toContain(response.body.letter);
        expect(response.body).toHaveProperty("voice");
        expect(response.body).toHaveProperty("object");
        expect(response.body).toHaveProperty("objectVoice");
        expect(response.body).toHaveProperty("objectImage");
    });

    it("should return letter with three object options for level 2", async () => {
        const response = await request(app).get("/alphabet/level2");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 2);
        expect(mockLetters).toContain(response.body.letter);
        expect(response.body).toHaveProperty("voice");
        expect(response.body).toHaveProperty("options");
        expect(Array.isArray(response.body.options)).toBe(true);
        expect(response.body.options.length).toBe(3);
        expect(response.body.options.some(opt => opt.correct)).toBe(true);
    });


    it("should return a sound and letter options for level 3", async () => {
        const response = await request(app).get("/alphabet/level3");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 3);
        expect(response.body).toHaveProperty("sound");
        expect(response.body).toHaveProperty("wordExample");
        expect(response.body).toHaveProperty("options");
        expect(Array.isArray(response.body.options)).toBe(true);
        expect(response.body.options.length).toBe(4);
        expect(response.body.options.some(opt => opt.correct)).toBe(true);
    });

    it("should update the child's score", async () => {
        const response = await request(app).post("/alphabet/score").send({
            childId: "child_id",
            level: 1,
            scoreChange: 10,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("childId", "child_id");
        expect(response.body.scores).toHaveProperty("level1", 10);
    });

    it("should return 400 error for invalid score update data", async () => {
        const response = await request(app).post("/alphabet/score").send({
            childId: "",
            level: "",
            scoreChange: "not_a_number",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid request data");
    });

    test("Should retrieve the child's scores", async () => {
        const response = await request(app).get("/alphabet/score/mocked_child_id");


        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty("childId", "mocked_child_id");

        expect(response.body).toHaveProperty("scores");

        expect(response.body.scores).toHaveProperty("level1", 0);
        expect(response.body.scores).toHaveProperty("level2", 0);
        expect(response.body.scores).toHaveProperty("level3", 0);
    });


    it("should return 404 if child does not exist", async () => {
        const response = await request(app).get("/alphabet/score/non_existent_child");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Child not found");
    });
});

const mockNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
const mockNumbersData = {};
mockNumbers.forEach((num) => {
    mockNumbersData[num] = {
        object: `Object-${num}`,
        sound: `number${num}.mp3`,
        image: `number${num}.png`,
    };
});

global.allNumbers = mockNumbers;
global.numbersData = mockNumbersData;

describe("Numbers API Tests", () => {
    it("should return a random number with correct level 1 data", async () => {
        const response = await request(app).get("/numbers/level1");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 1);
        expect(mockNumbers).toContain(response.body.number);
        expect(response.body).toHaveProperty("voice");
        expect(response.body).toHaveProperty("object");
        expect(response.body).toHaveProperty("objectVoice");
        expect(response.body).toHaveProperty("objectImage");
    });

    it("should return a number with three options for level 2", async () => {
        const response = await request(app).get("/numbers/level2");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level", 2);
        expect(response.body).toHaveProperty("objectImage");
        expect(response.body).toHaveProperty("options");
        expect(Array.isArray(response.body.options)).toBe(true);
        expect(response.body.options.length).toBe(3);
        expect(response.body.options.some(opt => opt.correct)).toBe(true);
    });

    it("should update the child's number score", async () => {
        const response = await request(app).post("/numbers/score").send({
            childId: "mocked_child_id",
            level: 1,
            scoreChange: 10,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("childId", "mocked_child_id");
        expect(response.body.scores).toHaveProperty("level1", 10);
    });

    it("should return 400 error for invalid score update data", async () => {
        const response = await request(app).post("/numbers/score").send({
            childId: "",
            level: "",
            scoreChange: "not_a_number",
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid request data");
    });

    it("should retrieve the child's number score", async () => {
        const response = await request(app).get("/numbers/score/mocked_child_id");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("level1");
        expect(response.body).toHaveProperty("level2");
    });

    it("should return 404 if child does not exist", async () => {
        const response = await request(app).get("/numbers/score/non_existent_child");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Child not found");
    });
});


