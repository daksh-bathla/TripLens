require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

const tripRoutes = require("./routes/tripRoutes");

console.log("Starting TripLens server...");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/trips", tripRoutes);

// Generate itinerary route (local mock AI)
app.post("/generate-itinerary", async (req, res) => {
  try {
    const { source, destination, budget, mode } = req.body;

    if (!source || !destination || !budget || !mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dailyBudget = Math.floor(Number(budget) / 3);

    const itinerary = `
Day 1: Arrival in ${destination}
- Travel via ${mode}
- Check into budget-friendly accommodation (~₹${dailyBudget})
- Explore local markets and nearby attractions

Day 2: Main Attractions
- Visit top landmarks in ${destination}
- Try local cuisine (set food budget ₹${Math.floor(dailyBudget / 2)})
- Evening cultural exploration

Day 3: Relax & Return
- Light sightseeing
- Souvenir shopping within budget
- Return to ${source}

Cost Optimization Tips:
- Pre-book transport
- Use public transport locally

Safety Tips:
- Keep emergency contacts saved
- Avoid isolated areas at night

Sustainability:
- Carry reusable bottle
- Support local businesses
`;

    res.json({ itinerary });
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