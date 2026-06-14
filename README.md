# EcoQuest — Gamified Litter Cleanup

> Upload before & after photos of your cleanup. Dual AI counts the trash you removed. Earn points, level up, save the planet.
> Built for **JAMhacks 2026**.

All user accounts, sessions, achievements, and leaderboard scores are stored in **MongoDB Atlas** — a shared cloud database, so every device sees the same live data.

---

## Features

### Core Gameplay
- **Before & After Photo Submission** — upload two photos of a cleanup spot; AI counts how many items were removed
- **Points per item removed** — 1 point per piece of litter picked up, 2 XP per point
- **10-level progression system** — from Seedling (Lv.1) to Nature's Hero (Lv.10)
- **Daily cleanup streaks** — clean up consecutive days to grow your streak counter
- **12 unlockable achievements** — milestone badges for items collected, streaks, bottles, bags, and leaderboard rank
- **Achievement profile picture** — your most recently earned achievement icon becomes your profile avatar automatically

### Dual AI Verification (Anti-Cheat)
- **YOLOv8 object detection** — Python CV service detects and counts litter objects in each photo
- **Claude vision double-check** — Anthropic Claude Haiku runs in parallel and independently counts litter in the same photos
- **Disagreement resolution** — if YOLO and Claude produce different counts, the **lower (more conservative)** count is used to prevent inflation
- **Location verification** — Claude also compares the before and after photos to confirm they were taken in the same location; if they are clearly different places, no points are awarded
- **Photo timestamp validation** — EXIF metadata is checked; a warning is shown if the after photo was taken before the before photo (submission still allowed)
- **Verification badge** — results show a green "Verified by Claude" badge when both AIs agree, an amber warning when counts differ, and a red badge if a location mismatch is detected

### Leaderboard
- **All-time leaderboard** — ranked by total points across all time
- **Weekly leaderboard** — ranked by points earned in the current calendar week
- **Player profile icons** — each player's most recent achievement icon is shown next to their name
- **Streak display** — active daily streaks shown for each player
- **"You" highlight** — your own row is highlighted green

### Profile Page
- **Live stats** — total points, items collected, XP, current level with XP bar, active streak
- **Achievement showcase** — full grid of earned achievements with unlock dates; most recent is tagged "LATEST" and used as your profile icon
- **Per-category item counts** — bottles, cans, bags, cups tracked separately

---

## Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- Python 3.10+ *(only needed for real YOLO detection — mock mode works without it)*

---

### Step 1 — Clone and install

```bash
git clone <repo-url>
cd Jamhacks
npm install
```

---

### Step 2 — Environment variables

The `.env` file in the repo root is pre-configured for local development. Copy your real Anthropic API key into `.env.local` (create this file if it doesn't exist):

```
# .env.local  ← this file is gitignored, safe to put real keys here
DATABASE_URL="mongodb+srv://zainjamhacks:jamhackszain@cluster0.3vjdwcj.mongodb.net/trashgame?retryWrites=true&w=majority"
JWT_SECRET="ecoquest-dev-secret-change-in-production-2026"
CV_SERVICE_URL="http://localhost:8000"
CV_MOCK_MODE="false"
NEXT_PUBLIC_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Auth token signing key |
| `CV_SERVICE_URL` | Python CV service URL (default `http://localhost:8000`) |
| `CV_MOCK_MODE` | Set `"true"` to skip YOLO and award 3 points per submission automatically |
| `NEXT_PUBLIC_URL` | App base URL |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude dual-verification |

---

### Step 3 — Database setup

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

> `db:seed` populates the achievements table. Run it once (it uses upsert so re-running is safe).

---

### Step 4 — Build and run

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

> **Use `npm run build` + `npm start` for regular use**, not `npm run dev`. Dev mode recompiles every page on each request and is 5–10× slower.

---

### Step 5 — CV Service (optional but recommended)

Without the CV service the app falls back to mock mode (3 points per submission). To enable real YOLO + Claude detection, open a **second terminal**:

```bash
cd C:\Users\zaina\Downloads\Jamhacks\Jamhacks\cv-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Then run the web app in the first terminal:

```bash
npm run build
npm start
```

> **Best demo items:** plastic water bottles and paper cups in good lighting.

---

## Updating to Latest Version

After pulling changes from another machine:

```bash
git pull
npm install
```

Clear the compiled cache and rebuild:

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force .next
npm run build
npm start
```

```bash
# Mac / Linux
rm -rf .next && npm run build && npm start
```

> **Always delete `.next` after pulling.** It holds compiled CSS/JS from the previous build. Without clearing it, old styles will persist.

---

## Scoring

| Rule | Value |
|------|-------|
| Points per item removed | 1 pt |
| XP per point | 2 XP |
| Minimum to earn | Must remove at least 1 item |
| Location mismatch | 0 pts (Claude detects different locations) |
| AI disagreement | Conservative (lower) count used |

---

## Level System

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | 🌱 Seedling | 0 |
| 2 | ♻️ Recycler | 100 |
| 3 | 🔍 Eco Scout | 300 |
| 4 | ⚔️ Eco Warrior | 600 |
| 5 | 🦸 Cleanup Hero | 1,000 |
| 6 | 🏅 Green Champion | 1,500 |
| 7 | 🛡️ Earth Defender | 2,200 |
| 8 | 🌍 Planet Guardian | 3,000 |
| 9 | 🌟 Eco Legend | 4,000 |
| 10 | 🏆 Nature's Hero | 5,500 |

---

## Achievements

| Icon | Achievement | Condition | XP Reward | Point Reward |
|------|-------------|-----------|-----------|--------------|
| 🌱 | First Pickup | Remove your first item | 50 XP | 5 pts |
| ♻️ | Recycler | Collect 10 items total | 100 XP | 20 pts |
| ⚔️ | Eco Warrior | Collect 50 items total | 250 XP | 50 pts |
| 🦸 | Cleanup Hero | Collect 100 items total | 500 XP | 100 pts |
| 🌍 | Planet Guardian | Collect 500 items total | 1,000 XP | 250 pts |
| 🔥 | On a Roll | 3-day cleanup streak | 150 XP | 30 pts |
| 📅 | Week Warrior | 7-day cleanup streak | 350 XP | 75 pts |
| 🏆 | Habit Hero | 30-day cleanup streak | 1,500 XP | 300 pts |
| 🍾 | Bottle Collector | Collect 25 plastic bottles | 200 XP | 40 pts |
| 🛍️ | Bag Buster | Collect 10 plastic bags | 200 XP | 40 pts |
| 👑 | Community Hero | Reach top 10 on the leaderboard | 500 XP | 100 pts |
| ⚡ | Speed Cleaner | Collect 5 items in under 2 minutes | 150 XP | 25 pts |

> Your most recently earned achievement icon becomes your profile picture across the app and leaderboard automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3 |
| Backend | Next.js API routes (Node.js) |
| Database | MongoDB Atlas via Prisma |
| CV — Object Detection | Python FastAPI + YOLOv8 (`cv-service/`) |
| CV — Dual Verification | Anthropic Claude Haiku (vision) via `@anthropic-ai/sdk` |
| Auth | JWT via `jose`, passwords hashed with `bcryptjs` |
| EXIF | `exifr` for photo timestamp extraction |

---

## How the Dual AI Pipeline Works

```
User submits before + after photos
          │
          ├─── YOLO (Python) ──────────► count objects in each photo
          │
          ├─── Claude (Node.js) ───────► count objects in each photo (independent)
          │
          └─── Claude (Node.js) ───────► compare both photos: same location?
                                                    │
                              ┌─────────────────────┼──────────────────────┐
                              │                     │                      │
                     Different location      Counts match           Counts differ
                              │                     │                      │
                         0 pts awarded      Award YOLO count       Award lower count
                         Location badge     ✅ Verified badge       ⚠️ Adjusted badge
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/cleanup/compare` | Analyze before/after photos (YOLO + Claude) |
| GET | `/api/leaderboard` | Global + weekly leaderboard |
| GET | `/api/user/profile` | User stats + achievements |

---

## Project Structure

```
src/
  app/
    (auth)/             # Login / Register pages
    (app)/
      dashboard/        # Main dashboard
      cleanup/          # Photo upload + AI analysis
      leaderboard/      # Global & weekly rankings
      profile/          # User stats + achievement grid
    api/                # API routes
  components/
    camera/             # PhotoCompare (before/after upload)
    gamification/       # PointsPopup, AchievementToast, LevelBadge, XPBar
    leaderboard/        # LeaderboardTable
    layout/             # Navbar, Footer
    ui/                 # Button, Card, ProgressBar, Modal
  lib/
    claude-verify.ts    # Claude litter counting + location check
    gamification.ts     # Achievement unlock logic
    points.ts           # Level thresholds
    auth.ts             # JWT helpers
    prisma.ts           # DB client
  hooks/                # useCamera, useDetection, useAuth
  types/                # Shared TypeScript types
prisma/
  schema.prisma         # DB schema
  seed.ts               # Achievement seeder
cv-service/
  main.py               # FastAPI entry point
  detector.py           # YOLOv8 wrapper
  anti_cheat.py         # Per-session object tracking + cooldowns
  requirements.txt
```
