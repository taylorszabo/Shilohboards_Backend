const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

const numbersData = {
    1: { object: "Car", sound: "one.mp3", image: "one-car.png" },
    2: { object: "Shoes", sound: "two.mp3", image: "two-shoes.png" },
    3: { object: "Guitars", sound: "three.mp3", image: "three-guitars.png" },
    4: { object: "Icecreams", sound: "four.mp3", image: "four-icecreams.png" },
    5: { object: "Stars", sound: "five.mp3", image: "five-stars.png" },
    6: { object: "Eggs", sound: "six.mp3", image: "six-eggs.png" },
    7: { object: "Banana", sound: "seven.mp3", image: "seven-bananas.png" },
    8: { object: "Crayons", sound: "eight.mp3", image: "eight-crayons.png" },
    9: { object: "Spoons", sound: "nine.mp3", image: "nine-spoons.png" },
    10: { object: "Apples", sound: "ten.mp3", image: "ten-apples.png" },
    11: { object: "Jellyfish", sound: "eleven.mp3", image: "eleven-jellyfish.png" },
    12: { object: "Hats", sound: "twelve.mp3", image: "twelve-hats.png" },
    13: { object: "Balloons", sound: "thirteen.mp3", image: "thirteen-balloons.png" },
    14: { object: "Socks", sound: "fourteen.mp3", image: "fourteen-socks.png" },
    15: { object: "Trees", sound: "fifteen.mp3", image: "fifteen-trees.png" },
    16: { object: "Penguins", sound: "sixteen.mp3", image: "sixteen-penguins.png" },
    17: { object: "Shells", sound: "seventeen.mp3", image: "seventeen-shells.png" },
    18: { object: "Candy", sound: "eighteen.mp3", image: "eighteen-candies.png" },
    19: { object: "Books", sound: "nineteen.mp3", image: "nineteen-books.png" },
    20: { object: "Cupcakes", sound: "twenty.mp3", image: "twenty-cupcakes.png" },
};

const allNumbers = Object.keys(numbersData).map(Number);

router.get("/level1", (req, res) => {
    const number = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    const { object, sound, image } = numbersData[number];

    res.json({
        level: 1,
        number,
        voice: `/audio/numbers/${sound}`,
        object,
        objectVoice: `/audio/objects/${sound}`,
        objectImage: `/images/objects/${image}`,
    });
});

router.get("/level2", (req, res) => {
    const number = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    const correctImage = numbersData[number].image;

    let incorrectNumbers = allNumbers
        .filter((n) => n !== number)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    res.json({
        level: 2,
        objectImage: `/images/objects/${correctImage}`,
        options: [
            { number, correct: true },
            ...incorrectNumbers.map((n) => ({ number: n, correct: false })),
        ].sort(() => Math.random() - 0.5),
    });
});

router.post("/score", async (req, res) => {
    try {
        const { childId, level, scoreChange } = req.body;

        if (!childId || !level || typeof scoreChange !== "number") {
            return res.status(400).json({ error: "Invalid request data" });
        }

        const childRef = db.collection("childScores").doc(childId);
        const childDoc = await childRef.get();

        let scores = { level1: 0, level2: 0 };

        if (childDoc.exists) {
            scores = childDoc.data().numbersScores || scores;
        }

        scores[`level${level}`] = (scores[`level${level}`] || 0) + scoreChange;

        await childRef.set({ childId, numbersScores: scores }, { merge: true });

        res.json({ childId, scores });
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/score/:childId", async (req, res) => {
    try {
        const { childId } = req.params;
        const childRef = db.collection("childScores").doc(childId);
        const childDoc = await childRef.get();

        if (!childDoc.exists) {
            return res.status(404).json({ error: "Child not found" });
        }

        res.json(childDoc.data().numbersScores || { level1: 0, level2: 0 });
    } catch (error) {
        console.error("Error retrieving score:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

