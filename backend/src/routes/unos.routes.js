const express = require("express");
const jwt = require("jsonwebtoken");
const Korisnici = require("../models/user");
const Klub = require("../models/klub");

var router = express.Router();

var path = require('path');
var fs = require('fs');

router.post("/", async (req, res) => {
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
});

// trenutno se ne koristi
router.post('/registracija', function(req, res) {
    console.log(req.body);

    const putanja = path.join(__dirname, '..', 'repository', 'korisnici.repository.json');
    const podaci = JSON.parse(fs.readFileSync(putanja, 'utf8'));

    podaci.push(req.body);

    fs.writeFileSync(putanja, JSON.stringify(podaci, null, 2));

    res.status(200).send();
})



router.put('/:id', async function(req, res) {
    try {

        const { ime, prezime, uloga, email, imeKluba, lokacija } = req.body;

        const updateData = {};

        if (ime) updateData.ime = ime;
        if (prezime) updateData.prezime = prezime;
        if (uloga) updateData.uloga = uloga;
        if (email) updateData.email = email;
        if (imeKluba) updateData.imeKluba = imeKluba;
        if (lokacija) updateData.lokacija = lokacija;

        const azurirano = await Korisnici.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
            //.populate("suci", "ime email")
            //.populate("kategorije", "godiste stil velicina");

        if (!azurirano)
            return res.status(404).json({ poruka: "Korisnik nije pronađen" });

        res.json({ poruka: "Korisnik uspješno ažuriran", natjecanje: azurirano });
    
    } catch (err) {
        console.error("Greška pri ažuriranju korisnika:", err);
        res.status(500).json({ poruka: "Greška pri ažuriranju korisnika" });
    }
});


module.exports = router;