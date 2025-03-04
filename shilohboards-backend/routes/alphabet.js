const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

const alphabetData = {
    A: { object: "Apple", sound: "a.mp3", image: "Apple.png"},
    B: { object: "Balloon", sound: "b.mp3", image: "Balloon.png"},
    C: { object: "Car", sound: "c.mp3", image: "Car.png"},
    D: { object: "Drum", sound: "d.mp3", image: "Drum.png"},
    E: { object: "Egg", sound: "e.mp3", image: "Egg.png"},
    F: { object: "Flower", sound: "f.mp3", image: "Flower.png"},
    G: { object: "Guitar", sound: "g.mp3", image: "Guitar.png"},
    H: { object: "Hotdog", sound: "h.mp3", image: "Hotdog.png"},
    I: { object: "Igloo", sound: "i.mp3", image: "Igloo.png"},
    J: { object: "Jam", sound: "j.mp3", image: "Jam.png"},
    K: { object: "Kite", sound: "k.mp3", image: "Kite.png"},
    L: { object: "Leaf", sound: "l.mp3", image: "Leaf.png"},
    M: { object: "Moon", sound: "m.mp3", image: "Moon.png"},
    N: { object: "Nest", sound: "n.mp3", image: "Nest.png"},
    O: { object: "Orange", sound: "o.mp3", image: "Orange.png"},
    P: { object: "Penguin", sound: "p.mp3", image: "Penguin.png"},
    Q: { object: "Queen", sound: "q.mp3", image: "Queen.png"},
    R: { object: "Rainbow", sound: "r.mp3", image: "Rainbow.png"},
    S: { object: "Sun", sound: "s.mp3", image: "Sun.png"},
    T: { object: "Tree", sound: "t.mp3", image: "Tree.png"},
    U: { object: "Umbrella", sound: "u.mp3", image: "Umbrella.png"},
    V: { object: "Violin", sound: "v.mp3", image: "Violin.png"},
    W: { object: "Whale", sound: "w.mp3", image: "Whale.png"},
    X: { object: "Xray", sound: "x.mp3", image: "Xray.png"},
    Y: { object: "Yarn", sound: "y.mp3", image: "Yarn.png"},
    Z: { object: "Zipper", sound: "z.mp3", image: "Zipper.png"},
};

const allLetters = Object.keys(alphabetData);

router.get("/level1", (req, res) => {
    const letter = allLetters[Math.floor(Math.random() * allLetters.length)];
    const { object, sound, image } = alphabetData[letter];

    res.json({
        level: 1,
        letter,
        voice: `assets/audio/letters/${letter}.mp3`,
        object,
        objectVoice: `assets/audio/objects/${sound}`,
        objectImage: `assets/images/objects/${image}`,
    });
});

router.get("/level2", (req, res) => {
    const letter = allLetters[Math.floor(Math.random() * allLetters.length)];
    const correctObject = alphabetData[letter].object;
    const correctImage = alphabetData[letter].image;

    let incorrectObjects = allLetters
        .filter((l) => l !== letter)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map((l) => ({
            object: alphabetData[l].object,
            image: alphabetData[l].image,
        }));

    res.json({
        level: 2,
        letter,
        voice: `/audio/letters/${letter}.mp3`,
        options: [
            { object: correctObject, image: correctImage, correct: true },
            ...incorrectObjects.map((obj) => ({ ...obj, correct: false })),
        ].sort(() => Math.random() - 0.5), // Randomize order
    });
});

router.get("/level3", (req, res) => {
    const letter = allLetters[Math.floor(Math.random() * allLetters.length)];
    const correctWord = alphabetData[letter].object;
    const letterSound = alphabetData[letter].sound;

    let incorrectLetters = allLetters
        .filter((l) => l !== letter)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    res.json({
        level: 3,
        sound: `/audio/sounds/${letterSound}`,
        wordExample: correctWord,
        options: [
            { letter, correct: true },
            ...incorrectLetters.map((l) => ({ letter: l, correct: false })),
        ].sort(() => Math.random() - 0.5), // Randomize order
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

        let scores = { level1: 0, level2: 0, level3: 0 };

        if (childDoc.exists) {
            scores = childDoc.data().alphabetScores || scores;
        }

        scores[`level${level}`] = (scores[`level${level}`] || 0) + scoreChange;

        await childRef.set({ childId, alphabetScores: scores }, { merge: true });

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

        const scores = childDoc.data().alphabetScores || { level1: 0, level2: 0, level3: 0 };

        res.json({
            childId,
            scores,
        });
    } catch (error) {
        console.error("Firestore Error:", error);
        res.status(500).json({ error: "Firestore access failed", details: error.message });
    }
});

module.exports = router;