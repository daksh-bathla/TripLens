require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

const Trip = require("./models/trip");
const tripRoutes = require("./routes/tripRoutes");

console.log("Starting TripLens server...");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/trips", tripRoutes);

// Generate itinerary route (Hugging Face powered + DB-saving)
app.post("/generate-itinerary", async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { source, destination, budget, mode, style, days } = trip;

    // === Location-Aware Hint ===
    let locationHint = "Explore local culture and iconic attractions.";
    const lowerDestination = destination.toLowerCase();

    if (lowerDestination.includes("jaipur")) {
      locationHint = "Include forts, palaces, and Rajasthani cuisine.";
    } else if (lowerDestination.includes("mumbai")) {
      locationHint = "Include Marine Drive, Bollywood history, and street food.";
    } else if (lowerDestination.includes("goa")) {
      locationHint = "Include beaches, water sports, and coastal nightlife.";
    }

    const dailyBudget = Math.floor(Number(budget) / days);

    const prompt = `
Create a ${days}-day travel itinerary from ${source} to ${destination}.

Travel Mode: ${mode}
Total Budget: ₹${budget}
Daily Budget: ₹${dailyBudget}
Style: ${style || "balanced"}

Special Instructions:
- Focus on ${style || "balanced exploration"}
- ${locationHint}
- Keep it structured as Day 1, Day 2, etc.
- Keep activities realistic within daily budget
- Add short descriptions per activity
`;

    // === Hugging Face Call ===
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

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

    // === Save Itinerary to DB ===
    trip.itinerary = generatedText;
    await trip.save();

    res.json({ itinerary: generatedText });

  } catch (err) {
    console.error("Error generating itinerary:", err.message);
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
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

startServer();