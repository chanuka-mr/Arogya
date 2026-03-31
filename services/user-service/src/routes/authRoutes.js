const express = require("express");
const router = express.Router();

// Placeholder for auth routes
router.get("/status", (req, res) => {
    res.json({ message: "Auth routes placeholder" });
});

module.exports = router;
