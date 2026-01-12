const express = require("express");
const router = express.Router();
const Nastup = require("../models/nastup");

router.put("/slanjeocjene/:id/:ocjena", async (req, res) => {
    const id = req.params.id;
    const ocjena = req.params.ocjena;

    try {
        const azurirano = await Nastup.findByIdAndUpdate(
            req.params.id,
            { bodovi: Number(ocjena) },
            {new: true }
        );

        if (!azurirano)
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });

        return res.json({ poruka: "Natjecanje uspješno ažurirano", natjecanje: azurirano });
    }
    catch (err) {
        console.error("Greška pri ažuriranju nastupa:", err);
        return sres.status(500).json({ poruka: "Greška pri ažuriranju nastupa" });
    }
});



module.exports = router;