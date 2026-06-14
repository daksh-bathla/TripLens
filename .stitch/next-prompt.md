---
page: dashboard
---
Redesign the TripLens Dashboard. It needs to be the central hub where the user can see their travel stats, upcoming trips, and recent history. 

**DESIGN SYSTEM (REQUIRED):**
Create an ultra-premium, dark-mode layout with a futuristic travel vibe.
- Use a pitch-black `#050505` background.
- UI elements should be glassmorphic cards: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`.
- Use a vibrant Cyan (`#00f2fe`) to Blue (`#4facfe`) gradient for primary buttons, with a subtle glow effect (`shadow-[0_0_15px_rgba(0,242,254,0.5)]`).
- Typography should be clean, sans-serif (Inter/Outfit), with white primary text and gray (`#a0aab2`) secondary text.
- Include generous padding (`p-6` or `p-8`) inside cards.
- Layouts should feel spacious, breathable, and dashboard-like. Ensure high contrast and accessibility.

**Page Structure:**
1. Sidebar navigation on the left (Dashboard, New Trip, History, Analytics, Settings).
2. Main content area:
   - Top Header with user greeting and search.
   - Large empty central area (this will be reserved for a 3D Interactive Globe that I will code later, just leave a large glassmorphic card placeholder for "Interactive Travel Map").
   - Stats row at the bottom (Total Trips, Carbon Footprint, Countries Visited).
   - "Upcoming Trips" list in a glassmorphic card on the right side.
