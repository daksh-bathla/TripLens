import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/triplens";
mongoose.connect(MONGO_URI)
  .then(() => console.log('🚀 TripLens Data Engine Connected'))
  .catch(err => console.error('❌ Data Engine Connection Failure:', err));

// Models
const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  mode: { type: String, enum: ['Flight', 'Train', 'Car'], default: 'Flight' },
  budget: { type: Number, default: 15000 },
  style: { type: String, default: 'balanced' },
  carbon: { type: Number, default: 0 },
  days: { type: Number, default: 3 },
  itinerary: { type: String, default: '' },
  pnr: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', TripSchema);

// AI Helpers
async function generateWithOllama(prompt) {
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt: prompt,
        stream: false
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.response || null;
  } catch {
    return null;
  }
}

async function generateWithHuggingFace(prompt) {
  try {
    if (!process.env.HF_API_KEY) return null;
    const res = await fetch(
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
    if (!res.ok) return null;
    const data = await res.json();
    let text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    return text?.replace(prompt, "").trim() || null;
  } catch {
    return null;
  }
}

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'operational', version: '2.0.0' }));

// Create Trip
app.post('/api/trips', async (req, res) => {
  try {
    const { userId, source, destination, mode, budget, style, pnr } = req.body;
    
    // Heuristic Carbon calculation
    let carbon = 0;
    const days = mode === 'Flight' ? 5 : mode === 'Train' ? 4 : 3;
    if (mode === 'Flight') carbon = days * 120;
    else if (mode === 'Train') carbon = days * 35;
    else if (mode === 'Car') carbon = days * 75;

    const trip = new Trip({ userId, source, destination, mode, budget, style, carbon, days, pnr });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize mission log.' });
  }
});

// Get User Trips
app.get('/api/trips', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mission logs.' });
  }
});

// Generate Itinerary
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Mission log not found.' });

    const prompt = `Create a ${trip.days}-day itinerary from ${trip.source} to ${trip.destination}. 
    Mode: ${trip.mode}, Budget: ₹${trip.budget}, Style: ${trip.style}. 
    Format: Day X\nMorning: ...\nAfternoon: ...\nEvening: ...`;

    // Try Local AI first, then fallback to HF
    let itinerary = await generateWithOllama(prompt);
    if (!itinerary) itinerary = await generateWithHuggingFace(prompt);
    if (!itinerary) itinerary = "AI synthesis failed. System operating in manual mode.";

    trip.itinerary = itinerary;
    await trip.save();
    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ error: 'AI synthesis disruption.' });
  }
});

// Ticket Scanning (Mocked OCR for now)
app.post('/api/scan-ticket', async (req, res) => {
  const { rawText } = req.body;
  // Simple pattern matching for demo
  const sourceMatch = rawText.match(/FROM:\s*([A-Z\s]+)/i);
  const destMatch = rawText.match(/TO:\s*([A-Z\s]+)/i);
  res.json({
    source: sourceMatch ? sourceMatch[1].trim() : 'DELHI',
    destination: destMatch ? destMatch[1].trim() : 'MUMBAI',
    mode: 'Flight'
  });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/dist/index.html')));
}

const isDirectRun = fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  app.listen(PORT, () => console.log(`🛰️ TripLens Intelligence Hub Active on port ${PORT}`));
}

export default app;
