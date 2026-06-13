# EcoQuest — Gamified Litter Cleanup App

## What This Is
A full-stack web app that rewards users for picking up litter, verified via real-time YOLO-based computer vision. Built for JAMhacks 2026.

## Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3
- **Backend**: Next.js API routes (Node.js)
- **Database**: SQLite via Prisma (swap to PostgreSQL for production)
- **CV Service**: Python FastAPI + YOLOv8 (`cv-service/`)
- **Auth**: JWT via `jose`, passwords hashed with `bcryptjs`

## Key Commands
```bash
# Install frontend deps
npm install

# Generate Prisma client + push schema to SQLite
npm run db:generate && npm run db:push

# Seed achievements
npm run db:seed

# Run Next.js dev server (port 3000)
npm run dev

# Run CV service (port 8000) — needs Python 3.10+
cd cv-service && pip install -r requirements.txt && uvicorn main:app --reload
```

## Environment Variables
Copy `.env.local.example` → `.env.local` and fill in:
- `DATABASE_URL` — SQLite: `file:./dev.db`
- `JWT_SECRET` — any long random string
- `CV_SERVICE_URL` — default `http://localhost:8000`

## Project Structure
```
src/
  app/                  # Next.js App Router pages + API routes
    (auth)/             # Login / Register (unauthed layout)
    dashboard/          # Main dashboard after login
    cleanup/            # Live camera + YOLO detection session
    leaderboard/        # Global / weekly leaderboard
    profile/            # User profile + achievements
    api/                # API routes
  components/
    camera/             # CameraFeed, DetectionOverlay
    gamification/       # PointsPopup, AchievementToast, LevelBadge, XPBar
    layout/             # Navbar, Footer
    ui/                 # Button, Card, ProgressBar, Modal
  lib/                  # prisma, auth, points, gamification helpers
  hooks/                # useCamera, useDetection, useAuth
  types/                # Shared TypeScript types
prisma/
  schema.prisma         # DB schema
  seed.ts               # Achievement seeder
cv-service/
  main.py               # FastAPI app entry
  detector.py           # YOLOv8 wrapper
  anti_cheat.py         # Per-session object tracking + cooldowns
  requirements.txt
```

## Detection & Anti-Cheat
- Frames sent as base64 JPEG from browser to `/api/cleanup/detect`
- API proxies to `CV_SERVICE_URL/detect`
- Object must appear in **3 consecutive frames** before being "tracked"
- Object must **disappear for 3 consecutive frames** to award points
- Each object fingerprint (class + position bucket) has a **60s cooldown** per session
- Rate limit: max 1 detection request per second per session

## Gamification
| Item | Points |
|------|--------|
| Bottle | 10 |
| Can | 12 |
| Plastic bag | 15 |
| Cup | 8 |
| Cardboard | 10 |
| Wrapper | 7 |
| General litter | 5 |

Level thresholds: 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500 XP

## Hackathon Demo Tips
- Use a USB webcam or phone camera for best detection quality
- Demo with plastic bottles / cups (best COCO class coverage)
- CV service falls back gracefully — frontend still shows UI if Python is down
- The `--mock` flag in `cv-service/main.py` returns fake detections for demos without YOLO
