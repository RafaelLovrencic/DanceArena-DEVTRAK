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

// Middleware za provjeru tokena iz Authorization headera
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ greska: "Niste prijavljeni" });

        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) return res.status(401).json({ greska: "Token nedostaje" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.korisnik = decoded; // spremi podatke iz tokena
        next();
    } catch (err) {
        console.error("JWT error:", err);
        res.status(401).json({ greska: "Neispravan token" });
    }
}

// Middleware za označavanje natjecanja sudcu
async function oznaciNatjecanjaSucuMiddleware(req, res, next) {
    try {
        if (!req.body.iskljucivoSudac) {
            return next();
        }

        const korisnikId = req.korisnik?.id;
        if (!korisnikId) return next();

        const korisnik = await Korisnici.findById(korisnikId);
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
    } catch (err) {
        console.log("Greška u middlewareu oznaciNatjecanjaSucu:", err);
        next(err);
    }
}

// Endpoint za dovršetak profila / odabir uloge
router.post(
    "/",
    authMiddleware,
    oznaciNatjecanjaSucuMiddleware,
    async (req, res) => {
        try {
            const { ime, uloga, imeKluba, lokacija } = req.body;
            const korisnikId = req.korisnik.id;

            const korisnik = await Korisnici.findById(korisnikId);
            if (!korisnik) return res.status(404).json({ greska: "Korisnik nije pronađen" });

            if (korisnik.role) {
                return res.status(403).json({ greska: "Uloga je već odabrana i ne može se promijeniti" });
            }

            if (!ime || ime.trim() === "") return res.status(400).json({ greska: "Ime ne može biti prazno" });
            if (!uloga || !["sudac", "voditelj", "organizator"].includes(uloga))
                return res.status(400).json({ greska: "Nevaljana uloga" });

            let klub = null;

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
                korisnikId,
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

// Endpoint za uređivanje korisnika i kluba
router.put('/:id/:idKlub', authMiddleware, async function(req, res) {
    try {
        const { id, idKlub } = req.params;
        const { ime, prezime, role, email, imeKluba, lokacija } = req.body;

        const updateData = {};
        const updateDataKlub = {};

        if (ime) updateData.ime = ime;
        if (prezime) updateData.prezime = prezime;
        if (role) updateData.role = role;
        if (email) updateData.email = email;
        if (imeKluba) updateDataKlub.ime = imeKluba;
        if (lokacija) updateDataKlub.lokacija = lokacija;

        const azurirano = await Korisnici.findByIdAndUpdate(id, updateData, { new: true });
        if (!azurirano) return res.status(404).json({ poruka: "Korisnik nije pronađen" });

        const azuriranoKlub = await Klub.findByIdAndUpdate(idKlub, updateDataKlub, { new: true });
        if (!azuriranoKlub) return res.status(404).json({ poruka: "Klub nije pronađen" });

        res.json({ poruka: "Korisnik i klub uspješno ažurirani" });
    } catch (err) {
        console.error("Greška pri ažuriranju korisnika:", err);
        res.status(500).json({ poruka: "Greška pri ažuriranju korisnika" });
    }
});

// Endpoint za sudce / prijavu sudca
router.get('/prijaviSuca', async function(req, res) {
    const { token } = req.query;

    if (!token) return res.redirect(FRONTEND_URL);

    try {
        const payload = jwt.verify(token, process.env.INVITE_SECRET);

        res.cookie(
            "login_context",
            JSON.stringify({ type: "judge-invite", token }),
            { httpOnly: true, sameSite: "None", secure: true, maxAge: 10 * 60 * 1000 }
        );

        res.redirect(`${FRONTEND_URL}/obavijestsucu`);
    } catch (err) {
        console.log("Neispravan ili istekao token:", err);
        res.redirect(FRONTEND_URL);
    }
});

module.exports = router;