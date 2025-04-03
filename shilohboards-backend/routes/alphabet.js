const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

const alphabetData = {
    A: { object: "Apple", sound: "a.mp3", image: "A"},
    B: { object: "Balloon", sound: "b.mp3", image: "B"},
    C: { object: "Car", sound: "c.mp3", image: "C"},
    D: { object: "Drum", sound: "d.mp3", image: "D"},
    E: { object: "Egg", sound: "e.mp3", image: "E"},
    F: { object: "Flower", sound: "f.mp3", image: "F"},
    G: { object: "Guitar", sound: "g.mp3", image: "G"},
    H: { object: "Hotdog", sound: "h.mp3", image: "H"},
    I: { object: "Igloo", sound: "i.mp3", image: "I"},
    J: { object: "Jelly", sound: "j.mp3", image: "J"},
    K: { object: "Kite", sound: "k.mp3", image: "K"},
    L: { object: "Leaf", sound: "l.mp3", image: "L"},
    M: { object: "Moon", sound: "m.mp3", image: "M"},
    N: { object: "Nest", sound: "n.mp3", image: "N"},
    O: { object: "Orange", sound: "o.mp3", image: "O"},
    P: { object: "Penguin", sound: "p.mp3", image: "P"},
    Q: { object: "Queen", sound: "q.mp3", image: "Q"},
    R: { object: "Rainbow", sound: "r.mp3", image: "R"},
    S: { object: "Sun", sound: "s.mp3", image: "S"},
    T: { object: "Tree", sound: "t.mp3", image: "T"},
    U: { object: "Umbrella", sound: "u.mp3", image: "U"},
    V: { object: "Violin", sound: "v.mp3", image: "V"},
    W: { object: "Whale", sound: "w.mp3", image: "W"},
    X: { object: "Xray", sound: "x.mp3", image: "X"},
    Y: { object: "Yarn", sound: "y.mp3", image: "Y"},
    Z: { object: "Zipper", sound: "z.mp3", image: "Z"},
};

const allLetters = Object.keys(alphabetData);

router.get("/level1", (req, res) => {
    const questions = allLetters.map((letter) => {
        return {
            level: 1,
            letter,
            voice: `assets/Alphabet/Images/Audio/AppleSound.mp3`,
            object: alphabetData[letter].object,
            objectImage: alphabetData[letter].image
        };
    });
    res.json(questions);
});

router.get("/level2", (req, res) => {
    const shuffledLetters = shuffleArray(allLetters); // Shuffle once for randomness

    const questions = shuffledLetters.map(letter => {
        const correctObject = alphabetData[letter].object;
        const correctImage = alphabetData[letter].image;

        let incorrectObjects = shuffleArray(
            allLetters
                .filter((l) => l !== letter) // Exclude correct answer
        ).slice(0, 2) // Pick 2 incorrect options
            .map((l) => ({
                object: alphabetData[l].object,
                image: alphabetData[l].image,
                correct: false,
            }));

        return {
            level: 2,
            letter,
            voice: `assets/Alphabet/Images/Audio/${letter}Sound.mp3`,
            options: shuffleArray([
                { object: correctObject, image: correctImage, correct: true },
                ...incorrectObjects,
            ]),
        };
    });

    res.json(questions);
});

function shuffleArray(array) {
    return array
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
}

router.get("/level3", (req, res) => {
    const questions = allLetters.map((letter) => {
        const incorrectAnswers = shuffleArray(
            allLetters.filter((l) => l !== letter)
        ).slice(0, 3);

        const options = [
            ...incorrectAnswers.map((l) => ({
                object: alphabetData[l].object,
                image: alphabetData[l].image,
                correct: false,
            })),
            {
                object: alphabetData[letter].object,
                image: alphabetData[letter].image,
                correct: true,
            },
        ];

        return {
            level: 3,
            letter,
            sound: `assets/Alphabet/Audio/${letter}Sound.mp3`,
            wordExample: alphabetData[letter].object,
            options: shuffleArray(options),
        };
    });

    res.json(shuffleArray(questions));
});

router.post("/score", async (req, res) => {
    try {
        const { childId, level, score, gameId } = req.body;

        if (!childId || !level || score === undefined || !gameId) {
            return res.status(400).json({ error: "Invalid request data" });
        }

        const scoreRef = db.collection("alphabetScores").doc(childId);
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
        const scoreRef = db.collection("alphabetScores").doc(childId);
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