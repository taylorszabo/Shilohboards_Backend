const admin = require('firebase-admin');
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

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
app.use(cors());


app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });
        console.log('Successfully created new user:', userRecord.uid);
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: error.message });
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


app.post('/create-parent', async (req, res) => {
    try {
        const { email, displayName, password } = req.body;

        const userRecord = await admin.auth().createUser({
            email,
            displayName,
            password,
        });

        await db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email,
            display_name: displayName,
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


app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
