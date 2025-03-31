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
    const { parentId, profileId} = req.body;

    const childId = db.collection('children').doc().id;

    await db.collection('children').doc(childId).set({
      id: childId,
      role: 'child',
      parent_id: parentId,
      profile_id: profileId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Child added successfully', childId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/child/:profileId", async (req, res) => {
  const { profileId } = req.params;

  if (!profileId) {
    return res.status(400).json({ message: "Missing profileId." });
  }

  try {
    const childrenRef = db.collection("children");
    const snapshot = await childrenRef.where("profile_id", "==", isNaN(Number(profileId)) ? profileId : Number(profileId)).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Child not found for given profile ID." });
    }

    const childDoc = snapshot.docs[0];
    const childId = childDoc.id;

    await childrenRef.doc(childId).delete();

    await db.collection("profiles").doc(childId).delete();

    return res.status(200).json({ message: "Child and profile deleted successfully." });
  } catch (error) {
    console.error("Error deleting child and profile:", error);
    return res.status(500).json({ message: "Server error while deleting child." });
  }
});


router.post("/profile", async (req, res) => {
  let { child_id, profile_name, profile_image, profile_color } = req.body;

  // Validate that child_id exists and is a string
  if (!child_id || typeof child_id !== "string" || child_id.trim() === "") {
    return res.status(400).json({ error: "Invalid child_id. It must be a non-empty string." });
  }

  if (!profile_name || !profile_image || !profile_color) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const profileRef = db.collection("profiles").doc(child_id.trim());
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

router.put("/profile/:child_id", async (req, res) => {
  const { child_id } = req.params;
  const { profile_name, profile_image, profile_color } = req.body;

  if (!child_id || typeof child_id !== "string" || child_id.trim() === "") {
    return res.status(400).json({ error: "Invalid child_id. It must be a non-empty string." });
  }

  if (!profile_name && !profile_image && !profile_color) {
    return res.status(400).json({ error: "At least one field is required for an update." });
  }

  try {
    const profileRef = db.collection("profiles").doc(child_id.trim());
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await profileRef.update({
      ...(profile_name && { profile_name }),
      ...(profile_image && { profile_image }),
      ...(profile_color && { profile_color }),
      updated_at: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
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

router.get('/children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ error: "Parent ID is required" });
    }

    const childrenSnapshot = await db.collection('children').where('parent_id', '==', parentId).get();

    if (childrenSnapshot.empty) {
      return res.status(404).json({ message: "No children found for this parent." });
    }

    const children = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/report", async (req, res) => {
  try {
    const { child_id, game_type, level, results } = req.body;

    if (!child_id || !game_type || !level || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    const childRef = db.collection("performance_reports").doc(child_id);
    const doc = await childRef.get();

    let performanceData = doc.exists ? doc.data() : { total_games: 0, games: {} };

    performanceData.total_games += 1;

    if (!performanceData.games[game_type]) {
      performanceData.games[game_type] = {};
    }

    if (!performanceData.games[game_type][level]) {
      performanceData.games[game_type][level] = { attempts: 0, accuracy: {} };
    }

    performanceData.games[game_type][level].attempts += 1;

    results.forEach(({ correct, id }) => {
      if (!performanceData.games[game_type][level].accuracy[id]) {
        performanceData.games[game_type][level].accuracy[id] = { correct: 0, attempts: 0 };
      }

      performanceData.games[game_type][level].accuracy[id].attempts += 1;
      if (correct) {
        performanceData.games[game_type][level].accuracy[id].correct += 1;
      }
    });

    await childRef.set(performanceData);

    res.status(200).json({ message: "Report updated successfully", data: performanceData });
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ error: "Server error while saving report." });
  }
});

router.get("/report/:child_id", async (req, res) => {
  try {
    const { child_id } = req.params;
    const { gameType, level } = req.query;

    if (!gameType || !level) {
      return res.status(400).json({ message: "Missing gameType or level in query params." });
    }

    const childRef = db.collection("performance_reports").doc(child_id);
    const doc = await childRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "No report found for this child." });
    }

    const rawData = doc.data();
    const gameData = rawData.games?.[gameType]?.[level];

    if (!gameData) {
      return res.status(200).json({
        completedGames: 0,
        averageScore: 0,
        questionPerformance: {}
      });
    }

    const accuracyMap = gameData.accuracy || {};
    const questionPerformance = {};

    let totalScore = 0;
    let totalQuestions = 0;

    for (const key in accuracyMap) {
      const item = accuracyMap[key];
      const attempts = item.attempts || 0;
      const correct = item.correct || 0;

      if (attempts > 0) {
        const percent = Math.round((correct / attempts) * 100);
        questionPerformance[key] = percent;
        totalScore += percent;
        totalQuestions++;
      }
    }

    const averageScore = totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0;

    res.status(200).json({
      completedGames: gameData.attempts || 0,
      averageScore,
      questionPerformance
    });

  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Server error while fetching report." });
  }
});

router.post("/rewards/", async (req, res) => {
  try {
    const { childId, category, level } = req.body;

    if (!childId || !category || !level) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const childRef = db.collection("reward_inventory").doc(childId);

    // Use a nested structure like: rewards.{category}.level{level}
    const fieldPath = `rewards.${category}.level${level}`;

    await childRef.set({
      [fieldPath]: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    res.status(200).json({ message: "Star count updated successfully." });
  } catch (error) {
    console.error("Error updating star count:", error);
    res.status(500).json({ error: "Failed to update star count." });
  }
});

router.get("/rewards/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const doc = await db.collection("reward_inventory").doc(childId).get();

    if (!doc.exists) {
      return res.status(200).json({});
    }

    const flatData = doc.data(); // Contains flattened keys
    const nestedRewards = {};

    for (const key in flatData) {
      if (key.startsWith("rewards.")) {
        const [, category, levelKey] = key.split(".");

        if (!nestedRewards[category]) {
          nestedRewards[category] = {};
        }

        nestedRewards[category][levelKey] = flatData[key];
      }
    }

    res.status(200).json(nestedRewards);
  } catch (error) {
    console.error("Error reconstructing rewards:", error);
    res.status(500).json({ error: "Server error while fetching rewards." });
  }
});





module.exports = router;

