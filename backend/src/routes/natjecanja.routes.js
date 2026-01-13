const express = require("express");
const User = require("../models/user");
const Kategorije = require("../models/kategorije");
const Natjecanje = require("../models/natjecanje");
const Nastup = require("../models/nastup");
const PozivSucu = require("../models/poziv_sucu");
const { posaljiPozivNaEmail } = require("../services/email.service");
const authMiddleware = require("../services/authMiddleware");

const router = express.Router();

router.get("/user", authMiddleware, async (req, res) => {
    try {
        const uId = req.user._id;
        const kId = req.user.klubId;
        const uloga = req.user.role;

        let natjecanja = [];

        if (uloga === "voditelj") {

            const nastupi = await Nastup.find({ klubId: kId });

            const natjecanjeIds = [
                ...new Set(nastupi.map(n => n.natjecanjeId.toString()))
            ];

            natjecanja = await Natjecanje.find({_id: { $in: natjecanjeIds }})
                .populate("organizatorId")
                .populate("kategorije")
                .populate("suci");

        } else if (uloga === "organizator") {

            natjecanja = await Natjecanje.find({ organizatorId: uId })
                .populate("organizatorId")
                .populate("kategorije")
                .populate("suci");

        } else if (uloga === "sudac") {

            natjecanja = await Natjecanje.find({ suci: uId })
                .populate("organizatorId")
                .populate("kategorije")
                .populate("suci");
        }

        if (!natjecanja.length) {
            return res.status(404).json({
                poruka: "Za ovog korisnika nije pronađeno nijedno natjecanje"
            });
        }
        res.status(200).json(natjecanja);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            poruka: "Greška pri dohvaćanju korisnikovih natjecanja"
        });
    }
});

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

        const pozivi = await PozivSucu.find({ natjecanjeId: req.params.id, status: "pozvan" })
            .populate("email");

        if (!natjecanje) {
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });
        }
        res.json({
            natjecanje: natjecanje,
            pozvani_suci: pozivi,
        });

    } catch (err) {
        console.error("Greška pri dohvaćanju natjecanja:", err);
        res.status(500).json({ poruka: "Greška pri dohvaćanju natjecanja" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { ime, opis, datum, lokacija, organizatorId, kategorije, suci, kotizacija, noviSuci } = req.body;

        const updateData = {};

        if (ime) updateData.ime = ime;
        if (opis) updateData.opis = opis;
        if (datum) updateData.datum = datum;
        if (lokacija) updateData.lokacija = lokacija;
        if (kotizacija) updateData.kotizacija = kotizacija;

        const vecRegistriran = [];

        for (const noviSudac of noviSuci) {
            const sudac = await User.find({ email: noviSudac });
            const pozvanSudac = await PozivSucu.find({ email: noviSudac, natjecanjeId: req.params.id });
            if (sudac.length > 0 || pozvanSudac.length > 0) {
                vecRegistriran.push(noviSudac);
            }
        }

        // ako su pronađeni korisnici čiji mail već postoji u bazi, vrati error
        if (vecRegistriran.length > 0) {
            console.error( "Ovi korisnici već postoje");
            return res.status(400).json({
                poruka: "Ovi korisnici već postoje",
                emails: vecRegistriran 
            });
        }

        for (const noviSudac of noviSuci) {
            const noviPozivSucu = new PozivSucu({
                email: noviSudac,
                natjecanjeId: req.params.id,
            });

            await noviPozivSucu.save();
            await posaljiPozivNaEmail(noviSudac, ime);
        }

        if (Array.isArray(suci) && suci.length > 0) {
            updateData.suci = suci;
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
        const { ime, opis, datum, lokacija, organizatorId, kategorije, suci, kotizacija, noviSuci } = req.body;

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
            suci: suci,
            kotizacija: kotizacija,
            stanje: "otvoreno",
        });

        const vecRegistriran = [];

        for (const noviSudac of noviSuci) {
            const sudac = await User.find({ email: noviSudac });
            if (sudac.length > 0) {
                vecRegistriran.push(noviSudac);
            }
        }

        // ako su pronađeni korisnici čiji mail već postoji u bazi, vrati error
        if (vecRegistriran.length > 0) {
            console.error( "Ovi korisnici već postoje");
            return res.status(400).json({
                poruka: "Ovi korisnici već postoje",
                emails: vecRegistriran 
            });
        }

        for (const noviSudac of noviSuci) {
            const noviPozivSucu = new PozivSucu({
                email: noviSudac,
                natjecanjeId: novoNatjecanje._id
            });

            await noviPozivSucu.save();
            await posaljiPozivNaEmail(noviSudac, ime);
        }

        await novoNatjecanje.save();

        return res.status(201).json({ poruka: "Natjecanje uspješno dodano", natjecanje: novoNatjecanje });
    
    } catch (err) {
        console.error("Greška pri dodavanju natjecanja:", err);
        return res.status(500).json({ poruka: "Greška pri dodavanju natjecanja" });
    }
});

router.put("/stanje/:id/:stanje", async (req, res) => {
    const id = req.params.id;
    const stanje = req.params.stanje;

    try {
        const azurirano = await Natjecanje.findByIdAndUpdate(
            req.params.id,
            { stanje: stanje },
            {new: true }
        );

        if (!azurirano)
            return res.status(404).json({ poruka: "Natjecanje nije pronađeno" });

        return res.json({ poruka: "Stanje natjecanje uspješno ažurirano", natjecanje: azurirano });
    }
    catch (err) {
        console.error("Greška pri ažuriranju stanja natjecanja:", err);
        return res.status(500).json({ poruka: "Greška pri ažuriranju stanja natjecanja" });
    }
});

router.get("stanje/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const stanje = await Natjecanje.find({ _id : id })
            .populate("stanje");

        return res.json(stanje);
    } catch(err) {
        console.error("Greška pri dohvaćanju stanja natjecanja:", err);
        return res.status(500).json({ poruka: "Greška pri dohvaćanju stanja natjecanja" });
    }
});


module.exports = router;