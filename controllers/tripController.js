const Trip = require("../models/trip");
const { calculateRisk } = require("../riskEngine");

// Create Trip
exports.createTrip = async (req, res) => {
  try {
    const { source, destination, mode, budget, departureTime } = req.body;

    // Calculate risk on backend
    const riskData = calculateRisk({
      mode,
      budget: Number(budget),
      departureTime
    });

    const trip = new Trip({
      source,
      destination,
      mode,
      budget,
      riskScore: riskData.riskScore,
      riskLevel: riskData.riskLevel,
      confidenceScore: riskData.confidenceScore,
      delayProbability: riskData.breakdown.externalUncertainty,
      carbon: mode === "Flight" ? 5 : mode === "Train" ? 2 : 1,
      breakdown: riskData.breakdown
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
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Trip
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};