

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  userId: { type: String },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  mode: { type: String, required: true },
  budget: { type: Number, required: true },
  riskScore: { type: Number },
  riskLevel: { type: String },
  delayProbability: { type: Number },
  confidenceScore: { type: Number },
  carbon: { type: Number },
  breakdown: {
    transportVolatility: Number,
    financialExposure: Number,
    timingRisk: Number,
    externalUncertainty: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", tripSchema);