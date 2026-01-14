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
    state: state
  })(req, res, next);
});

// ---------------- Google callback ----------------
// PROMJENA: NE postavljamo cookie direktno, nego redirect s tokenom
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      if (!req.user) return res.redirect(FRONTEND_URL);

      // Generiramo JWT
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // PROMJENA: redirect na frontend s tokenom u #hashu
      res.redirect(`${FRONTEND_URL}/oauth-callback#token=${token}`);
    } catch (err) {
      console.error("Greška u callback-u:", err);
      res.redirect(FRONTEND_URL);
    }
  }
);

// ----------------- Novi endpoint -----------------
// PROMJENA: backend postavlja cookie tek nakon što frontend pošalje token
router.post("/store-token", express.json(), (req, res) => {
  const { token } = req.body;

  try {
    // Provjera valjanosti tokena
    jwt.verify(token, process.env.JWT_SECRET);

    // Postavljanje cookieja (first-party)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Neispravan token:", err);
    res.status(400).json({ error: "Neispravan token" });
  }
});

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
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ poruka: "Uspješno odjavljen" });
});

module.exports = router;