const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Korisnici = require("../models/user");
const Klub = require("../models/klub");
const { FRONTEND_URL } = require("../../config");

    var router = express.Router();

// Google OAuth
router.get("/google",
    (req, res, next) => {
        const state = req.query.state || "normal-login";

        passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "consent",
        state: state
        })(req, res, next);
    }
);

router.get("/google/callback",
passport.authenticate("google", { session: false }),
(req, res) => {
    try {
        if (!req.user) return res.redirect(FRONTEND_URL);

        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production", // HTTPS u produkciji
        });

        const state = req.query.state;

        if (state === "judge-invite") {
            if (req.user.role) {
                return res.redirect(FRONTEND_URL);
            }
            return res.redirect(`${FRONTEND_URL}/unospodatakasuci`)
        }

        if (req.user.role) {
            return res.redirect(FRONTEND_URL);
        }

        res.redirect(`${FRONTEND_URL}/unospodataka`);
        } catch (err) {
            console.error("Greška u callback-u:", err);
            res.redirect(FRONTEND_URL);
        }
    }
);

// Provjera autentifikacije
router.get("/provjera-autentifikacije", async (req, res) => {
try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ greska: "Nema tokena" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const korisnik = await Korisnici.findById(decoded.id);
    if (!korisnik) return res.status(404).json({ greska: "Korisnik nije pronađen" });
    const klub = await Klub.findOne({ ownerId: korisnik._id });

    res.json({ korisnik, klub });
} catch (err) {
    console.error("Greška pri provjeri autentifikacije:", err);
    res.status(401).json({ greska: "Neuspjela autentifikacija" });
}
});

// Odjava
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ poruka: "Uspješno odjavljen" });
});

    // Odjava
    router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ poruka: "Uspješno odjavljen" });
    });

    module.exports = router;
