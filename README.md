# AI-Powered Digital Accessibility Auditor — MVP (3 Modules)

This is a working MERN-stack scaffold covering three modules for review:

1. **Auth module** — register / login / logout with JWT + bcrypt (backend), full login/register UI (frontend)
2. **Web scraper module** — Playwright + axe-core crawler scoped to 10 target WCAG 2.2 success criteria, with a "New Scan" UI that drives it live
3. **Dashboard module** — mock-data endpoints and a dashboard UI (overview stats, score ring, criteria breakdown, recent issues, improvement comparison)

The other modules from the full project brief (WCAG evaluation engine expansion, AI remediation assistant, full scan history, improvement comparison against real data) are intentionally out of scope here and are the natural next milestones.

## Stack

- **Backend**: Node.js, Express 5, MongoDB + Mongoose 9, JWT, bcryptjs, Playwright, @axe-core/playwright, express-validator
- **Frontend**: React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios, Recharts (installed, ready for future charts), Lucide icons

All dependency versions were resolved to latest-at-install-time (see each `package.json`).

## Project structure

```
accessibility-auditor/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # auth, scan, dashboard logic
│   │   ├── data/            # mock dashboard dataset
│   │   ├── middleware/      # JWT auth guard, error handling
│   │   ├── models/          # User, Website, Scan, AccessibilityIssue
│   │   ├── routes/          # /api/auth, /api/scans, /api/dashboard
│   │   ├── services/        # crawlerService.js (Playwright + axe-core)
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/              # axios client with JWT interceptor
    │   ├── components/       # ScoreRing, SeverityBadge, layout, etc.
    │   ├── context/          # AuthContext
    │   ├── pages/            # Login, Register, Dashboard, Scan, 404
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## Setup

### Prerequisites

- Node.js 20+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd backend
npm install

# Playwright needs its browser binary downloaded once:
npx playwright install --with-deps chromium

cp .env.example .env
# then edit .env: set MONGO_URI to your database, and set JWT_SECRET
# to a long random string (e.g. `openssl rand -hex 32`)

npm run dev
# API runs at http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point at http://localhost:5000/api
npm run dev
# App runs at http://localhost:5173
```

### 3. Try it out

1. Open `http://localhost:5173`, you'll be redirected to `/login`.
2. Click **Create one** and register an account.
3. You'll land on the **Dashboard**, showing mock overview data.
4. Go to **New Scan**, enter a real URL (e.g. `https://example.com`), and click **Run scan**. This triggers a real headless Chromium crawl via Playwright, runs axe-core scoped to the 10 target WCAG 2.2 criteria, and returns/persists real findings.

## What the scanner checks

The crawler (`backend/src/services/crawlerService.js`) is scoped to exactly the 10 WCAG 2.2 success criteria selected for this MVP:

| SC | Title | Detection |
|---|---|---|
| 1.1.1 | Non-text Content | Automated |
| 1.3.1 | Info and Relationships | Automated |
| 1.3.2 | Meaningful Sequence | Automated |
| 1.4.3 | Contrast (Minimum) | Automated |
| 1.4.4 | Resize Text | Automated |
| 1.4.11 | Non-text Contrast | Automated |
| 2.4.2 | Page Titled | Automated |
| 2.4.4 | Link Purpose (In Context) | Presence-only (flagged `needs_review`) |
| 2.4.6 | Headings and Labels | Presence-only (flagged `needs_review`) |
| 4.1.2 | Name, Role, Value | Automated |

This mirrors the hybrid rule-based/AI-assisted design from the project brief: the rule engine (axe-core via Playwright) is authoritative for detection, and criteria that require judging *descriptiveness* rather than *presence* are explicitly marked for manual/AI review rather than silently treated as pass/fail.

## API reference (quick)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Private | Log out |
| GET | `/api/auth/me` | Private | Current user |
| GET | `/api/scans/criteria` | Private | List the 10 tracked WCAG criteria |
| POST | `/api/scans` | Private | Run a live crawl+scan on a URL |
| GET | `/api/scans` | Private | List your scan history |
| GET | `/api/scans/:id` | Private | Get one scan + its issues |
| GET | `/api/dashboard/overview` | Private | Mock summary stats |
| GET | `/api/dashboard/websites` | Private | Mock tracked-websites list |
| GET | `/api/dashboard/websites/:id/history` | Private | Mock scan history for a site |
| GET | `/api/dashboard/comparison` | Private | Mock before/after comparison |
| GET | `/api/dashboard/criteria-breakdown` | Private | Mock per-criterion issue counts |
| GET | `/api/dashboard/recent-issues` | Private | Mock recent issues feed |

## Notes for your review

- The scoring formula in `crawlerService.js` (start at 100, deduct weighted points per severity) is a placeholder documented as such — worth discussing as a design decision in your report rather than treating as objectively correct.
- Dashboard data is intentionally mocked per your request; swapping it for real aggregation queries against `Scan`/`AccessibilityIssue` is a drop-in replacement since the response shapes already match what the real data would look like.
- The scanner currently handles a single page per scan (matches the brief's suggested initial scope in Module 2 — multi-page crawling within a domain is a natural next step, not yet implemented).
