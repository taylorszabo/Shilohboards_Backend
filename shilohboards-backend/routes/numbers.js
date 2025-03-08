const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

const numbersData = {
    1: { object: "Car", sound: "one.mp3", image: "1" },
    2: { object: "Shoes", sound: "two.mp3", image: "2" },
    3: { object: "Guitars", sound: "three.mp3", image: "3" },
    4: { object: "Icecreams", sound: "four.mp3", image: "4" },
    5: { object: "Stars", sound: "five.mp3", image: "5" },
    6: { object: "Eggs", sound: "six.mp3", image: "6" },
    7: { object: "Banana", sound: "seven.mp3", image: "7" },
    8: { object: "Crayons", sound: "eight.mp3", image: "8" },
    9: { object: "Spoons", sound: "nine.mp3", image: "9" },
    10: { object: "Apples", sound: "ten.mp3", image: "10" },
    11: { object: "Jellyfish", sound: "eleven.mp3", image: "11" },
    12: { object: "Hats", sound: "twelve.mp3", image: "12" },
    13: { object: "Balloons", sound: "thirteen.mp3", image: "13" },
    14: { object: "Socks", sound: "fourteen.mp3", image: "14" },
    15: { object: "Trees", sound: "fifteen.mp3", image: "15" },
    16: { object: "Penguins", sound: "sixteen.mp3", image: "16" },
    17: { object: "Shells", sound: "seventeen.mp3", image: "17" },
    18: { object: "Candy", sound: "eighteen.mp3", image: "18" },
    19: { object: "Books", sound: "nineteen.mp3", image: "19" },
    20: { object: "Cupcakes", sound: "twenty.mp3", image: "20" },
};

const allNumbers = Object.keys(numbersData).map(Number);

router.get("/level1", (req, res) => {
    const questions = allNumbers.map((letter) => {
        return {
            level: 1,
            letter,
            voice: `assets/Numbers/Images/Audio/AppleSound.mp3`,
            object: numbersData[letter].object,
            objectImage: numbersData[letter].image
        };
    });

    res.json(questions);
});

router.get("/level2", (req, res) => {
    const shuffledNumbers = allNumbers.sort(() => Math.random() - 0.5);

    const questions = shuffledNumbers.map(number => {
        const correctImage = numbersData[number].image;

        let incorrectNumbers = allNumbers
            .filter((n) => n !== number)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(n => ({
                number: n,
                image: numbersData[n].image,
                correct: false
            }));

        return {
            level: 2,
            number,
            voice: `assets/Numbers/Audio/${number}Sound.mp3`,
            options: [
                { number, image: correctImage, correct: true },
                ...incorrectNumbers
            ].sort(() => Math.random() - 0.5)
        };
    });

    res.json(questions);
});

router.post("/score", async (req, res) => {
    try {
        const { childId, level, score, gameId } = req.body;

        if (!childId || !level || score === undefined || !gameId) {
            return res.status(400).json({ error: "Invalid request data" });
        }

        const scoreRef = db.collection("numberScores").doc(childId);
        const doc = await scoreRef.get();

        if (!doc.exists) {
            await scoreRef.set({ childId, scores: {} });
        }

        await scoreRef.collection("games").doc(gameId).set({
            level,
            score,
            timestamp: new Date(),
        });

        return res.status(200).json({ message: "Score saved successfully", gameId });
    } catch (error) {
        console.error("Error saving score:", error);
        return res.status(500).json({ error: "Failed to save score" });
    }
});

router.get("/score/:childId", async (req, res) => {
    try {
        const { childId } = req.params;
        const scoreRef = db.collection("numberScores").doc(childId);
        const doc = await scoreRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Child not found" });
        }

        const gamesSnapshot = await scoreRef.collection("games").get();
        const games = gamesSnapshot.docs.map(doc => ({ gameId: doc.id, ...doc.data() }));

        return res.status(200).json({ childId, games });
    } catch (error) {
        console.error("Error retrieving scores:", error);
        return res.status(500).json({ error: "Failed to retrieve scores" });
    }
});


module.exports = router;

