const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    source: {
      type: String,
      required: true,
      trim: true
    },

    destination: {
      type: String,
      required: true,
      trim: true
    },

    mode: {
      type: String,
      required: true,
      enum: ["Flight", "Train", "Car", "Bus", "Other"]
    },

    budget: {
      type: Number,
      required: true,
      min: 0
    },

    style: {
      type: String,
      enum: ["Luxury", "Balanced", "Budget", "Adventure"],
      default: "Balanced"
    },

    days: {
      type: Number,
      default: 2,
      min: 1
    },

    departureTime: {
      type: String
    },

    itinerary: {
      type: String,
      default: ""
    },

    carbon: {
      type: Number,
      default: 0
    },

    locationHint: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trip", tripSchema);