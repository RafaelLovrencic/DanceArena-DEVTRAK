const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Klub = require("../models/klub");

module.exports = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token) token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ poruka: "Niste prijavljeni" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const clientFingerprint = req.headers["x-fingerprint"];
        if (!clientFingerprint || clientFingerprint !== decoded.fp) {
        return res.status(401).json({ poruka: "Nevažeći token (fingerprint mismatch)" });
        }

        const korisnik = await User.findById(decoded.id);
        if (!korisnik) {
            return res.status(401).json({ poruka: "Korisnik ne postoji" });
        }

        const klub = await Klub.findOne({ ownerId: korisnik._id });

        req.user = korisnik;
        req.user.klubId = klub?._id || null;

        next();
    } catch (err) {
        console.error("AuthMiddleware greška:", err);
        return res.status(401).json({ poruka: "Nevažeći token" });
    }
};