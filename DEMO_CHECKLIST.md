# TripLens Demo Checklist

✅ Ready for public demo — verify these before launch.

## Pre-Launch Checks

- [ ] **Groq API Key Set**
  - [ ] GROQ_API_KEY environment variable configured
  - [ ] Verified key works in Groq console
  - [ ] Account has remaining quota

- [ ] **MongoDB Atlas Ready**
  - [ ] Cluster created (M0 free tier ok)
  - [ ] Database user created with permissions
  - [ ] IP whitelist includes deployment server
  - [ ] Connection string tested locally

- [ ] **Frontend Build**
  - [x] Frontend builds without errors (`npm run build` ✓)
  - [x] dist/ folder size ~400KB ✓
  - [ ] Test in browser (http://localhost:5174)
  - [ ] All pages load
  - [ ] API proxy works

- [ ] **Backend Ready**
  - [x] Server.mjs syntax valid ✓
  - [ ] All routes respond to requests
  - [ ] `/api/health` returns 200
  - [ ] Trip creation works
  - [ ] Itinerary generation works

- [ ] **Deployment**
  - [ ] Code pushed to GitHub
  - [ ] Vercel connected to repo
  - [ ] Environment variables set in Vercel dashboard
  - [ ] Deploy logs show success
  - [ ] Public URL accessible

## Demo Flow

1. **Landing** → Show dashboard (empty initially)
2. **Create Trip** → Fill form:
   - Source: "Delhi"
   - Destination: "Goa"
   - Mode: "Flight"
   - Budget: 20000
   - Style: "Balanced"
3. **Wait for Groq** → Show itinerary generating (5-10s)
4. **Success** → Itinerary displays with day-by-day plan
5. **Show Stats** → Dashboard updates with:
   - Trip count
   - Carbon footprint
   - Travel history

## Demo Talking Points

- ✨ "AI-powered travel planning with Groq API"
- 🚀 "Instant itineraries tailored to your budget & style"
- 📊 "Track your travel footprint and sustainability impact"
- 🔄 "Real-time updates with MongoDB"
- 🎨 "Beautiful, responsive UI built with React + Tailwind"
- 🌍 "Works offline-first with cached data"

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Itinerary not generating | Check GROQ_API_KEY, verify quota remaining |
| No trips shown | Check MongoDB connection, verify MONGO_URI |
| Frontend blank | Verify dist/ built, check browser console |
| API 500 errors | Check server logs, verify env vars |
| Slow itinerary | Normal (Groq takes 5-10s), show loading state |

## Quick Verification Commands

```bash
# Test backend
curl http://localhost:4000/api/health

# Test frontend build
npm run build --prefix FRONTEND

# Check env vars
cat .env | grep -E "GROQ|MONGO"

# Test API directly
curl -X POST http://localhost:4000/api/trips \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo","source":"Delhi","destination":"Mumbai","mode":"Flight","budget":10000,"style":"balanced"}'
```

## Post-Demo

- [ ] Note any bugs/issues encountered
- [ ] Collect demo feedback
- [ ] Update feature backlog
- [ ] Monitor deployment logs for errors
