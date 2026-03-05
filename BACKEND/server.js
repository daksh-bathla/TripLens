require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const { Types } = mongoose;

const Trip = require("./models/trip");
const tripRoutes = require("./routes/tripRoutes");

console.log("Starting TripLens server...");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/trips", tripRoutes);

// === Create Trip From OCR Ticket ===
app.post("/create-trip-from-ticket", async (req, res) => {
  try {
    const { source, destination, date, pnr, userId, rawText } = req.body;

    // === Attempt to auto-detect route from OCR text if not provided ===
    let detectedSource = source;
    let detectedDestination = destination;

    if ((!detectedSource || !detectedDestination) && rawText) {
      const routeMatch = rawText.match(/([A-Z]{3})\s*[\-→]\s*([A-Z]{3})/);

      if (routeMatch) {
        detectedSource = detectedSource || routeMatch[1];
        detectedDestination = detectedDestination || routeMatch[2];
      }
    }

    if (!detectedSource || !detectedDestination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    // Default values for ticket-based trips
    const trip = new Trip({
      source: detectedSource,
      destination: detectedDestination,
      mode: "Flight",
      budget: 15000,
      style: "smart",
      days: 3,
      pnr,
      departureDate: date,
      userId
    });

    await trip.save();

    res.json({
      message: "Trip created from ticket",
      tripId: trip._id
    });

  } catch (err) {
    console.error("Ticket trip creation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generate itinerary route (Hugging Face powered + DB-saving)
app.post("/generate-itinerary", async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    if (!Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: "Invalid trip ID format" });
    }

    if (!process.env.HF_API_KEY) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const trip = await Trip.findById(tripId);
    if (trip && trip.itinerary) {
      return res.json({ itinerary: trip.itinerary });
    }
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { source, destination, budget, mode, style, days } = trip || {};

    // === Location-Aware Hint ===
    let locationHint = "Explore local culture and iconic attractions.";
    const lowerDestination = (destination || "").toLowerCase();

    if (lowerDestination.includes("jaipur")) {
      locationHint = "Include forts, palaces, and Rajasthani cuisine.";
    } else if (lowerDestination.includes("mumbai")) {
      locationHint = "Include Marine Drive, Bollywood history, and street food.";
    } else if (lowerDestination.includes("goa")) {
      locationHint = "Include beaches, water sports, and coastal nightlife.";
    }

    // === Fetch Recent Trip History for AI Personalization ===
    let historyContext = "";
    try {
      if (trip.userId) {
        const pastTrips = await Trip.find({
          userId: trip.userId,
          _id: { $ne: trip._id }
        })
          .sort({ createdAt: -1 })
          .limit(3);

        if (pastTrips.length) {
          const historyList = pastTrips
            .map(t => `${t.source} to ${t.destination} (${t.style || "balanced"})`)
            .join("; ");

          historyContext = `User past travel history: ${historyList}. Use this to align the travel style.`;
        }
      }
    } catch (err) {
      console.warn("Could not load trip history for AI context");
    }

    const safeDays = days && days > 0 ? days : 1;
    const dailyBudget = Math.floor(Number(budget || 0) / safeDays);

    const prompt = `
Create a ${days}-day travel itinerary from ${source} to ${destination}.

Travel Mode: ${mode}
Total Budget: ₹${budget}
Daily Budget: ₹${dailyBudget}
Style: ${style || "balanced"}

${historyContext}

Special Instructions:
- Focus on ${style || "balanced exploration"}
- ${locationHint}
- Keep it structured as Day 1, Day 2, etc.
- Keep activities realistic within daily budget
- Add short descriptions per activity
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    // === Hugging Face Call ===
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );
    clearTimeout(timeout);

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      return res.status(500).json({ error: errText });
    }

    const data = await hfResponse.json();

    let generatedText = "";

    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      generatedText = "AI response format unexpected.";
    }

    if (generatedText.startsWith(prompt)) {
      generatedText = generatedText.replace(prompt, "").trim();
    }

    // === Save Itinerary to DB ===
    let carbon = 0;
    if (mode === "Flight") carbon = safeDays * 90;
    else if (mode === "Train") carbon = safeDays * 30;
    else if (mode === "Car") carbon = safeDays * 60;

    trip.carbon = carbon;
    trip.itinerary = generatedText;
    await trip.save();

    res.json({ itinerary: generatedText });

  } catch (err) {
    console.error("Error generating itinerary:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === AI TRAVEL INSIGHTS ===
app.get("/travel-insights", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const trips = await Trip.find({ userId });

    if (!trips.length) {
      return res.json({
        insight: "Plan your first trip to unlock travel insights."
      });
    }

    const totalTrips = trips.length;

    // Average trip length
    const avgDays = Math.round(
      trips.reduce((sum, t) => sum + (t.days || 0), 0) / totalTrips
    );

    // Preferred travel mode
    const modeCounts = {};
    trips.forEach(t => {
      if (!t.mode) return;
      modeCounts[t.mode] = (modeCounts[t.mode] || 0) + 1;
    });

    const preferredMode =
      Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "various transport modes";

    // Most visited destination
    const destinationCounts = {};
    trips.forEach(t => {
      if (!t.destination) return;
      destinationCounts[t.destination] =
        (destinationCounts[t.destination] || 0) + 1;
    });

    const topDestination =
      Object.entries(destinationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    let insight = `You usually take ${avgDays}-day trips and prefer traveling by ${preferredMode.toLowerCase()}.`;

    if (topDestination) {
      insight += ` Your most visited destination is ${topDestination}.`;
    }

    res.json({ insight });

  } catch (err) {
    console.error("Travel insight error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("TripLens API is running");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/triplens";
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not found in .env. Using local MongoDB at mongodb://127.0.0.1:27017/triplens");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

startServer().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});