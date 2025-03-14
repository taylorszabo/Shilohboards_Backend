const express = require("express");
const { db, admin} = require("../config/firebase");
const router = express.Router();

router.post('/create-parent', async (req, res) => {
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

router.post('/create-child', async (req, res) => {
  try {
    const { parentId, displayName} = req.body;

    const childId = db.collection('children').doc().id;

    await db.collection('children').doc(childId).set({
      id: childId,
      display_name: displayName,
      role: 'child',
      parent_id: parentId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Child added successfully', childId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/profile", async (req, res) => {
  const { child_id, profile_name, profile_image, profile_color } = req.body;

  if (!child_id || !profile_name || !profile_image || !profile_color) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const profileRef = db.collection("profiles").doc(child_id);
    await profileRef.set({
      profile_name,
      profile_image,
      profile_color,
      created_at: admin.firestore.Timestamp.now()
    });

    return res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error creating profile:", error);
    return res.status(500).json({ error: "Server error" });
  }
});
router.get("/profile/:child_id", async (req, res) => {
  const { child_id } = req.params;

  try {
    const profileRef = db.collection("profiles").doc(child_id);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.status(200).json(profileDoc.data());
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
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

router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/children', async (req, res) => {
  try {
    const childrenSnapshot = await db.collection('children').get();
    const children = childrenSnapshot.docs.map(doc => doc.data());

    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

