const mongoose = require("mongoose");

const pozivSudcaSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    natjecanjeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Natjecanje",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: ["pozvan", "prihvacen", "odbijen"],
      required: true,
      default: "pozvan"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PozivSudca", pozivSudcaSchema, "poziv_sudaca");