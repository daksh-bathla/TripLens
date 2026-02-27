require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");

const tripRoutes = require("./routes/tripRoutes");

console.log("Starting TripLens server...");

const app = express();


app.use(cors());
app.use(express.json());

app.use("/trips", tripRoutes);

// Generate itinerary route
app.post("/generate-itinerary", async (req, res) => {
  try {
    const { source, destination, budget, mode } = req.body;

    if (!source || !destination || !budget || !mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
Create a practical 3-day travel itinerary.
From: ${source}
To: ${destination}
Budget: ₹${budget}
Travel Mode: ${mode}

Include:
- Day wise breakdown
- Cost optimization tips
- Safety tips
- Sustainability suggestion
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a smart travel planner AI." },
        { role: "user", content: prompt }
      ],
    });

    res.json({
      itinerary: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("Error generating itinerary:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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