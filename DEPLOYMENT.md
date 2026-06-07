# TripLens Deployment Guide

Demo-ready setup for public deployment.

## Prerequisites

1. **Groq API Key** (fast, free tier)
   - Go to https://console.groq.com/
   - Create account & get API key
   - Free tier: 30 requests/minute

2. **MongoDB Atlas** (free tier)
   - Go to https://www.mongodb.com/cloud/atlas
   - Create cluster (M0 is free)
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/triplens`

3. **Hosting** (Vercel recommended)
   - Deploy from GitHub or Vercel directly

## Setup Steps

### Local Testing

```bash
# 1. Install dependencies
npm install
cd FRONTEND && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your values:
# - MONGO_URI: your MongoDB Atlas connection
# - GROQ_API_KEY: your Groq API key
# - NODE_ENV: development

# 3. Run locally
npm run dev
# Frontend: http://localhost:5174
# Backend: http://localhost:4000
```

### Production Deployment (Vercel)

```bash
# 1. Build frontend
npm run build
# Creates dist/ folder with optimized frontend

# 2. Set environment variables in Vercel dashboard:
#    - MONGO_URI
#    - GROQ_API_KEY
#    - NODE_ENV=production

# 3. Deploy via:
#    a) GitHub integration (Vercel auto-deploys on push)
#    b) Vercel CLI: vercel
```

### Environment Variables

Required for production:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/triplens
GROQ_API_KEY=gsk_... (from Groq console)
NODE_ENV=production
PORT=3000 (Vercel default)
```

Optional (fallback):
```
HF_API_KEY=hf_... (HuggingFace backup)
```

## Testing the Demo

1. Create a new trip:
   - Source: "Delhi"
   - Destination: "Goa"
   - Mode: "Flight"
   - Budget: 20000
   - Style: "Balanced"

2. Verify:
   - Trip saves to MongoDB
   - Groq generates itinerary (5-10 seconds)
   - Dashboard shows trip
   - Carbon metrics calculated

## Troubleshooting

**No itinerary generated?**
- Check GROQ_API_KEY is set in environment
- Verify Groq API key has quota remaining
- Check server logs for API errors

**Database connection fails?**
- Verify MONGO_URI connection string
- Check MongoDB Atlas allows your IP
- Ensure database user has permissions

**Frontend shows blank?**
- Verify `npm run build` completed
- Check dist/ folder exists
- Clear browser cache

## Demo Callouts

✨ Smart AI itineraries via Groq (fast & free)
📊 Real-time trip tracking with MongoDB
🌱 Carbon impact calculation built-in
🎨 Beautiful UI with Tailwind + Framer Motion
