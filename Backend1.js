require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

/* ==============================
   ENVIRONMENT VARIABLES
============================== */

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/triplens";

/* ==============================
   DATABASE CONNECTION
============================== */

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

/* ==============================
   TRIP MODEL
============================== */

const TripSchema = new mongoose.Schema({
  userId: String,
  source: String,
  destination: String,
  mode: String,
  budget: Number,
  style: String,
  carbon: Number,
  days: Number,
  itinerary: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trip = mongoose.model("Trip", TripSchema);

/* ==============================
   HEALTH CHECK
============================== */

app.get("/", (req, res) => {
  res.send("TripLens API running 🚀");
});

/* ==============================
   CREATE TRIP
============================== */

app.post("/trips", async (req, res) => {
  try {
    const { userId, source, destination, mode, budget, style } = req.body;

    if (!source || !destination || !mode) {
      return res.status(400).send("Missing required trip fields");
    }

    let days = 4;
    if (mode === "Flight") days = 6;
    if (mode === "Train") days = 5;

    let carbon = 0;
    if (mode === "Flight") carbon = 180;
    if (mode === "Train") carbon = 40;
    if (mode === "Car") carbon = 120;

    const trip = new Trip({
      userId,
      source,
      destination,
      mode,
      budget,
      style,
      carbon,
      days
    });

    await trip.save();
    res.json(trip);

  } catch (err) {
    console.error("Trip creation failed:", err);
    res.status(500).send("Trip save failed");
  }
});

/* ==============================
   GET USER TRIPS
============================== */

app.get("/trips", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).send("userId required");
    }

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });

    res.json(trips);
  } catch (err) {
    console.error("Fetch trips failed:", err);
    res.status(500).send("Failed to fetch trips");
  }
});

/* ==============================
   GENERATE AI ITINERARY
============================== */

app.post("/generate-itinerary", async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).send("tripId required");
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).send("Trip not found");
    }

    const prompt = `
You are a professional travel planner.

Generate a ${trip.days}-day travel itinerary for a trip from ${trip.source} to ${trip.destination}.

Trip Details:
Transport: ${trip.mode}
Travel Style: ${trip.style || "balanced"}
Budget: ${trip.budget || "moderate"}

Strict Instructions:
- Start directly with "Day 1"
- Do NOT repeat the instructions
- Do NOT include explanations before or after the itinerary
- Each day must contain: Morning, Afternoon, Evening
- Include 3–4 realistic activities per day
- Mention real landmarks or neighborhoods when possible

Required Output Format:

Day 1
Morning: ...
Afternoon: ...
Evening: ...

Day 2
Morning: ...
Afternoon: ...
Evening: ...

Continue until Day ${trip.days}.
Only output the itinerary.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "phi3",
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Ollama AI error:", text);
      return res.status(500).send("Local AI service failed");
    }

    const data = await response.json();

    const itinerary =
      data?.response || "Local AI could not generate itinerary.";

    trip.itinerary = itinerary;
    await trip.save();

    res.json({ itinerary });

  } catch (err) {
    console.error("Itinerary generation failed:", err);
    res.status(500).send("Failed to generate itinerary");
  }
});

/* ==============================
   SERVER START
============================== */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`TripLens backend running on port ${PORT}`);
});
