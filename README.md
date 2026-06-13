# 🌿 EcoQuest — Gamified Litter Cleanup

> Pick up litter. Get verified by AI. Earn points, level up, save the planet.
> Built for **JAMhacks 2026**.

## Quick Start (5 minutes)

### Prerequisites
- [Node.js 18+](https://nodejs.org) (install if missing)
- Python 3.10+ (for CV service — optional, mock mode available)

### 1. Install & Run Frontend

```bash
# Install dependencies
npm install

# Setup database (SQLite — no PostgreSQL needed!)
npm run db:generate
npm run db:push
npm run db:seed

# Start the app
npm run dev
# → http://localhost:3000
```

### 2. Run CV Service (optional — for real YOLO detection)

```bash
cd cv-service
pip install -r requirements.txt   # downloads YOLOv8 model automatically
uvicorn main:app --reload --port 8000
```

**Demo without Python**: Set `CV_MOCK_MODE="true"` in `.env.local` — the app will simulate litter detection automatically.

---

## App Name Candidates (chose EcoQuest)
1. **EcoQuest** ← chosen
2. TrashBlast
3. LitterBuster
4. GreenGrab
5. TidyHero
6. CleanEarth
7. PickItUp
8. EcoHunter
9. WasteFighter
10. PlanetPatch

---

## Architecture

```
Browser (Next.js 15)
  │── Camera frame capture (1fps)
  │── POST /api/cleanup/detect
         │── Rate limit check (1 req/s/session)
         │── Proxy to CV Service (FastAPI)
         │         │── YOLOv8 detection
         │         └── Anti-cheat engine
         └── Award points via Prisma → SQLite
```

## Gamification System

| Rank | Level | Title | XP Required |
|------|-------|-------|-------------|
| 1 | 🌱 | Seedling | 0 |
| 2 | ♻️ | Recycler | 100 |
| 3 | 🌿 | Eco Scout | 300 |
| 4 | ⚔️ | Eco Warrior | 600 |
| 5 | 🦸 | Cleanup Hero | 1000 |
| 6 | 🏅 | Green Champion | 1500 |
| 7 | 🛡️ | Earth Defender | 2200 |
| 8 | 🌍 | Planet Guardian | 3000 |
| 9 | ⭐ | Eco Legend | 4000 |
| 10 | 👑 | Nature's Hero | 5500 |

## Anti-Cheat Rules
- Object must appear in **3+ consecutive frames** to be tracked
- Object must **disappear for 3+ consecutive frames** to award points
- **60-second cooldown** per unique object fingerprint per session
- Max **8 pickups per minute** per session
- Static objects (photos on screen) rejected via position variance analysis

## High-Risk Items & Mitigations

| Risk | Mitigation |
|------|-----------|
| YOLO model not installed | Mock mode + graceful fallback |
| Camera permission denied | Clear error UI + retry |
| CV service down | Frontend continues, shows "CV offline" badge |
| Database setup fails | SQLite means no server setup needed |
| CORS issues | Next.js API routes proxy all CV requests |

## Deployment (Vercel)

```bash
# Add environment variables in Vercel dashboard:
# DATABASE_URL (use Neon/PlanetScale for production PostgreSQL)
# JWT_SECRET
# CV_SERVICE_URL (deploy cv-service to Railway/Fly.io)
vercel deploy
```
