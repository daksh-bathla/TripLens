# TripLens Design System

## 1. Visual Language
TripLens is an ultra-premium, modern travel dashboard. It uses a sleek dark mode foundation with vibrant gradients, glassmorphism overlays, and 3D depth to make travel planning feel like exploring a futuristic command center.

## 2. Color Palette
- **Background:** Deep space black (`#050505`) with subtle radial gradients (e.g., `#1a1a2e`).
- **Primary Accent:** Neon Cyan (`#00f2fe`) to Deep Blue (`#4facfe`) gradients.
- **Secondary Accent:** Electric Purple (`#7f00ff`) for highlights and active states.
- **Text:** Crisp white (`#ffffff`) for primary, and muted silver (`#a0aab2`) for secondary text.
- **Surfaces:** Glassmorphic cards with `rgba(255, 255, 255, 0.05)` background, heavy blur (`backdrop-blur-xl`), and a delicate 1px border `rgba(255, 255, 255, 0.1)`.

## 3. Typography
- **Headings:** Outfit or Inter, bold, with tight tracking. Use gradient text clipping for emphasis.
- **Body:** Inter, regular weight, 15px-16px, high legibility.

## 4. Sitemap
- [ ] index (Landing)
- [x] dashboard
- [x] new-trip
- [x] trip-details
- [x] analytics
- [x] history

## 5. Roadmap
- Integrate 3D interactive globe on the dashboard.
- Create fluid multi-step new trip form.
- Add parallax scrolling to trip details.

## 6. Design System Notes for Stitch Generation
**DESIGN SYSTEM (REQUIRED):**
Create an ultra-premium, dark-mode layout with a futuristic travel vibe.
- Use a pitch-black `#050505` background.
- UI elements should be glassmorphic cards: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`.
- Use a vibrant Cyan (`#00f2fe`) to Blue (`#4facfe`) gradient for primary buttons, with a subtle glow effect (`shadow-[0_0_15px_rgba(0,242,254,0.5)]`).
- Typography should be clean, sans-serif (Inter/Outfit), with white primary text and gray (`#a0aab2`) secondary text.
- Include generous padding (`p-6` or `p-8`) inside cards.
- Layouts should feel spacious, breathable, and dashboard-like. Ensure high contrast and accessibility.
