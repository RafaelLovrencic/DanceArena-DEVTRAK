const express = require("express");
const User = require("../models/user");
const Kategorije = require("../models/kategorije");
const Natjecanje = require("../models/natjecanje");
const Nastup = require("../models/nastup");
const authMiddleware = require("../services/authMiddleware");

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

router.get("/natjecanje/:id/moje-prijave", authMiddleware, async (req, res) => {
    try {
        const natjecanjeId = req.params.id;
        const klubId = req.user.klubId;
        const nastupi = await Nastup.find({
            natjecanjeId,
            klubId
        });
        res.status(200).json(nastupi);
    } catch (err) {
        res.status(500).json({ "error": "Pogreška pri dohvaćanju vaših nastupa" });
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
        
        const vecPostoji = await Nastup.findOne({
            natjecanjeId,
            klubId,
            kategorijaId: kategorija._id
        });

        if (vecPostoji) {
            return res.status(409).json({
                poruka: "Već ste prijavljeni u ovoj kategoriji s ovim timom"
            });
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

router.put("/application/edit/:id", authMiddleware, async (req, res) => {
    try {
        const {
            nazivKoreografije,
            trajanje,
            koreograf,
            dob,
            stil,
            velicina,
            glazba
        } = req.body;

        const id = req.params.id;
        let kategorija;        
        const klubId = req.user.klubId;

        if (!klubId) {
            return res.status(403).json({ poruka: "Korisnik nema pridružen klub" });
        }
        
        var nastup = await Nastup.findById(id);
        if (!nastup) {
            return res.status(404).json({ "error": "Nije pronađena ta prijava" });
        }
        
        if (nazivKoreografije != null) nastup.imekoreografije = nazivKoreografije;
        if (trajanje != null) nastup.trajanje = trajanje;
        if (koreograf != null) nastup.imekoreografa = koreograf;
        if (glazba != null) nastup.glazbaUrl = glazba;

        const kategorijaPoslana = dob != null || stil != null || velicina != null;

        if (kategorijaPoslana && (!dob || !stil || !velicina)) {
            return res.status(400).json({
                poruka: "Kategorija mora imati dob, stil i veličinu"
            });
        }
        
        if (dob && stil && velicina) {
            kategorija = await Kategorije.findOne({
                godiste: dob,
                stil: stil,
                velicina: velicina
            });
        }

        if (!kategorija) {
            kategorija = new Kategorije({
                godiste: dob,
                stil: stil,
                velicina: velicina
            });
            await kategorija.save();
        }
        
        nastup.kategorijaId = kategorija._id;
        
        await nastup.save();

        res.status(201).json({
            poruka: "Izmjena prijave uspješna",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ "error": "Greška pri prijavi na natjecanje" });
    }
});

router.delete("/application/del/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const postojeci = await Nastup.findById(id);
        if (req.user.role === "sudac" || 
            (postojeci.klubId.toString() !== req.user.klubId.toString() && req.user.role === "voditelj")) {
            return res.status(400).json({ "error": "Nije moguće obrisati tuđi nastup" });
        }
        const nastup = await Nastup.findByIdAndDelete(id);
        if (!nastup){
            return res.status(404).json({ "error": "Nastup nije pronađen" });
        }
        res.status(200).json({ "message": "Nastup uspješno obrisan", nastup });
    } catch (err) {
        console.error("Greška pri brisanju:", err);
        res.status(500).json({ "error": "Greška pri brisanju nastupa" });
    }
});

module.exports = router;