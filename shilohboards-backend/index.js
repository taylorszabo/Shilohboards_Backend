const admin = require('firebase-admin');
const serviceAccount = require("C:\\Users\\logan\\OneDrive\\ConestogaCollege\\INFO3190\\Shilohboards_Backend\\shilohboards-backend\\serviceAccountKey.json");

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

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app;
