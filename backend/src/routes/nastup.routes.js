const express = require("express");
const router = express.Router();
const Nastup = require("../models/nastup");

router.put("/slanjeocjene/:id", async (req, res) => {
    const nastupId = req.params.id;
    const { ocjena, sudacId } = req.body;

    try {
        const nastup = await Nastup.findById(nastupId);
        if (!nastup)
            return res.status(404).json({ poruka: "Nastup nije pronađen" });

        const postojecaOcjena = nastup.bodovi.find(
            b => b.sudacId && b.sudacId.toString() === sudacId
        );

        if (postojecaOcjena) {
            postojecaOcjena.ocjena = ocjena;
        } else {
            nastup.bodovi.push({
                sudacId,
                ocjena
            });
        }
        nastup.bodovi = nastup.bodovi.filter(
            b => b.sudacId && b.ocjena !== undefined
        );
        await nastup.save();

        return res.json({
            poruka: "Ocjena uspješno spremljena",
            nastup
        });

    } catch (err) {
        console.error("Greška pri ažuriranju nastupa:", err);
        return res.status(500).json({ poruka: "Greška pri ažuriranju nastupa" });
    }
});


router.get("/nabaviocjene/:id", async (req, res) => {
    const nastupId = req.params.id;

    try {
        const bodovi = await Nastup.findById(nastupId)
            .populate("bodovi");
        return res.json(bodovi);

    } catch (err) {
        console.error("Greška pri dobivanju bodova nastupa:", err);
        return res.status(500).json({ poruka: "Greška pri dobivanju bodova nastupa" });
    }
});


router.get("/", async (req, res) => {
    try {
        const nastupi = await Nastup.find();
        res.json(nastupi);
    }
    catch (err) {
        console.error("Greška pri dohvaćanju nastupa:", err);
        res.status(500).json({ poruka: "Greška pri dohvaćanju nastupa" });
    }
});


router.delete("/brisanjeocjene/:id", async (req, res) => {
    const id = req.params.id;
    const { sudacId } = req.body;

    try {
        const nastup = await Nastup.findByIdAndUpdate(
            id,
            {
                $pull: {
                    bodovi: { sudacId: sudacId }
                }
            },
            { new: true }
        );

        if (!nastup)
            return res.status(404).json({ poruka: "Nastup nije pronađen" });

        return res.json({
            poruka: "Ocjena uspješno obrisana",
            nastup
        });

    } catch (err) {
        console.error("Greška pri brisanju ocjene:", err);
        return res.status(500).json({ poruka: "Greška pri brisanju ocjene" });
    }
});




module.exports = router;