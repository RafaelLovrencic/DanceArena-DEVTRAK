const express = require("express");
const User = require("../models/user");

var router = express.Router();

router.get("/suci", async (req, res) => {
    try {
        const suci = await User.find({ role: "sudac" })
        res.json(suci);
    }
    catch (err) {
        console.error("Greška pri dohvaćanju sudaca:", err);
        res.status(500).json({ poruka: "Greška pri dohvaćanju sudaca" });
    }
});

module.exports = router;