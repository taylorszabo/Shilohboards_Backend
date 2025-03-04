const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
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

module.exports = router;
