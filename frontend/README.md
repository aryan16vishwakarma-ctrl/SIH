# KisaanConnect Frontend (Animated / Interactive Edition)

Production-grade, highly animated React frontend for **KisaanConnect**, a farmer-to-buyer digital marketplace for SIH Problem Statement 26033.

---

## Features

- **3D Hero Scene:** Built with React Three Fiber (`@react-three/fiber`) + `@react-three/drei` featuring an interactive low-poly produce crate model with orbit controls and ambient shadows.
- **Framer Motion System:** Route page transitions (`<AnimatePresence mode="wait">`), `layoutId` shared component morphing, micro-interactions (`MagneticButton`), and scroll-triggered `AnimatedCounter` statistics.
- **Interactive Leaflet Mapping:** OpenStreetMap integration via `react-leaflet` showing real-time farmer listing markers synced with product grid selections.
- **AI Price Intelligence:** Instant fair-price calculation with SSE streaming updates & interactive `Recharts` savings comparison graphs.
- **Realtime WebSockets:** WebSocket listener tracking live order status updates without polling.
- **Responsive & Accessible:** Built with Tailwind CSS, custom glassmorphism, and `prefers-reduced-motion` compliance.

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Animations:** Framer Motion
- **3D Visuals:** Three.js + `@react-three/fiber` + `@react-three/drei`
- **Routing:** React Router v6
- **Maps:** Leaflet.js + `react-leaflet`
- **Charts:** `recharts`
- **HTTP:** Axios (JWT Interceptor)
- **Icons:** `lucide-react`

---

## Quick Start Setup Guide

### 1. Install Dependencies

Navigate to `frontend/`:

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Credentials (Backend Seeded)

- **Default Password:** `password123`
- **Farmer Login:** Phone `9823011111` (Ramesh Patil - Nashik)
- **Buyer Login:** Phone `9900011111` (FreshMart Bulk Buyer - Mumbai)
