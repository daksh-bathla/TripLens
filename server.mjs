import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (optional for demo)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/triplens";
let dbConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    dbConnected = true;
    console.log('🚀 TripLens Data Engine Connected');
  })
  .catch(err => {
    console.log('⚠️  Running in demo mode (no database). Data will not persist.');
  });

// In-memory store for demo mode
const demoTrips = new Map();

// Models
const CommentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  authorName: { type: String, default: '' },
  authorType: { type: String, enum: ['agent', 'client'], default: 'client' },
  text: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

const ItineraryItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  category: { type: String, default: 'activity' },
  section: { type: String, default: 'morning' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  location: { type: String, default: '' },
  comments: [CommentSchema]
});

const ItineraryDaySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  day: { type: Number, required: true },
  title: { type: String, default: '' },
  items: [ItineraryItemSchema]
});

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  mode: { type: String, enum: ['Flight', 'Train', 'Car'], default: 'Flight' },
  budget: { type: Number, default: 15000 },
  style: { type: String, default: 'balanced' },
  carbon: { type: Number, default: 0 },
  days: { type: Number, default: 3 },
  itinerary: [ItineraryDaySchema],
  pnr: { type: String, default: '' },
  agencyName: { type: String, default: '' },
  agencyLogo: { type: String, default: '' },
  agencyColor: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  versions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    timestamp: { type: Date, default: Date.now },
    label: { type: String, default: '' },
    itinerary: [ItineraryDaySchema]
  }],
  createdAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', TripSchema);

const TemplateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  days: { type: Number, default: 3 },
  style: { type: String, default: 'balanced' },
  itinerary: [ItineraryDaySchema],
  createdAt: { type: Date, default: Date.now }
});

const Template = mongoose.model('Template', TemplateSchema);
const demoTemplates = new Map();

const ClientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  preferences: { type: String, default: '' },
  loyaltyPrograms: { type: String, default: '' },
  nationality: { type: String, default: '' },
  passportExpiry: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.model('Client', ClientSchema);
const demoClients = new Map();

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  agencyName: { type: String, default: '' },
  agencyLogo: { type: String, default: '' },
  agencyColor: { type: String, default: '' },
  plan: { type: String, default: 'Pro' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const demoUsers = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'triplens-super-secret-key-for-jwt-signing';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return {
      id: payload.sub || payload.id,
      email: payload.email,
      user_metadata: payload.user_metadata
    };
  } catch {
    return null;
  }
}

// In-Memory Rate Limiting
const rateLimitMap = new Map();

function rateLimiter({ windowMs, maxRequests, message }) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Periodically prune inactive IPs to prevent memory leaks in production (capped at 1000 tracked IPs before pruning)
    if (rateLimitMap.size > 1000) {
      for (const [key, value] of rateLimitMap.entries()) {
        const active = value.filter(t => now - t < 15 * 60 * 1000); // Check against longest window (15m)
        if (active.length === 0) {
          rateLimitMap.delete(key);
        } else {
          rateLimitMap.set(key, active);
        }
      }
    }

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const timestamps = rateLimitMap.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    
    if (timestamps.length > maxRequests) {
      opLog('RATE_LIMIT_EXCEEDED', { ip, path: req.path });
      return res.status(429).json({ error: message || 'Too many requests. Please try again later.' });
    }
    next();
  };
}

const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
  message: 'Too many authentication attempts. Please try again later.'
});

const aiRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many AI requests. Please wait before generating again.'
});

const commentRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many comments submitted. Please try again later.'
});

// Operational Logger Helper
function opLog(event, details) {
  const timestamp = new Date().toISOString();
  console.log(`[OP LOG] [${timestamp}] Event: ${event} | Details: ${JSON.stringify(details)}`);
}

// Secure Supabase Token Authentication Middleware
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      opLog('AUTH_FAILURE', { reason: 'Missing or malformed Authorization header', path: req.path });
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    
    const sbUrl = process.env.SUPABASE_URL;
    const sbAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!sbUrl || !sbAnonKey) {
      opLog('SYSTEM_CONFIG_ERROR', { reason: 'Supabase URL/Key missing in env' });
      return res.status(500).json({ error: 'Authentication engine configuration missing.' });
    }
    
    // Validate signature & session directly against Supabase token server
    const sbRes = await fetch(`${sbUrl}/auth/v1/user`, {
      headers: {
        'apikey': sbAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!sbRes.ok) {
      opLog('AUTH_FAILURE', { reason: 'Invalid signature or expired session', path: req.path });
      return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
    }
    
    const sbUser = await sbRes.json();
    req.user = {
      id: sbUser.id,
      email: sbUser.email,
      user_metadata: sbUser.user_metadata
    };
    next();
  } catch (err) {
    opLog('AUTH_ERROR', { error: err.message, path: req.path });
    res.status(500).json({ error: 'Internal token authentication processing error.' });
  }
}

async function seedAgencyData(userId, agencyName, agencyColor) {
  const isNavyColor = agencyColor || '#0f2847';
  
  // 1. Seed 3 Clients
  const clientsData = [
    {
      name: "Aarav Mehta",
      email: "aarav.mehta@titanium.com",
      phone: "+91 98765 43210",
      nationality: "Indian",
      passportExpiry: "2032-12-31",
      loyaltyPrograms: "Marriott Bonvoy: 98213829 (Titanium Elite)",
      preferences: "Vegetarian diet, prefers high floors in hotel bookings, requests window seats on flights."
    },
    {
      name: "Sophia Dubois",
      email: "sophia.dubois@luxurytraveler.fr",
      phone: "+33 6 1234 5678",
      nationality: "French",
      passportExpiry: "2030-05-15",
      loyaltyPrograms: "Air France Flying Blue: AF987654321 (Gold)",
      preferences: "Allergic to shellfish. Prefers boutique hotels and private historical tours. Requests king-size bed."
    },
    {
      name: "Dr. Marcus Vance",
      email: "marcus.vance@stanford.edu",
      phone: "+1 650 555 0199",
      nationality: "American",
      passportExpiry: "2029-09-22",
      loyaltyPrograms: "United MileagePlus: UA0099887 (Premier 1K)",
      preferences: "Prefers quiet rooms away from elevators. Requests early check-in when available. Enjoys wine tasting and scenic drives."
    }
  ];

  const seededClients = [];
  if (dbConnected) {
    for (const c of clientsData) {
      const client = new Client({ userId, ...c });
      await client.save();
      seededClients.push(client);
    }
  } else {
    const memClients = [];
    for (const c of clientsData) {
      const client = { _id: Math.random().toString(36).substr(2, 9), userId, ...c, createdAt: new Date() };
      memClients.push(client);
    }
    demoClients.set(userId, memClients);
    seededClients.push(...memClients);
  }

  // 2. Seed 2 Templates
  const template1Itinerary = [
    {
      day: 1,
      title: "Day 1: Arrival in Jaipur (The Pink City)",
      items: [
        { category: "transfer", section: "morning", title: "Welcome at Jaipur Airport", description: "VIP pickup and transfer to the Taj Rambagh Palace in a private sedan.", startTime: "10:00 AM", endTime: "11:00 AM", location: "Jaipur Airport" },
        { category: "activity", section: "afternoon", title: "Jaipur Local Bazaars walking tour", description: "Guided shopping and walking tour of Johri and Bapu bazaars.", startTime: "03:00 PM", endTime: "05:30 PM", location: "Johri Bazaar" },
        { category: "activity", section: "evening", title: "Traditional dinner at Chokhi Dhani", description: "Experience Rajasthani hospitality, folk dances, and traditional cuisine.", startTime: "07:30 PM", endTime: "10:00 PM", location: "Chokhi Dhani" }
      ]
    },
    {
      day: 2,
      title: "Day 2: Jaipur Palaces & Forts",
      items: [
        { category: "activity", section: "morning", title: "Amber Fort tour with Jeep ride", description: "Private guided tour of the majestic Amber Fort with jeep transfer up the hill.", startTime: "08:30 AM", endTime: "11:30 AM", location: "Amber Fort" },
        { category: "activity", section: "afternoon", title: "City Palace & Jantar Mantar visit", description: "Explore the royal residence and the world's largest stone sundial.", startTime: "02:00 PM", endTime: "04:30 PM", location: "City Palace" },
        { category: "activity", section: "evening", title: "Sunset view at Nahargarh Fort", description: "Sunset cocktails overlooking the illuminated Pink City.", startTime: "05:30 PM", endTime: "07:30 PM", location: "Nahargarh Fort" }
      ]
    },
    {
      day: 3,
      title: "Day 3: Jaipur to Udaipur (City of Lakes)",
      items: [
        { category: "transfer", section: "morning", title: "Scenic Private Drive to Udaipur", description: "Transfer by private SUV with a stop at Chittorgarh Fort.", startTime: "08:00 AM", endTime: "02:00 PM", location: "Highway" },
        { category: "hotel", section: "afternoon", title: "Check-in at Taj Lake Palace", description: "Arrival by private boat at the iconic floating palace.", startTime: "02:30 PM", endTime: "03:30 PM", location: "Taj Lake Palace" },
        { category: "activity", section: "evening", title: "Sunset cruise on Lake Pichola", description: "Private boat ride on Lake Pichola passing Jag Mandir.", startTime: "05:30 PM", endTime: "07:00 PM", location: "Lake Pichola" }
      ]
    },
    {
      day: 4,
      title: "Day 4: Udaipur Cultural Tour",
      items: [
        { category: "activity", section: "morning", title: "City Palace Museum tour", description: "Explore Udaipur's royal history and architecture with your private guide.", startTime: "09:30 AM", endTime: "12:00 PM", location: "City Palace" },
        { category: "activity", section: "afternoon", title: "Saheliyon-ki-Bari stroll", description: "Relax at the historic courtyard designed for the royal maidens.", startTime: "02:30 PM", endTime: "04:00 PM", location: "Saheliyon-ki-Bari" },
        { category: "activity", section: "evening", title: "Mewar Sound & Light show", description: "Watch history come alive in this grand projection at the City Palace.", startTime: "07:00 PM", endTime: "08:30 PM", location: "City Palace" }
      ]
    },
    {
      day: 5,
      title: "Day 5: Departure from Udaipur",
      items: [
        { category: "activity", section: "morning", title: "Palace Breakfast & Spa", description: "Enjoy a royal breakfast followed by a relaxing Jiva Spa treatment.", startTime: "09:00 AM", endTime: "11:30 AM", location: "Taj Lake Palace" },
        { category: "transfer", section: "afternoon", title: "Transfer to Udaipur Airport", description: "Private airport transfer for your departure flight.", startTime: "01:00 PM", endTime: "01:30 PM", location: "Udaipur Airport" }
      ]
    }
  ];

  const template2Itinerary = [
    {
      day: 1,
      title: "Day 1: Arrival in Naples & Transfer to Amalfi",
      items: [
        { category: "transfer", section: "morning", title: "Naples Airport VIP pickup", description: "Mercedes S-Class private transfer to Amalfi. Stop for espresso along the way.", startTime: "10:30 AM", endTime: "12:00 PM", location: "Naples Airport" },
        { category: "hotel", section: "afternoon", title: "Check-in at Hotel Santa Caterina", description: "Settle into your sea-view suite. Note: Ensure hotel knows client is Marriott Titanium and has requested high floor room with sea view.", startTime: "02:00 PM", endTime: "03:00 PM", location: "Hotel Santa Caterina" },
        { category: "activity", section: "evening", title: "Dinner at Glicine (1 Michelin Star)", description: "Welcome dinner at Santa Caterina's cliffside terrace restaurant.", startTime: "08:00 PM", endTime: "10:30 PM", location: "Glicine Restaurant" }
      ]
    },
    {
      day: 2,
      title: "Day 2: Exploring Ravello & Historic Villas",
      items: [
        { category: "transfer", section: "morning", title: "Transfer to Ravello", description: "Private drive up the hills to the quiet clifftop town of Ravello.", startTime: "09:30 AM", endTime: "10:00 AM", location: "Ravello" },
        { category: "activity", section: "afternoon", title: "Villa Cimbrone gardens & Villa Rufolo", description: "Explore the Infinity Terrace with breathtaking sea views, followed by lunch at Cumpà Cosimo.", startTime: "10:30 AM", endTime: "02:30 PM", location: "Villa Cimbrone" },
        { category: "activity", section: "evening", title: "Cocktails at Piazza Duomo", description: "A casual evening walking the historic streets of Amalfi town.", startTime: "06:00 PM", endTime: "08:00 PM", location: "Piazza Duomo" }
      ]
    },
    {
      day: 3,
      title: "Day 3: Positano Walking & Sunset Cruise",
      items: [
        { category: "activity", section: "morning", title: "Positano Vertigo walking tour", description: "Guided descent through Positano's charming vertical paths and boutiques.", startTime: "09:30 AM", endTime: "12:30 PM", location: "Positano" },
        { category: "activity", section: "afternoon", title: "Lunch at Chez Black", description: "Beachfront dining featuring their signature squid ink pasta.", startTime: "01:00 PM", endTime: "03:00 PM", location: "Chez Black" },
        { category: "activity", section: "evening", title: "Private sunset cruise along the coast", description: "Enjoy champagne and Aperol Spritz on a private boat during golden hour.", startTime: "05:30 PM", endTime: "08:30 PM", location: "Amalfi Coastline" }
      ]
    },
    {
      day: 4,
      title: "Day 4: Capri Private Boat Excursion",
      items: [
        { category: "activity", section: "morning", title: "Riva Boat Capri excursion", description: "Set sail to Capri island. Cruise past the Faraglioni rocks and visit the Blue Grotto.", startTime: "09:00 AM", endTime: "01:00 PM", location: "Capri" },
        { category: "activity", section: "afternoon", title: "Lunch at La Fontelina beach club", description: "Cliffside seafood lunch with swimming access.", startTime: "01:30 PM", endTime: "04:00 PM", location: "La Fontelina" },
        { category: "activity", section: "evening", title: "Capri Town stroll & return", description: "Explore the famous Piazzetta before cruising back to Amalfi for dinner at Da Gemma.", startTime: "04:30 PM", endTime: "08:30 PM", location: "Capri town" }
      ]
    },
    {
      day: 5,
      title: "Day 5: Pompeii Private Archeology Tour",
      items: [
        { category: "activity", section: "morning", title: "Pompeii guided tour", description: "Fast-track entry and private archeologist-guided tour of the ancient ruins.", startTime: "09:00 AM", endTime: "12:00 PM", location: "Pompeii Ruins" },
        { category: "activity", section: "afternoon", title: "Mt. Vesuvius wine tasting & lunch", description: "Enjoy organic food and local Lacryma Christi wines at a hillside vineyard.", startTime: "12:30 PM", endTime: "03:30 PM", location: "Mt. Vesuvius Vineyard" },
        { category: "activity", section: "evening", title: "Leisurely Amalfi evening", description: "Free time for shopping or relaxing at the beach club.", startTime: "06:00 PM", endTime: "09:00 PM", location: "Amalfi" }
      ]
    },
    {
      day: 6,
      title: "Day 6: Path of the Gods Hiking Experience",
      items: [
        { category: "activity", section: "morning", title: "Sentiero degli Dei guided hike", description: "Moderate hike with stunning views high above the Amalfi Coast with a private alpine guide.", startTime: "08:30 AM", endTime: "12:30 PM", location: "Path of the Gods" },
        { category: "activity", section: "afternoon", title: "Picnic lunch in Nocelle", description: "Rustic local lunch in a quiet village overlooking the sea.", startTime: "01:00 PM", endTime: "02:30 PM", location: "Nocelle" },
        { category: "activity", section: "evening", title: "Farewell dinner at Marina Grande", description: "Beachside gourmet dining celebrating your final evening on the coast.", startTime: "08:00 PM", endTime: "10:30 PM", location: "Marina Grande" }
      ]
    },
    {
      day: 7,
      title: "Day 7: Departure to Naples",
      items: [
        { category: "activity", section: "morning", title: "Final coastal breakfast", description: "Leisurely breakfast overlooking the sea before checking out.", startTime: "09:00 AM", endTime: "10:30 AM", location: "Hotel Santa Caterina" },
        { category: "transfer", section: "afternoon", title: "Transfer to Naples Airport", description: "Private Mercedes transfer back to Naples Airport for departure.", startTime: "12:00 PM", endTime: "01:30 PM", location: "Naples Airport" }
      ]
    }
  ];

  if (dbConnected) {
    const t1 = new Template({
      userId,
      title: "Rajasthan Cultural Heritage",
      days: 5,
      style: "culture",
      itinerary: template1Itinerary
    });
    await t1.save();

    const t2 = new Template({
      userId,
      title: "Amalfi Coast & Capri Escape",
      days: 7,
      style: "luxury",
      itinerary: template2Itinerary
    });
    await t2.save();
  } else {
    const userTemplates = demoTemplates.get(userId) || [];
    const t1 = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      title: "Rajasthan Cultural Heritage",
      days: 5,
      style: "culture",
      itinerary: template1Itinerary.map((d, dIdx) => ({
        _id: `day_${dIdx}`,
        day: d.day,
        title: d.title,
        items: d.items.map((it, itIdx) => ({ _id: `item_t1_${dIdx}_${itIdx}`, ...it }))
      })),
      createdAt: new Date()
    };
    const t2 = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      title: "Amalfi Coast & Capri Escape",
      days: 7,
      style: "luxury",
      itinerary: template2Itinerary.map((d, dIdx) => ({
        _id: `day_${dIdx}`,
        day: d.day,
        title: d.title,
        items: d.items.map((it, itIdx) => ({ _id: `item_t2_${dIdx}_${itIdx}`, ...it }))
      })),
      createdAt: new Date()
    };
    userTemplates.push(t1, t2);
    demoTemplates.set(userId, userTemplates);
  }

  // 3. Seed Amalfi Coast Showcase Trip (Mumbai -> Amalfi Coast, 7 days)
  let amalfiItinerary = JSON.parse(JSON.stringify(template2Itinerary));

  // Let's make sure items have IDs in demo mode
  if (!dbConnected) {
    amalfiItinerary = amalfiItinerary.map((day, dIdx) => ({
      _id: `day_trip_${dIdx}`,
      day: day.day,
      title: day.title,
      items: day.items.map((item, itemIdx) => ({
        _id: `item_trip_${dIdx}_${itemIdx}`,
        ...item,
        comments: []
      }))
    }));
  }

  // Add one unresolved request on Day 4 Capri Excursion Afternoon item (La Fontelina lunch)
  const targetItem = amalfiItinerary[3].items[1];
  const commentText = "Can we swap La Fontelina beach club lunch for a reservation at Da Paolino Lemon Trees instead? I heard the lemon trees are gorgeous.";
  
  if (dbConnected) {
    targetItem.comments = [{
      authorName: "Aarav Mehta",
      authorType: "client",
      text: commentText,
      status: "open"
    }];
  } else {
    targetItem.comments = [{
      _id: "comment_seeded_1",
      authorName: "Aarav Mehta",
      authorType: "client",
      text: commentText,
      status: "open",
      createdAt: new Date()
    }];
  }

  // Let's add 3 snapshots to history
  const versionsData = [
    {
      label: "Initial Outline Draft",
      itinerary: JSON.parse(JSON.stringify(template2Itinerary))
    },
    {
      label: "Hotel Bookings Confirmed",
      itinerary: JSON.parse(JSON.stringify(template2Itinerary))
    },
    {
      label: "Revised Capri Excursion Route",
      itinerary: JSON.parse(JSON.stringify(amalfiItinerary))
    }
  ];

  if (dbConnected) {
    const trip = new Trip({
      userId,
      source: "Mumbai",
      destination: "Amalfi Coast",
      mode: "Flight",
      budget: 2500000,
      style: "luxury",
      carbon: 840,
      days: 7,
      pnr: "EK-569A7",
      agencyName,
      agencyLogo: "",
      agencyColor: isNavyColor,
      status: "proposed",
      itinerary: amalfiItinerary,
      versions: versionsData
    });
    await trip.save();
  } else {
    const userTrips = demoTrips.get(userId) || [];
    const tripId = Math.random().toString(36).substr(2, 9);
    
    const memVersions = versionsData.map((v, vIdx) => ({
      _id: `version_${tripId}_${vIdx}`,
      timestamp: new Date(Date.now() - (3 - vIdx) * 60 * 60 * 1000),
      label: v.label,
      itinerary: v.itinerary.map((day, dIdx) => ({
        _id: `day_version_${tripId}_${vIdx}_${dIdx}`,
        day: day.day,
        title: day.title,
        items: day.items.map((item, itemIdx) => ({
          _id: `item_version_${tripId}_${vIdx}_${dIdx}_${itemIdx}`,
          ...item
        }))
      }))
    }));

    const trip = {
      _id: tripId,
      userId,
      source: "Mumbai",
      destination: "Amalfi Coast",
      mode: "Flight",
      budget: 2500000,
      style: "luxury",
      carbon: 840,
      days: 7,
      pnr: "EK-569A7",
      agencyName,
      agencyLogo: "",
      agencyColor: isNavyColor,
      status: "proposed",
      itinerary: amalfiItinerary,
      versions: memVersions,
      createdAt: new Date()
    };
    userTrips.push(trip);
    demoTrips.set(userId, userTrips);
  }
}

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

async function generateWithGroq(prompt) {
  try {
    if (!process.env.GROQ_API_KEY) return null;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
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

// Auth Routes
app.post('/api/auth/register', authRateLimit, async (req, res) => {
  try {
    const { email, password, agencyName } = req.body;
    if (!email || !password || !agencyName) {
      opLog('AUTH_FAILURE', { email, reason: 'Missing fields during registration' });
      return res.status(400).json({ error: 'Email, password, and agency name are required.' });
    }

    const sbUrl = process.env.SUPABASE_URL;
    const sbAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!sbUrl || !sbAnonKey) {
      opLog('SYSTEM_CONFIG_ERROR', { reason: 'Supabase URL/Key missing in env' });
      return res.status(500).json({ error: 'Supabase configuration is missing in server environment.' });
    }

    const sbRes = await fetch(`${sbUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': sbAnonKey,
        'Authorization': `Bearer ${sbAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: {
            agencyName,
            agencyColor: '#0f2847',
            plan: 'Pro'
          }
        }
      })
    });

    const sbData = await sbRes.json();

    if (!sbRes.ok) {
      const errorMsg = sbData.msg || sbData.error_description || sbData.error || 'Supabase signup failed';
      opLog('AUTH_FAILURE', { email, reason: errorMsg });
      return res.status(sbRes.status).json({ error: errorMsg });
    }

    const sbUser = sbData.user;
    const session = sbData.session;
    const token = session ? session.access_token : '';
    const userId = sbUser.id;

    // Seed Amalfi coast showcase trip, templates, and clients
    await seedAgencyData(userId, agencyName, '#0f2847');
    opLog('AUTH_SUCCESS', { email, userId, action: 'register' });

    res.status(201).json({
      token,
      agency: {
        id: userId,
        name: agencyName,
        plan: 'Pro',
        primaryColor: '#0f2847',
        logoUrl: ''
      }
    });
  } catch (err) {
    opLog('AUTH_ERROR', { error: err.message, email, action: 'register' });
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      opLog('AUTH_FAILURE', { email, reason: 'Missing credentials' });
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const sbUrl = process.env.SUPABASE_URL;
    const sbAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!sbUrl || !sbAnonKey) {
      opLog('SYSTEM_CONFIG_ERROR', { reason: 'Supabase URL/Key missing in env' });
      return res.status(500).json({ error: 'Supabase configuration is missing in server environment.' });
    }

    const sbRes = await fetch(`${sbUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': sbAnonKey,
        'Authorization': `Bearer ${sbAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const sbData = await sbRes.json();

    if (!sbRes.ok) {
      const errorMsg = sbData.error_description || sbData.error || 'Invalid credentials or login failed';
      opLog('AUTH_FAILURE', { email, reason: errorMsg });
      return res.status(sbRes.status).json({ error: errorMsg });
    }

    const sbUser = sbData.user;
    const session = sbData.session;
    const token = session.access_token;
    const userId = sbUser.id;

    opLog('AUTH_SUCCESS', { email, userId, action: 'login' });

    res.json({
      token,
      agency: {
        id: userId,
        name: sbUser.user_metadata?.agencyName || 'TripLens Travel',
        plan: sbUser.user_metadata?.plan || 'Pro',
        primaryColor: sbUser.user_metadata?.agencyColor || '#0f2847',
        logoUrl: sbUser.user_metadata?.agencyLogo || ''
      }
    });
  } catch (err) {
    opLog('AUTH_ERROR', { error: err.message, email, action: 'login' });
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Create Trip
app.post('/api/trips', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { source, destination, mode, budget, style, pnr, agencyName, agencyLogo, agencyColor, itinerary } = req.body;

    // Heuristic Carbon calculation
    let carbon = 0;
    const days = mode === 'Flight' ? 5 : mode === 'Train' ? 4 : 3;
    if (mode === 'Flight') carbon = days * 120;
    else if (mode === 'Train') carbon = days * 35;
    else if (mode === 'Car') carbon = days * 75;

    if (dbConnected) {
      const trip = new Trip({ userId, source, destination, mode, budget, style, carbon, days, pnr, agencyName, agencyLogo, agencyColor, itinerary });
      await trip.save();
      opLog('TRIP_CREATED', { tripId: trip._id, userId });
      res.status(201).json(trip);
    } else {
      // Demo mode: store in memory
      const id = Math.random().toString(36).substr(2, 9);
      const trip = { _id: id, userId, source, destination, mode, budget, style, carbon, days, pnr, agencyName, agencyLogo, agencyColor, itinerary, createdAt: new Date() };
      if (!demoTrips.has(userId)) demoTrips.set(userId, []);
      demoTrips.get(userId).push(trip);
      opLog('TRIP_CREATED', { tripId: id, userId, demo: true });
      res.status(201).json(trip);
    }
  } catch (err) {
    opLog('TRIP_CREATE_FAILURE', { error: err.message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to initialize mission log.' });
  }
});

// Get User Trips
app.get('/api/trips', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (dbConnected) {
      const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
      res.json(trips);
    } else {
      // Demo mode: return memory store
      const trips = (demoTrips.get(userId) || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(trips);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mission logs.' });
  }
});

// Get Single Trip
app.get('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const trip = await Trip.findById(id);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      res.json(trip);
    } else {
      // Demo mode: find in memory
      let trip = null;
      for (const trips of demoTrips.values()) {
        trip = trips.find(t => t._id === id);
        if (trip) break;
      }
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      res.json(trip);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trip details.' });
  }
});

// Update Trip Status
app.patch('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (dbConnected) {
      const trip = await Trip.findOneAndUpdate({ _id: id, userId: req.user.id }, { status }, { new: true });
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.json(trip);
    } else {
      // Demo mode: update in memory
      let trip = null;
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === id);
      if (trip) {
        trip.status = status;
      }
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.json(trip);
    }
  } catch (err) {
    opLog('EDIT_FAILURE', { error: err.message, id, userId: req.user.id, type: 'status_update' });
    res.status(500).json({ error: 'Failed to update trip status.' });
  }
});

// Delete Trip
app.delete('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const trip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.json({ success: true });
    } else {
      // Demo mode: delete in memory
      let deleted = false;
      const trips = demoTrips.get(req.user.id) || [];
      const index = trips.findIndex(t => t._id === id);
      if (index !== -1) {
        trips.splice(index, 1);
        deleted = true;
      }
      if (!deleted) return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      res.json({ success: true });
    }
  } catch (err) {
    opLog('DELETE_FAILURE', { error: err.message, id, userId: req.user.id });
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// Generate Itinerary
app.post('/api/generate-itinerary', authenticateToken, aiRateLimit, async (req, res) => {
  try {
    const { tripId } = req.body;
    let trip = null;

    if (dbConnected) {
      trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
      if (!trip) return res.status(404).json({ error: 'Mission log not found or unauthorized.' });
    } else {
      // Demo mode: find in memory
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === tripId);
      if (!trip) return res.status(404).json({ error: 'Mission log not found or unauthorized.' });
    }

    const prompt = `You are a professional travel advisor. Create a ${trip.days}-day travel itinerary from ${trip.source} to ${trip.destination}.
    Mode: ${trip.mode}, Budget: ₹${trip.budget}, Style: ${trip.style}.

    You MUST respond with a valid JSON object matching the schema below.
    Do NOT wrap the response in markdown blocks (e.g. \`\`\`json). Just output the raw JSON string.

    JSON Schema:
    {
      "itinerary": [
        {
          "day": 1,
          "title": "Day 1: Arrival & Exploration",
          "items": [
            {
              "category": "activity",
              "section": "morning",
              "title": "Morning Activity Name",
              "description": "Short description of morning plan",
              "startTime": "09:00 AM",
              "endTime": "11:30 AM",
              "location": "Location Name"
            },
            {
              "category": "activity",
              "section": "afternoon",
              "title": "Afternoon Activity Name",
              "description": "Short description of afternoon plan",
              "startTime": "02:00 PM",
              "endTime": "04:30 PM",
              "location": "Location Name"
            },
            {
              "category": "activity",
              "section": "evening",
              "title": "Evening Activity Name",
              "description": "Short description of evening plan",
              "startTime": "07:00 PM",
              "endTime": "09:30 PM",
              "location": "Location Name"
            }
          ]
        }
      ]
    }`;

    // Try Groq first (fast & free), then fallback to HF, then Ollama
    let itineraryText = await generateWithGroq(prompt);
    if (!itineraryText) itineraryText = await generateWithHuggingFace(prompt);
    if (!itineraryText) itineraryText = await generateWithOllama(prompt);

    let parsedItinerary = [];
    if (itineraryText) {
      try {
        const cleaned = itineraryText.replace(/```json/g, "").replace(/```/g, "").trim();
        const json = JSON.parse(cleaned);
        parsedItinerary = json.itinerary || [];
      } catch (parseErr) {
        opLog('AI_PARSE_FAILURE', { tripId, rawText: itineraryText, error: parseErr.message });
        console.error("Failed to parse JSON itinerary text:", parseErr);
      }
    }

    // Fallback if AI fails or returns empty/malformed data
    if (!parsedItinerary || parsedItinerary.length === 0) {
      opLog('AI_FALLBACK_TRIGGERED', { tripId });
      for (let d = 1; d <= trip.days; d++) {
        parsedItinerary.push({
          day: d,
          title: `Day ${d}: Exploring ${trip.destination}`,
          items: [
            { category: 'activity', section: 'morning', title: 'Morning Exploration', description: 'Begin exploring local attractions.', startTime: '09:00 AM', endTime: '11:00 AM', location: trip.destination },
            { category: 'activity', section: 'afternoon', title: 'Afternoon Discovery', description: 'Stop for local cuisine and sightseeing.', startTime: '02:00 PM', endTime: '04:00 PM', location: trip.destination },
            { category: 'activity', section: 'evening', title: 'Evening Leisure', description: 'Relaxing walk and dinner experience.', startTime: '07:00 PM', endTime: '09:00 PM', location: trip.destination }
          ]
        });
      }
    }

    trip.itinerary = parsedItinerary;

    if (dbConnected) {
      await trip.save();
    } else {
      // Demo mode: update in memory
    }

    res.json({ itinerary: trip.itinerary });
  } catch (err) {
    opLog('AI_SYNTHESIS_FAILURE', { error: err.message, tripId });
    res.status(500).json({ error: 'AI synthesis disruption.' });
  }
});

// Duplicate Trip
app.post('/api/trips/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let originalTrip = null;

    if (dbConnected) {
      originalTrip = await Trip.findOne({ _id: id, userId: req.user.id });
    } else {
      const trips = demoTrips.get(req.user.id) || [];
      originalTrip = trips.find(t => t._id === id);
    }

    if (!originalTrip) {
      opLog('DUPLICATION_FAILURE', { reason: 'Trip not found or unauthorized', id, userId: req.user.id });
      return res.status(404).json({ error: 'Trip not found or unauthorized.' });
    }

    // Deep copy structured itinerary items to assign new IDs
    const clonedItinerary = originalTrip.itinerary.map((d) => ({
      day: d.day,
      title: `${d.title}`,
      items: d.items.map((item) => ({
        category: item.category,
        section: item.section,
        title: item.title,
        description: item.description,
        startTime: item.startTime,
        endTime: item.endTime,
        location: item.location
      }))
    }));

    if (dbConnected) {
      const duplicatedTrip = new Trip({
        userId: req.user.id,
        source: originalTrip.source,
        destination: originalTrip.destination,
        mode: originalTrip.mode,
        budget: originalTrip.budget,
        style: originalTrip.style,
        carbon: originalTrip.carbon,
        days: originalTrip.days,
        pnr: originalTrip.pnr,
        agencyName: originalTrip.agencyName,
        agencyLogo: originalTrip.agencyLogo,
        agencyColor: originalTrip.agencyColor,
        status: 'draft',
        itinerary: clonedItinerary
      });
      await duplicatedTrip.save();
      opLog('TRIP_DUPLICATED', { originalId: id, newId: duplicatedTrip._id, userId: req.user.id });
      res.status(201).json(duplicatedTrip);
    } else {
      const cloneId = Math.random().toString(36).substr(2, 9);
      const duplicatedTrip = {
        _id: cloneId,
        userId: req.user.id,
        source: originalTrip.source,
        destination: originalTrip.destination,
        mode: originalTrip.mode,
        budget: originalTrip.budget,
        style: originalTrip.style,
        carbon: originalTrip.carbon,
        days: originalTrip.days,
        pnr: originalTrip.pnr,
        agencyName: originalTrip.agencyName,
        agencyLogo: originalTrip.agencyLogo,
        agencyColor: originalTrip.agencyColor,
        status: 'draft',
        itinerary: clonedItinerary.map((d, dIdx) => ({
          _id: `day_${cloneId}_${dIdx}`,
          day: d.day,
          title: d.title,
          items: d.items.map((item, itemIdx) => ({
            _id: `item_${cloneId}_${dIdx}_${itemIdx}`,
            ...item
          }))
        })),
        createdAt: new Date()
      };
      if (!demoTrips.has(req.user.id)) demoTrips.set(req.user.id, []);
      demoTrips.get(req.user.id).push(duplicatedTrip);
      opLog('TRIP_DUPLICATED', { originalId: id, newId: cloneId, userId: req.user.id, demo: true });
      res.status(201).json(duplicatedTrip);
    }
  } catch (err) {
    opLog('DUPLICATION_FAILURE', { error: err.message, id, userId: req.user.id });
    res.status(500).json({ error: 'Failed to duplicate trip.' });
  }
});

// Update Structured Itinerary (Autosave Endpoint)
app.patch('/api/trips/:id/itinerary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { itinerary } = req.body;

    if (dbConnected) {
      const trip = await Trip.findOneAndUpdate({ _id: id, userId: req.user.id }, { itinerary }, { new: true });
      if (!trip) {
        opLog('AUTOSAVE_FAILURE', { reason: 'Trip not found or unauthorized', id, userId: req.user.id });
        return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      }
      res.json(trip);
    } else {
      let trip = null;
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === id);
      if (trip) {
        trip.itinerary = itinerary;
      }
      if (!trip) {
        opLog('AUTOSAVE_FAILURE', { reason: 'Trip not found or unauthorized in demo', id, userId: req.user.id });
        return res.status(404).json({ error: 'Trip not found or unauthorized.' });
      }
      res.json(trip);
    }
  } catch (err) {
    opLog('AUTOSAVE_FAILURE', { error: err.message, id, userId: req.user.id });
    res.status(500).json({ error: 'Failed to autosave itinerary.' });
  }
});

// Save Itinerary as Template
app.post('/api/templates', authenticateToken, async (req, res) => {
  try {
    const { title, days, style, itinerary } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    if (dbConnected) {
      const template = new Template({ userId: req.user.id, title, days, style, itinerary });
      await template.save();
      res.status(201).json(template);
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      const template = { _id: id, userId: req.user.id, title, days, style, itinerary, createdAt: new Date() };
      if (!demoTemplates.has(req.user.id)) demoTemplates.set(req.user.id, []);
      demoTemplates.get(req.user.id).push(template);
      res.status(201).json(template);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save template.' });
  }
});

// Get User Templates
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (dbConnected) {
      const templates = await Template.find({ userId }).sort({ createdAt: -1 });
      res.json(templates);
    } else {
      const templates = demoTemplates.get(userId) || [];
      res.json(templates);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

// Add Comment (Request Change)
app.post('/api/trips/:id/items/:itemId/comments', commentRateLimit, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { authorName, authorType, text } = req.body;
    
    if (!text) return res.status(400).json({ error: 'Comment text is required.' });

    if (dbConnected) {
      const trip = await Trip.findById(id);
      if (!trip) return res.status(404).json({ error: 'Trip not found.' });

      let itemFound = false;
      for (const day of trip.itinerary) {
        const item = day.items.id(itemId);
        if (item) {
          item.comments.push({ authorName, authorType, text, status: 'open' });
          itemFound = true;
          break;
        }
      }

      if (!itemFound) return res.status(404).json({ error: 'Itinerary item not found.' });
      await trip.save();
      res.status(201).json(trip);
    } else {
      // Demo Mode
      let trip = null;
      for (const trips of demoTrips.values()) {
        trip = trips.find(t => t._id === id);
        if (trip) break;
      }
      if (!trip) return res.status(404).json({ error: 'Trip not found.' });

      let item = null;
      for (const day of trip.itinerary) {
        item = day.items.find(it => it._id === itemId);
        if (item) break;
      }

      if (!item) return res.status(404).json({ error: 'Itinerary item not found.' });
      if (!item.comments) item.comments = [];
      const commentId = Math.random().toString(36).substr(2, 9);
      item.comments.push({ _id: commentId, authorName, authorType, text, status: 'open', createdAt: new Date() });
      res.status(201).json(trip);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// Update Comment Status (Resolve)
app.patch('/api/trips/:id/items/:itemId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { id, itemId, commentId } = req.params;
    const { status } = req.body;

    if (dbConnected) {
      const trip = await Trip.findOne({ _id: id, userId: req.user.id });
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      let commentFound = false;
      for (const day of trip.itinerary) {
        const item = day.items.id(itemId);
        if (item) {
          const comment = item.comments.id(commentId);
          if (comment) {
            comment.status = status;
            commentFound = true;
            break;
          }
        }
      }

      if (!commentFound) return res.status(404).json({ error: 'Comment not found.' });
      await trip.save();
      res.json(trip);
    } else {
      // Demo Mode
      let trip = null;
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === id);
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      let item = null;
      for (const day of trip.itinerary) {
        item = day.items.find(it => it._id === itemId);
        if (item) break;
      }
      if (!item) return res.status(404).json({ error: 'Itinerary item not found.' });

      const comment = item.comments.find(c => c._id === commentId);
      if (!comment) return res.status(404).json({ error: 'Comment not found.' });

      comment.status = status;
      res.json(trip);
    }
  } catch (err) {
    opLog('RESOLVE_COMMENT_FAILURE', { error: err.message, id, commentId, userId: req.user.id });
    res.status(500).json({ error: 'Failed to update comment status.' });
  }
});

// Get Agency Clients
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (dbConnected) {
      const clients = await Client.find({ userId }).sort({ name: 1 });
      res.json(clients);
    } else {
      const clients = demoClients.get(userId) || [];
      res.json(clients);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
});

// Create Client
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, preferences, loyaltyPrograms, nationality, passportExpiry } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    if (dbConnected) {
      const client = new Client({ userId: req.user.id, name, email, phone, preferences, loyaltyPrograms, nationality, passportExpiry });
      await client.save();
      res.status(201).json(client);
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      const client = { _id: id, userId: req.user.id, name, email, phone, preferences, loyaltyPrograms, nationality, passportExpiry, createdAt: new Date() };
      if (!demoClients.has(req.user.id)) demoClients.set(req.user.id, []);
      demoClients.get(req.user.id).push(client);
      res.status(201).json(client);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create client.' });
  }
});

// Update Client
app.patch('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Strip userId to prevent hijacking client profiles
    delete updates.userId;

    if (dbConnected) {
      const client = await Client.findOneAndUpdate({ _id: id, userId: req.user.id }, updates, { new: true });
      if (!client) return res.status(404).json({ error: 'Client not found or unauthorized.' });
      res.json(client);
    } else {
      let client = null;
      const clients = demoClients.get(req.user.id) || [];
      client = clients.find(c => c._id === id);
      if (client) {
        Object.assign(client, updates);
      }
      if (!client) return res.status(404).json({ error: 'Client not found or unauthorized.' });
      res.json(client);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client.' });
  }
});

// Delete Client
app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const client = await Client.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!client) return res.status(404).json({ error: 'Client not found or unauthorized.' });
      res.json({ success: true });
    } else {
      let deleted = false;
      const clients = demoClients.get(req.user.id) || [];
      const index = clients.findIndex(c => c._id === id);
      if (index !== -1) {
        clients.splice(index, 1);
        deleted = true;
      }
      if (!deleted) return res.status(404).json({ error: 'Client not found or unauthorized.' });
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete client.' });
  }
});

// Create Snapshot (Capped at last 20)
app.post('/api/trips/:id/snapshots', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    if (dbConnected) {
      const trip = await Trip.findOne({ _id: id, userId: req.user.id });
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      trip.versions.push({
        label: label || `Snapshot ${new Date().toLocaleTimeString()}`,
        itinerary: trip.itinerary
      });

      // Cap at 20 versions
      if (trip.versions.length > 20) {
        trip.versions.shift();
      }

      await trip.save();
      opLog('SNAPSHOT_CREATED', { tripId: id, label, userId: req.user.id });
      res.status(201).json(trip);
    } else {
      // Demo Mode
      let trip = null;
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === id);
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      if (!trip.versions) trip.versions = [];
      const snapId = Math.random().toString(36).substr(2, 9);
      trip.versions.push({
        _id: snapId,
        timestamp: new Date(),
        label: label || `Snapshot ${new Date().toLocaleTimeString()}`,
        itinerary: JSON.parse(JSON.stringify(trip.itinerary))
      });

      if (trip.versions.length > 20) {
        trip.versions.shift();
      }

      opLog('SNAPSHOT_CREATED', { tripId: id, label, userId: req.user.id, demo: true });
      res.status(201).json(trip);
    }
  } catch (err) {
    opLog('SNAPSHOT_FAILURE', { error: err.message, id, userId: req.user.id });
    res.status(500).json({ error: 'Failed to create snapshot.' });
  }
});

// Restore Version
app.post('/api/trips/:id/restore-version', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { versionId } = req.body;

    if (!versionId) return res.status(400).json({ error: 'versionId required.' });

    if (dbConnected) {
      const trip = await Trip.findOne({ _id: id, userId: req.user.id });
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      const version = trip.versions.id(versionId);
      if (!version) return res.status(404).json({ error: 'Snapshot not found.' });

      trip.itinerary = version.itinerary;
      await trip.save();
      opLog('VERSION_RESTORED', { tripId: id, versionId, userId: req.user.id });
      res.json(trip);
    } else {
      // Demo Mode
      let trip = null;
      const trips = demoTrips.get(req.user.id) || [];
      trip = trips.find(t => t._id === id);
      if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

      const version = trip.versions.find(v => v._id === versionId);
      if (!version) return res.status(404).json({ error: 'Snapshot not found.' });

      trip.itinerary = JSON.parse(JSON.stringify(version.itinerary));
      opLog('VERSION_RESTORED', { tripId: id, versionId, userId: req.user.id, demo: true });
      res.json(trip);
    }
  } catch (err) {
    opLog('RESTORE_FAILURE', { error: err.message, id, versionId, userId: req.user.id });
    res.status(500).json({ error: 'Failed to restore snapshot.' });
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
  app.use(express.static(path.join(__dirname, 'FRONTEND/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND/dist/index.html')));
}

const isDirectRun = fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  app.listen(PORT, () => console.log(`🛰️ TripLens Intelligence Hub Active on port ${PORT}`));
}

export default app;
