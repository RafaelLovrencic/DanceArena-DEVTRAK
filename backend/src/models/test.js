// model za testiranje s MongoDB bazom

const mongoose = require("mongoose");

const korisnikSchema = new mongoose.Schema({
  ime: String,
  email: String,
  photo: String,
  google_id: String,
  uloga: {
    type: String,
    enum: ["sudac", "voditelj", "organizator"],
    default: null
  },
  imeKluba: {
    type: String,
    default: null
  },
  lokacija: {
    type: String,
    deafult: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", korisnikSchema);


