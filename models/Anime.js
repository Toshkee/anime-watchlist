const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
  title: String,
  status: String,
  rating: Number,
  notes: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isDefault: { type: Boolean, default: false },
  forDashboard: { type: Boolean, default: true } 
});

module.exports = mongoose.model("Anime", animeSchema);