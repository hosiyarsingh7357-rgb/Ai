# Trade Journal — Frontend

High-performance, AI-powered trading performance tracker built with Next.js 14.

## 🚀 Tech Stack
- **Core:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4 (Design System tokens in `globals.css`)
- **State:** Zustand (Store: `src/store`)
- **Data Fetching:** React Query + Axios (Hooks: `src/hooks`)
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion

## 🛠️ Setup
1. Copy `.env.example` to `.env.local`
2. Update `NEXT_PUBLIC_API_URL` to your backend endpoint (default: `http://localhost:4000/v1`)
3. Run `npm install`
4. Run `npm run dev`

## 📂 Architecture
- `/src/app`: Routes and layouts (Dashboard, Auth, Onboarding)
- `/src/components`: UI primitives and feature components
- `/src/hooks`: Data fetching and auth guards
- `/src/lib`: API client and utility functions
- `/src/store`: Client-side state (Auth, UI)

## 🎨 Design System
Defined in `src/app/globals.css`:
- **Green:** `#00FF87` (Electric Green)
- **Blue:** `#4F9CFB` (Deep Cyan)
- **Dark:** `#0D0F14` (Deep Navy)
- **Card:** Glassmorphic translucent surfaces with custom glow variants.
