const express = require("express");
const jwt = require("jsonwebtoken");
const Korisnici = require("../models/user");
const Klub = require("../models/klub");
const { FRONTEND_URL } = require("../../config");
const PozivSucu = require("../models/poziv_sucu");
const Natjecanje = require("../models/natjecanje");

var router = express.Router();

var path = require('path');
var fs = require('fs');
const { type } = require("os");


async function oznaciNatjecanjaSucuMiddleware(req, res, next) {
    try {
        if (!req.body.iskljucivoSudac) {
            next();
        }

        const token = req.cookies?.token;
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const korisnik = await Korisnici.findById(decoded.id);
        if (!korisnik) return next();

        const email = korisnik.email;

        const pozivi = await PozivSucu.find({ email: email, status: "pozvan" });

        for (const poziv of pozivi) {
            await Natjecanje.findByIdAndUpdate(
                poziv.natjecanjeId,
                { $addToSet: { suci: korisnik._id } },
                { new: true }
            );

            poziv.status = "prihvacen";
            poziv.userId = korisnik._id;
            await poziv.save();
        }

        next();
    } catch(err) {
        console.log("Greška u middlewareu oznaciNatjecanjaSucu:", err);
        next(err);
    }
}


router.post(
    "/",
    oznaciNatjecanjaSucuMiddleware, 
    async (req, res) => {
        try {
            const token = req.cookies?.token;
            if (!token) return res.status(401).json({ greska: "Nema tokena" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { ime, uloga, imeKluba, lokacija } = req.body;

            const korisnik = await Korisnici.findById(decoded.id);
            if (!korisnik) return res.status(404).json({ greska: "Korisnik nije pronađen" });

            if (korisnik.uloga) {
            return res.status(403).json({ greska: "Uloga je već odabrana i ne može se promijeniti" });
            }

            if (!ime || ime.trim() === "") return res.status(400).json({ greska: "Ime ne može biti prazno" });
            if (!uloga || !["sudac", "voditelj", "organizator"].includes(uloga))
            return res.status(400).json({ greska: "Nevaljana uloga" });

                let klub = null;

            //Ako je korisnik voditelj  stvori novi klub i poveži ga
            if (uloga === "voditelj") {
            if (!imeKluba || !lokacija) {
                return res.status(400).json({ greska: "Ime kluba i lokacija su obavezni za voditelja" });
            }

            klub = await Klub.create({
                ime: imeKluba,
                lokacija,
                email: korisnik.email,
                ownerId: korisnik._id,
            });
            }

            const azuriranKorisnik = await Korisnici.findByIdAndUpdate(
            decoded.id,
            {
                ime,
                role: uloga,
                imeKluba: uloga === "voditelj" ? imeKluba : null,
            },
            { new: true }
            );

            res.json({ poruka: "Profil uspješno ažuriran", korisnik: azuriranKorisnik });
        } catch (err) {
            console.error(err);
            res.status(500).json({ greska: "Greška pri ažuriranju profila" });
        }
    }
);

// trenutno se ne koristi
router.post('/registracija', function(req, res) {
    console.log(req.body);

    const putanja = path.join(__dirname, '..', 'repository', 'korisnici.repository.json');
    const podaci = JSON.parse(fs.readFileSync(putanja, 'utf8'));

    podaci.push(req.body);

    fs.writeFileSync(putanja, JSON.stringify(podaci, null, 2));

    res.status(200).send();
})


router.get('/sudac', function(req, res) {

});


router.get('/prijaviSuca', function(req, res) {

    const { token } = req.query;

    if (!token) {
        return res.redirect(FRONTEND_URL);
    }

    try {
        const payload = jwt.verify(token, process.env.INVITE_SECRET);

        res.cookie(
            "login_context",
            JSON.stringify({
                type: "judge-invite",
                token
            }),
            {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 10 * 60 * 1000
            }
        );

        res.redirect(`${FRONTEND_URL}/obavijestsucu`);
    } catch (err) {
        console.log("Neispravan ili istekao token:", err);
        res.redirect(FRONTEND_URL);
    }
});

module.exports = router;