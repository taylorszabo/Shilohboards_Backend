const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_NAME
    });
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = admin.firestore();
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

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

app.post('/create-parent', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        await db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email,
            role: 'parent',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Parent created successfully', userId: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/create-child', async (req, res) => {
    try {
        const { parentId, displayName, characterId } = req.body;

        const childId = db.collection('children').doc().id;

        await db.collection('children').doc(childId).set({
            id: childId,
            display_name: displayName,
            role: 'child',
            parent_id: parentId,
            character_id: characterId,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Child added successfully', childId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: "ID token is required" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.json({
            message: "Login successful",
            uid: decodedToken.uid,
            email: decodedToken.email,
        });
    } catch (error) {
        return res.status(401).json({ error: "Invalid token", details: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/children', async (req, res) => {
    try {
        const childrenSnapshot = await db.collection('children').get();
        const children = childrenSnapshot.docs.map(doc => doc.data());

        res.status(200).json(children);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/game-over', (req, res) => {
    const { gameType, level } = req.query;

    let payload = {
        message: "Game Complete!",
        gameType: gameType || "unknown",
        level: level || 1,
        score: Math.floor(Math.random() * 100),
        accuracy: (Math.random() * 100).toFixed(2) + "%",
        rewardsEarned: ["Star"],
    };

    res.json(payload);
});

const allLetters = Object.keys(alphabetData);

app.get("/alphabet/level1", (req, res) => {
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

app.get("/alphabet/level2", (req, res) => {
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

app.get("/alphabet/level3", (req, res) => {
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

app.post("/alphabet/score", async (req, res) => {
    try {
        const { childId, level, scoreChange } = req.body;

        if (!childId || !level || typeof scoreChange !== "number") {
            return res.status(400).json({ error: "Invalid request data" });
        }

        const childRef = db.collection("childScores").doc(childId);
        const childDoc = await childRef.get();

        let scores = { level1: 0, level2: 0, level3: 0 };

        if (childDoc.exists) {
            scores = childDoc.data().scores;
        }

        scores[`level${level}`] = (scores[`level${level}`] || 0) + scoreChange;

        await childRef.set({ childId, scores });

        res.json({
            childId,
            scores,
        });
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/alphabet/score/:childId", async (req, res) => {
    try {
        const { childId } = req.params;
        const childRef = db.collection("childScores").doc(childId);
        const childDoc = await childRef.get();

        if (!childDoc.exists) {
            return res.status(404).json({ error: "Child not found" });
        }

        res.json(childDoc.data());
    } catch (error) {
        console.error("Error retrieving score:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app;
