const Trip = require("../models/trip");
const mongoose = require("mongoose");

// Create Trip
exports.createTrip = async (req, res) => {
  try {
    const { userId, source, destination, mode, budget, departureTime, style } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!source || !destination || !mode) {
      return res.status(400).json({ error: "Source, destination, and mode are required" });
    }

    const numericBudget = Number(budget) || 0;

    // === Dynamic Day Logic Based on Budget ===
    let days = 2;
    if (numericBudget > 40000) days = 5;
    else if (numericBudget > 25000) days = 4;
    else if (numericBudget > 12000) days = 3;

    // === Adjust Days Based on Travel Mode ===
    if (mode === "Car") days += 1; // road trips usually slower
    if (mode === "Flight") days = Math.max(2, days - 1); // shorter trips more common

    // === Simple Location-Aware Recommendations ===
    let locationHint = "Explore local culture and iconic attractions.";

    const lowerDestination = (destination || "").toLowerCase();

    if (lowerDestination.includes("jaipur")) {
      locationHint = "Visit forts, palaces, and explore Rajasthani cuisine.";
    } else if (lowerDestination.includes("mumbai")) {
      locationHint = "Explore Marine Drive, Bollywood spots, and street food.";
    } else if (lowerDestination.includes("delhi")) {
      locationHint = "Visit historical monuments and vibrant markets.";
    } else if (lowerDestination.includes("goa")) {
      locationHint = "Enjoy beaches, water sports, and coastal nightlife.";
    }

    // === Carbon Estimation ===
    let carbon = 0;
    if (mode === "Flight") carbon = days * 90;
    else if (mode === "Train") carbon = days * 30;
    else if (mode === "Car") carbon = days * 60;
    else carbon = days * 20;

    const trip = new Trip({
      userId,
      source: source.trim(),
      destination: destination.trim(),
      mode,
      budget: numericBudget,
      departureTime,
      style: style || "Balanced",
      days,
      carbon,
      locationHint
    });

    await trip.save();

    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Trips
exports.getTrips = async (req, res) => {
  try {
    const { userId } = req.query;

    const query = userId ? { userId } : {};

    const trips = await Trip.find(query).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Trip
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};