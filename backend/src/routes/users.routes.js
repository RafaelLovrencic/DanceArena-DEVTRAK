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


router.get("/", async (req, res) => {
    try {
        const korisnicic = await User.find({ role: { $ne: "admin" } });
        res.json(korisnicic);
    }
    catch (err) {
        console.error("Greška pri dohvaćanju korisnika:", err);
        res.status(500).json({ poruka: "Greška pri dohvaćanju korisnika" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ poruka: "Korisnik nije pronađen" });
        }
        res.json({ poruka: "Korisnik uspješno obrisan!", natjecanje: deleted });

    } catch (err) {
        console.error("Greška pri brisanju korisnika:", err);
        res.status(500).json({ poruka: "Greška pri brisanju korisnika" });
    }
}); 

module.exports = router;