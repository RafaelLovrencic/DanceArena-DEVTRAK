const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    godisnjaClanarinaPriceId: { type: String, required: true },
}, { collection: "settings" });

module.exports = mongoose.model("Settings", settingsSchema);