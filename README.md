# 🗑️ TrashGame — Gamified Litter Cleanup

> Upload before & after photos of your cleanup. AI counts the trash you removed. Earn points, level up, save the planet.
> Built for **JAMhacks 2026**.

## Quick Start (5 minutes)

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- Python 3.10+ (optional — for real YOLO detection; mock mode works without it)

### 1. Install & Run

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
# → http://localhost:3000
```

### 2. Run CV Service (optional — real YOLO detection)

```bash
cd cv-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**No Python?** Set `CV_MOCK_MODE="true"` in `.env` — the app simulates 3 items detected in the before photo and 0 in the after, awarding 3 points automatically.

---

## How Verification Works

1. User takes a **Before photo** showing litter on the ground
2. User picks up the trash and puts it in a bin
3. User takes an **After photo** of the same area
4. Both photos are uploaded to the app
5. YOLOv8 counts litter objects in each photo
6. **Points = items in Before − items in After** (1 point per item removed)
7. Bounding boxes are drawn on both photos showing what was detected

---

## Scoring

| Rule | Value |
|------|-------|
| Points per item removed | 1 pt |
| XP per point | 2 XP |
| Minimum to earn points | Must remove at least 1 item |

## Level System

| Level | Title | XP |
|-------|-------|----|
| 1 | 🌱 Seedling | 0 |
| 2 | ♻️ Recycler | 100 |
| 3 | 🌿 Eco Scout | 300 |
| 4 | ⚔️ Eco Warrior | 600 |
| 5 | 🦸 Cleanup Hero | 1000 |
| 6 | 🏅 Green Champion | 1500 |
| 7 | 🛡️ Earth Defender | 2200 |
| 8 | 🌍 Planet Guardian | 3000 |
| 9 | ⭐ Eco Legend | 4000 |
| 10 | 👑 Nature's Hero | 5500 |

## What YOLO Detects

YOLOv8 (COCO-trained) reliably detects:
- **Plastic bottles** — most reliable
- **Cups** — very reliable
- Cans, bags, books/cardboard — hit or miss

Best demo items: plastic water bottles and paper cups in good lighting.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v3
- **Backend**: Next.js API routes
- **Database**: SQLite via Prisma
- **CV**: Python FastAPI + YOLOv8 (`cv-service/`)
- **Auth**: JWT via `jose`, bcryptjs

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/cleanup/compare` | Analyze before/after photos |
| GET | `/api/leaderboard` | Global / weekly leaderboard |
| GET | `/api/user/profile` | User stats + achievements |
