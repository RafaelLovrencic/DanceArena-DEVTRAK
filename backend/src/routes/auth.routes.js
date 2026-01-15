const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Korisnici = require("../models/user");
const Klub = require("../models/klub");
const { FRONTEND_URL } = require("../../config");

const router = express.Router();

// ------------- Google OAuth ---------------
router.get("/google", (req, res, next) => {
  const state = req.query.state || "normal-login";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
    state
  })(req, res, next);
});

// /google/callback
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      if (!req.user) return res.redirect(FRONTEND_URL);

      // Generiraj JWT
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Redirect na frontend s tokenom u hashu
      res.redirect(`${FRONTEND_URL}/oauth-callback#token=${token}`);
    } catch (err) {
      console.error("Greška u callback-u:", err);
      res.redirect(FRONTEND_URL);
    }
  }
);

// Provjera autentifikacije (Authorization header)
router.get("/provjera-autentifikacije", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ greska: "Nema tokena" });

    const token = auth.split(" ")[1]; // Bearer <token>
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

// Logout
router.post("/logout", (req, res) => {
  // frontend samo briše token iz localStorage
  res.json({ poruka: "Uspješno odjavljen" });
});

module.exports = router;