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

// /google/callback
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      console.log("Google callback, req.user =", req.user);

      if (!req.user) return res.redirect(FRONTEND_URL);

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log("JWT generiran:", token);

      res.redirect(`${FRONTEND_URL}/oauth-callback#token=${token}`);
    } catch (err) {
      console.error("Greška u callback-u:", err);
      res.redirect(FRONTEND_URL);
    }
  }
);

// /store-token (GET verzija)
router.get("/store-token", async (req, res) => {
  const { token } = req.query;
  console.log("GET /store-token, token =", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token je validan, decoded =", decoded);

    // postavi cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // provjeri postoji li korisnik u bazi
    const korisnik = await Korisnici.findById(decoded.id);

    if (!korisnik) {
      console.log("Korisnik ne postoji → /unospodataka");
      return res.redirect(`${FRONTEND_URL}/unospodataka`);
    }

    console.log("Korisnik postoji → /");
    return res.redirect(`${FRONTEND_URL}/`);
  } catch (err) {
    console.error("Neispravan token:", err);
    return res.redirect(`${FRONTEND_URL}/login`);
  }
});

// /provjera-autentifikacije
router.get("/provjera-autentifikacije", async (req, res) => {
  try {
    console.log("Provjera autentifikacije, req.cookies =", req.cookies);
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ greska: "Nema tokena" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token =", decoded);

    const korisnik = await Korisnici.findById(decoded.id);
    if (!korisnik) return res.status(404).json({ greska: "Korisnik nije pronađen" });

    const klub = await Klub.findOne({ ownerId: korisnik._id });

    console.log("Korisnik i klub dohvaćeni:", { korisnik, klub });
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
    secure: true,
    sameSite: "None",
  });

  res.json({ poruka: "Uspješno odjavljen" });
});

module.exports = router;