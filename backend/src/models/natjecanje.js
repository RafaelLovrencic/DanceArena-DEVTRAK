const mongoose = require('mongoose');

const natjecanjeSchema = new mongoose.Schema({
  ime: {
    type: String,
    required: true
  },
  opis: {
    type: String,
    required: true
  },
  datum: {
    type: Date,
    required: true
  },
  lokacija: {
    type: String,
    required: true
  },
  stanje: {
      type: String,
      enum: ["otvoreno", "zaključano", "zatvoreno"],
      required: true,
      default: "otvoreno"
  },
  organizatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // referenca na organizatora
    required: true
  },
  kategorije: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kategorije' // referenca na kolekciju kategorija
  }],
  suci: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // referenca na suce (User)
  }],
  kotizacija: {
    type: Number, 
    required: false // može ostati prazno
  },
  platitelji: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // referenca na voditelje (User)
  }],
}, { timestamps: true });

module.exports = mongoose.model('Natjecanje', natjecanjeSchema, 'natjecanje');
