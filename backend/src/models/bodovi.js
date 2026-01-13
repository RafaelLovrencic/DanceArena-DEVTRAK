const mongoose = require("mongoose");

const bodoviSchema = new mongoose.Schema(
  {
    sudacId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   
      required: true
    },
    ocjena: {
      type: Number,
      required: true,
      min: 0,
      max: 30
    }
  },
  { _id: false }
);

module.exports = bodoviSchema;