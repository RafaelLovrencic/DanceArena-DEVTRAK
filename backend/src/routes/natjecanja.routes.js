const express = require("express");
const User = require("../models/user");
const Kategorije = require("../models/kategorije");
const Natjecanje = require("../models/natjecanje");
const { posaljiSucuPoziv } = require("../services/email.service");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        
        const natjecanja = await Natjecanje.find()
            .populate("organizatorId")
            .populate("kategorije")
            .populate("suci");
        res.json(natjecanja);

    } catch (err) {
        console.error("Greška pri dohvaćanju natjecanja:", err);    
        res.status(500).json( {poruka: "Greška pri dohvaćanju natjecanja"} );
    }
});

router.get("/:id", async (req, res) => {
    try {

        const natjecanje = await Natjecanje.findById(req.params.id)
            .populate("organizatorId")
            .populate("kategorije")
            .populate("suci");

        if (!natjecanje) {
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });
        }
        res.json(natjecanje);

    } catch (err) {
        console.error("Greška pri dohvaćanju natjecanja:", err);
        res.status(500).json({ poruka: "Greška pri dohvaćanju natjecanja" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { ime, opis, datum, lokacija, suci, kategorije, kotizacija } = req.body;

        const updateData = {};

        if (ime) updateData.ime = ime;
        if (opis) updateData.opis = opis;
        if (datum) updateData.datum = datum;
        if (lokacija) updateData.lokacija = lokacija;
        if (kotizacija) updateData.kotizacija = kotizacija;

        if (Array.isArray(suci) && suci.length > 0) {
            const suciIds = [];
            for (const imeSuca of suci) {
                let sudac = await User.findOne({ ime: imeSuca });
                if (!sudac) {
                    sudac = new User({ 
                    role: "sudac",
                    ime: imeSuca,
                    email: imeSuca + "@gmail.com",
                    oauthProvider: {
                        type: "testni provider",
                        providerId: "test"
                    }
                });
                    await sudac.save();
                }
                suciIds.push(sudac._id);
            }
            updateData.suci = suciIds;
        }

        if (Array.isArray(kategorije) && kategorije.length === 3) {
            const [godiste, stil, velicina] = kategorije;

            let kategorija = await Kategorije.findOne({ godiste, stil, velicina });
            if (!kategorija) {
                kategorija = new Kategorije({ godiste, stil, velicina });
                await kategorija.save();
            }

            updateData.kategorije = [kategorija._id];
        }

        const azurirano = await Natjecanje.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate("suci", "ime email")
            .populate("kategorije", "godiste stil velicina");

        if (!azurirano)
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });

        res.json({ poruka: "Natjecanje uspješno ažurirano", natjecanje: azurirano });
    
    } catch (err) {
        console.error("Greška pri ažuriranju natjecanja:", err);
        res.status(500).json({ poruka: "Greška pri ažuriranju natjecanja" });
    }
});

router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const deleted = await Natjecanje.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });
        }
        res.json({ poruka: "Natjecanje uspješno obrisano", natjecanje: deleted });
    
    } catch (err) {
        console.error("Greška pri brisanju natjecanja:", err);
        res.status(500).json({ poruka: "Greška pri brisanju natjecanja" });
    }
});

router.post("/add", async (req, res) => {
    try {

        const { ime, opis, datum, lokacija, organizatorId, kategorije, suci, kotizacija, noviSuciMailovi } = req.body;

        const suciIds = [];
        for (const imeSuca of suci) {
            let sudac = await User.findOne({ ime: imeSuca });
            if (!sudac) {
                sudac = new User({ 
                    role: "sudac",
                    ime: imeSuca,
                    email: imeSuca + "@gmail.com",
                    oauthProvider: {
                        type: "testni provider",
                        providerId: "test"
                    }
                });
                await sudac.save();
                await posaljiSucuPoziv(sudac);
            }
            suciIds.push(sudac._id);
        }

        let kategorijaDoc = await Kategorije.findOne({
            godiste: kategorije[0],
            stil: kategorije[1],
            velicina: kategorije[2]
        });

        if (!kategorijaDoc) {
            kategorijaDoc = new Kategorije({
                godiste: kategorije[0],
                stil: kategorije[1],
                velicina: kategorije[2]
            });
        await kategorijaDoc.save();
        }        
        const novoNatjecanje = new Natjecanje({
            ime,
            opis,
            datum: new Date(datum),          
            lokacija,
            organizatorId,
            kategorije: [kategorijaDoc._id],
            suci: suciIds,
            kotizacija: kotizacija    
        });

        await novoNatjecanje.save();
        res.status(201).json({ poruka: "Natjecanje uspješno dodano", natjecanje: novoNatjecanje });
    
    } catch (err) {
        console.error("Greška pri dodavanju natjecanja:", err);
        res.status(500).json({ poruka: "Greška pri dodavanju natjecanja" });
    }
});


module.exports = router;