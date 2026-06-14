# Design System: TripLens
**Project ID:** projects/triplens-production

## 1. Visual Theme & Atmosphere
TripLens uses a **dense, visually premium, and highly structured** aesthetic. It relies on a sleek dark mode by default, transitioning gracefully to a crisp, clean light mode. The theme features custom colors, glassmorphic card styling, micro-animations via Framer Motion, and high contrast typography. It represents a trustworthy, operational multi-tenant B2B travel tool.

## 2. Color Palette & Roles
* **Primary / Accent Color (#0058be):** Classic Royal Blue. Used for primary branding elements, active link highlights, action buttons, progress bars, and main call-to-actions (CTAs).
* **Light Mode Surface (#f8fafc):** Slate-50 off-white. Provides a spacious, light background that reduces visual fatigue.
* **Light Mode Card Background (#ffffff):** Pure white. Emphasizes visual hierarchy on top of the surface background.
* **Dark Mode Surface (#0b1c30):** Deep Teal-Navy. Provides an immersive, high-end nighttime canvas.
* **Dark Mode Card Background (#0f2847):** Soft Navy-Slate. Hosts components, charts, and lists, offering distinct elevation contrast against the deep surface.
* **Accent Emerald / Green (#22c55e):** Emerald Green. Used for carbon footprint calculations, sustainability badges, and success status indicators.

## 3. Typography Rules
* **Font Families:**
  - `Inter` (sans-serif) is the primary font family for all display elements and body copy.
* **Font Weight Usage:**
  - **Headers (h1, h2, h3, h4):** Extra bold and tracking-tight (`tracking-tight`), emphasizing hierarchy and structure.
  - **Body text:** Regular to medium weights, optimized for legibility in dense lists and data tables.
  - **Labels / Badges:** Bold and uppercase (`uppercase tracking-wider`) for secondary metadata categorization.

## 4. Component Stylings
* **Buttons (`.premium-button`):**
  - **Shape:** Rounded corners (`rounded-xl`).
  - **Color:** Background in primary blue (`#0058be`), with white text.
  - **Behavior:** Smooth scaling transitions on hover, with interactive state cursor changes.
* **Cards/Containers (`.premium-card`):**
  - **Corner Radius:** Generously rounded corners (`rounded-2xl`).
  - **Borders:** Thin boundary stroke (`border-slate-200` in light mode, `border-white/10` in dark mode).
  - **Depth/Shadow:** Whisper-soft diffused shadow (`shadow-sm`), transforming to a deep shadow (`shadow-lg` / `shadow-black/30`) on hover with responsive edge highlights.
* **Inputs/Forms (`.dark-input` / `.dark-input-icon`):**
  - **Corner Radius:** Rounded corners (`rounded-xl`).
  - **Background:** White in light mode, translucent white (`bg-white/5`) in dark mode.
  - **Borders:** Subtle boundary border with primary blue halo ring (`focus:border-primary/60 focus:ring-primary/30`) on focus.

## 5. Layout Principles
* **Whitespace & Density:** Compact margins and dense components to accommodate extensive multi-day travel details on single screens.
* **Layout Structure:** Multi-column grids on desktop (typically a 2-column or 3-column split layout for itineraries and sidebars) collapsing into a bottom-nav tabbed single-column view on mobile screens.
