const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Klub = require("../models/klub");

module.exports = async (req, res, next) => {
    try {
        // 1️⃣ Pokušaj uzeti token iz Authorization headera
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 2️⃣ Ako nema tokena u headeru, fallback na cookie (ako želiš)
        if (!token) token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ poruka: "Niste prijavljeni" });
        }

        // 3️⃣ Dekodiranje tokena
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Dohvati korisnika i njegov klub
        const korisnik = await User.findById(decoded.id);
        if (!korisnik) {
            return res.status(401).json({ poruka: "Korisnik ne postoji" });
        }

        const klub = await Klub.findOne({ ownerId: korisnik._id });

        // 5️⃣ Dodaj podatke u req.user
        req.user = korisnik;
        req.user.klubId = klub?._id || null;

        next();
    } catch (err) {
        console.error("AuthMiddleware greška:", err);
        return res.status(401).json({ poruka: "Nevažeći token" });
    }
};