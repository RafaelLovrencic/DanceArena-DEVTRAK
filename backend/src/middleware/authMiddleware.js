const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Klub = require("../models/klub");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ poruka: "Niste prijavljeni" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const korisnik = await User.findById(decoded.id);
    if (!korisnik) {
      return res.status(401).json({ poruka: "Korisnik ne postoji" });
    }

    const klub = await Klub.findOne({ ownerId: korisnik._id });

    req.user = korisnik;
    req.user.klubId = klub?._id || null;

    next();
  } catch (err) {
    return res.status(401).json({ poruka: "Nevažeći token" });
  }
};