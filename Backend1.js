require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = global.fetch || require("node-fetch");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env file");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

/* ==============================
   DATABASE CONNECTION
============================== */

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/triplens");

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trip = mongoose.model("Trip", TripSchema);

/* ==============================
   CREATE TRIP
============================== */

app.post("/trips", async (req, res) => {
  try {
    const { userId, source, destination, mode, budget, style } = req.body;

    let days = 4;

    if (mode === "Flight") days = 6;
    if (mode === "Train") days = 5;
    if (mode === "Car") days = 4;

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
    console.error(err);
    res.status(500).send("Trip save failed");
  }
});

/* ==============================
   GET USER TRIPS
============================== */

app.get("/trips", async (req, res) => {
  try {
    const userId = req.query.userId;
    const trips = await Trip.find({ userId });
    res.json(trips);
  } catch (err) {
    res.status(500).send("Failed to fetch trips");
  }
});

/* ==============================
   GENERATE AI ITINERARY
============================== */

app.post("/generate-itinerary", async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).send("Trip not found");
    }

    const prompt = `
You are an expert travel planner.

Create a ${trip.days}-day travel itinerary for a trip from ${trip.source} to ${trip.destination}.

Trip Details:
- Travel Style: ${trip.style || "balanced"}
- Budget: ${trip.budget || "not specified"}
- Transport Mode: ${trip.mode}

Requirements:
1. Break the itinerary into Day 1, Day 2, etc.
2. Include 3–5 activities per day.
3. Suggest famous landmarks, hidden gems, and local food experiences.
4. Mention approximate best time of day (morning/afternoon/evening).
5. Keep descriptions concise but useful.
6. Make the plan realistic and geographically sensible.

Format Example:

Day 1 – Arrival & City Introduction
- Morning: ...
- Afternoon: ...
- Evening: ...

Day 2 – Culture & Landmarks
- ...

Only return the itinerary text.
`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("Gemini API error:", text);
      return res.status(500).send("AI service failed");
    }

    const aiData = await aiRes.json();

    let itinerary = "";

    try {
      itinerary =
        aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "AI failed to generate itinerary.";
    } catch {
      itinerary = "AI response parsing failed.";
    }

    res.json({
      itinerary
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate itinerary");
  }
});

app.get("/", (req, res) => {
  res.send("TripLens API running 🚀");
});

/* ==============================
   SERVER START
============================== */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`TripLens backend running on port ${PORT}`);
});
