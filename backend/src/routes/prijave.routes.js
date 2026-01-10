const express = require("express");
const User = require("../models/user");
const Kategorije = require("../models/kategorije");
const Natjecanje = require("../models/natjecanje");
const Nastup = require("../models/nastup");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/natjecanje/:id", async (req, res) => {
    try {
        const id = req.params.id;
        
        const nastupi = await Nastup.find({ natjecanjeId: id }).populate("kategorijaId", "godiste stil velicina")
              .populate("klubId", "ime lokacija")
              .lean();
        
        res.json(nastupi);
    } catch (err) {
        res.status(500).json({ "error": "Pogreška pri dohvaćanju prijavljenih nastupa" });
    }
});

router.post("/application", authMiddleware, async (req, res) => {
    try {
        const {
            natjecanjeId,
            kotizacija,
            kategorije,
            nazivKoreografije,
            trajanje,
            koreograf,
            dob,
            stil,
            velicina,
            glazba
        } = req.body;
        
        const klubId = req.user.klubId;

        if (!klubId) {
            return res.status(403).json({ poruka: "Korisnik nema pridružen klub" });
        }

        let kategorija = await Kategorije.findOne({
            godiste: dob,
            stil: stil,
            velicina: velicina
        });

        if (!kategorija) {
            kategorija = new Kategorije({
                godiste: dob,
                stil: stil,
                velicina: velicina
            });
            await kategorija.save();
        }

        const noviNastup = new Nastup({
            natjecanjeId,
            kategorijaId: kategorija._id,
            klubId,
            imekoreografije: nazivKoreografije,
            trajanje,
            imekoreografa: koreograf,
            glazbaUrl: glazba,
            prihvaceno: false
        });

        await noviNastup.save();

        res.status(201).json({
            poruka: "Prijava na natjecanje uspješna",
            nastup: noviNastup
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ "error": "Greška pri prijavi na natjecanje" });
    }
});

module.exports = router;