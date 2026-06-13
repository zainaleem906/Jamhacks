# TrashGame — Gamified Litter Cleanup

> Upload before & after photos of your cleanup. AI counts the trash you removed. Earn points, level up, save the planet.
> Built for **JAMhacks 2026**.

All user accounts, sessions, achievements, and leaderboard scores are stored in **MongoDB Atlas** — a shared cloud database, so every device sees the same data instantly.

---

## Setup (First Time)

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- Python 3.10+ *(optional — only needed for real YOLO detection; mock mode works without it)*

### Step 1 — Clone and install

```bash
git clone <repo-url>
cd Jamhacks
npm install
```

### Step 2 — Database setup

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Step 3 — Build and run

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

> **Do not use `npm run dev` for regular use.** Dev mode recompiles every page on each request and is 5-10x slower. Always use `npm run build` + `npm start`.

---

## Updating to Latest Version

When pulling updates from another machine, run all of these:

```bash
git pull
npm install
```

Then clear the compiled cache and rebuild:

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force .next
npm run build
npm start
```

```bash
# Mac / Linux
rm -rf .next
npm run build
npm start
```

**Clearing `.next` is required after every pull.** It holds compiled CSS and JS from the previous build. Without deleting it, old styles (including dark mode) will keep loading even though the source files are correct.

---

## CV Service — Real YOLO Detection (Optional)

Without the CV service the app runs in mock mode (awards 3 points per submission automatically). To enable real AI detection:

**Terminal 1 — Start CV service:**
```bash
cd cv-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Start web app:**
```bash
npm run build
npm start
```

To force mock mode without Python, set in `.env`:
```
CV_MOCK_MODE="true"
```

Best items for demo: **plastic water bottles** and **paper cups** in good lighting.

---

## Environment Variables

The `.env` file in the repo root is pre-configured. No changes needed to run locally.

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Auth token signing key |
| `CV_SERVICE_URL` | `http://localhost:8000` |
| `CV_MOCK_MODE` | `"true"` to skip YOLO, `"false"` for real detection |
| `NEXT_PUBLIC_URL` | `http://localhost:3000` |

---

## How It Works

1. User uploads a **Before photo** showing litter on the ground
2. User picks up the trash
3. User uploads an **After photo** of the same spot
4. YOLOv8 counts litter objects in each photo
5. **Points = items in Before - items in After** (1 point per item removed)
6. Photo EXIF timestamps are checked — a soft warning appears if the after photo was taken before the before photo

---

## Scoring

| Rule | Value |
|------|-------|
| Points per item removed | 1 pt |
| XP per point | 2 XP |
| Minimum to earn | Must remove at least 1 item |

## Level System

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Seedling | 0 |
| 2 | Recycler | 100 |
| 3 | Eco Scout | 300 |
| 4 | Eco Warrior | 600 |
| 5 | Cleanup Hero | 1,000 |
| 6 | Green Champion | 1,500 |
| 7 | Earth Defender | 2,200 |
| 8 | Planet Guardian | 3,000 |
| 9 | Eco Legend | 4,000 |
| 10 | Nature's Hero | 5,500 |

## Achievements

| Achievement | Condition |
|-------------|-----------|
| First Pickup | Remove your first item |
| Recycler | Collect 10 items total |
| Eco Warrior | Collect 50 items total |
| Cleanup Hero | Collect 100 items total |
| Planet Guardian | Collect 500 items total |
| On a Roll | 3-day cleanup streak |
| Week Warrior | 7-day cleanup streak |
| Habit Hero | 30-day cleanup streak |
| Bottle Collector | Collect 25 plastic bottles |
| Bag Buster | Collect 10 plastic bags |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v3 |
| Backend | Next.js API routes (Node.js) |
| Database | MongoDB Atlas via Prisma |
| CV | Python FastAPI + YOLOv8 two-model pipeline |
| Auth | JWT via `jose`, passwords hashed with `bcryptjs` |
| EXIF | `exifr` for photo timestamp validation |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/cleanup/compare` | Analyze before/after photos |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/user/profile` | User stats + achievements |
