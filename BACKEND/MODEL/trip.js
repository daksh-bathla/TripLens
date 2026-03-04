const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  userId: { type: String },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  mode: { type: String, required: true },
  budget: { type: Number, required: true },
  style: { type: String },
  days: { type: Number },
  itinerary: { type: String },
  carbon: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", tripSchema);