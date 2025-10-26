const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
  title: String,
  status: String,
  rating: Number,
  notes: String,
  description: String,    
  genre: String,         
  episodes: String,

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isDefault: { type: Boolean, default: false },
  forDashboard: { type: Boolean, default: true }, 
  image: { type: String, default: '/assets/anime_images/default.png' } 
});

module.exports = mongoose.model("Anime", animeSchema);