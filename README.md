🌍 TripLens

TripLens is an AI-powered travel companion built for modern explorers. It doesn’t just store your trips — it understands them.

Scan tickets, generate intelligent itineraries, track your travel habits, measure sustainability impact, and get smart reminders — all in one seamless dashboard.

TripLens transforms travel from random bookings into structured journeys with insight, intention, and personality.

⸻

🚀 What TripLens Does

✈️ Smart Itinerary Generation
Generate dynamic day-wise travel plans based on your budget, travel mode, destination, and travel style.

🧠 Intent-Based Planning
Choose your vibe — Budget, Luxury, Adventure, Relaxed, or Balanced — and let AI adapt your trip accordingly.

📊 Travel Intelligence Dashboard
Track total trips, yearly activity, most visited destinations, streaks, spending trends, and sustainability footprint.

🔥 Streak & Goal System
Turn travel into momentum. Build monthly streaks and set yearly exploration goals.

🌱 Carbon Awareness
Understand the environmental impact of your travel mode and make smarter decisions.

🧳 Flexible Entry System
Enter trips manually or upload tickets for structured planning.

💾 Persistent Itineraries
AI-generated plans are stored and attached to each trip for future reference.

⸻

🏗 Tech Stack

Frontend:
	•	React 18
	•	TypeScript
	•	Vite
	•	Tailwind CSS
	•	Framer Motion

Backend:
	•	Node.js
	•	Express
	•	MongoDB (local or Atlas)

AI:
	•	Groq API (primary - fast & free tier)
	•	Hugging Face Inference API (fallback)
	•	Ollama (optional local)

⸻

🧩 Vision

Most travel apps help you book tickets.

TripLens helps you understand your travel.

It’s not just about where you go — it’s about how you explore, how often you move, and what kind of traveler you’re becoming.

⸻

⸻

🚀 Getting Started

Local Development:
```bash
npm install
npm run dev
```

Access:
- Frontend: http://localhost:5174
- Backend API: http://localhost:4000

Production Deployment:

1. Set environment variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/triplens
   GROQ_API_KEY=your_groq_key
   NODE_ENV=production
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy to Vercel or your hosting platform
   ```

Required API Keys:
- **Groq** (free tier): https://console.groq.com
- **MongoDB Atlas** (free tier): https://www.mongodb.com/cloud/atlas
- **HuggingFace** (optional backup): https://huggingface.co/settings/tokens
