# GovtEx Orbit

A full-stack exam-eligibility and prep platform for Indian government/competitive exam
aspirants, built from the "GovtEx Orbit" design system. Students create a profile, get an
automatic eligibility check across a catalog of government exams (SSC, Banking, Railways,
Defence, Police, Teaching), track applications through each stage, and browse a study
library of subject notes and video lectures.

## Stack

- **Backend:** Node.js, Express, SQLite (via `better-sqlite3`), JWT auth, bcrypt password hashing.
- **Frontend:** React 19 + Vite, React Router, plain CSS using the design tokens from
  `stitch_govtex_orbit_premium/govtex_orbit/DESIGN.md` (Deep Navy / Modern Blue palette, Inter
  typeface, 12–16px rounded corners, ambient shadows).
- No external services required — everything runs locally.

## Project layout

```
govtex-orbit/
  backend/         Express API + SQLite database
    db.js                  schema definition
    eligibility-engine.js  core eligibility logic (age, education, category, physical)
    seed.js                seeds 8 sample exams, 6 subjects, 15 notes, 8 videos
    routes/                 auth, profile, exams, eligibility, applications, content, saved, dashboard
  frontend/        React app (Vite)
    src/pages/              one file per screen
    src/components/         shared UI (cards, badges, nav, empty/loading states)
    src/styles/theme.css    design tokens as CSS variables
```

## Running it locally

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
npm run seed     # creates govtex.db and fills it with sample exams/content (safe to re-run, it no-ops if already seeded)
npm start        # runs on http://localhost:4000
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173** — the Vite dev server proxies all `/api/*` calls to the
backend on port 4000, so no extra configuration is needed.

### Using it from your phone (same WiFi as your PC)

The dev servers are already configured to accept connections from other devices on your
network, not just `localhost`. To open the app on your phone:

1. Make sure your phone and PC are on the **same WiFi network**.
2. Find your PC's local IP address:
   - **Windows:** open Command Prompt, run `ipconfig`, look for "IPv4 Address" (e.g. `192.168.1.42`).
   - **Mac:** System Settings → Wi-Fi → Details → look for the IP address, or run `ipconfig getifaddr en0` in Terminal.
   - **Linux:** run `hostname -I` or `ip addr`.
3. Start both servers as usual (`npm start` in `backend/`, `npm run dev` in `frontend/`).
4. On your phone's browser, go to `http://<that-IP>:5173` (e.g. `http://192.168.1.42:5173`).

That's it — the frontend's dev server proxies API calls to the backend for you, so you
don't need to change anything else. If your phone can't connect, check that your PC's
firewall isn't blocking inbound connections on ports 4000 and 5173.

This only works while your PC is on and both servers are running, and only for devices on
the same local network — it's not reachable from the internet. To make it available
anywhere (not just your home WiFi), you'd need to deploy the backend and frontend to a
hosting provider — ask if you'd like help with that.

### Production build

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host, and point it at a deployed instance of the
backend (set `VITE`-style env/proxy or update `src/api.js` to use an absolute API URL).

## Deploying it so it's reachable from anywhere

The repo includes a `Dockerfile` at the root that builds the frontend and bundles it into
the backend, so the whole app — API + web app — runs as **one container on one port**.
I tested this exact build locally (not via Docker itself, but by running the same steps
the Dockerfile runs) and confirmed the API, the React app, client-side routing, and static
assets all work correctly from a single process.

I can't create hosting accounts or click "deploy" on your behalf — this sandbox has no
network access to hosting dashboards, only to package registries. But once you push this
folder to a GitHub repo, deploying it yourself is a few clicks:

### Option A — Render (free tier, easiest)

1. Push this project to a GitHub repository.
2. Go to [render.com](https://render.com) → **New +** → **Web Service** → connect your repo.
3. Render will detect the `Dockerfile` automatically. Leave the build settings as-is.
4. Add an environment variable: `JWT_SECRET` = any long random string.
5. Click **Create Web Service**. Render gives you a public URL like
   `https://govtex-orbit.onrender.com` — that's your live app, API and frontend together.

**Important:** Render's free tier uses an ephemeral filesystem, so the SQLite database
resets on every redeploy/restart. Fine for demos; for anything persistent, either add a
paid Render Disk (mount it at `/app` and point `db.js` at it) or swap SQLite for a hosted
Postgres and update `backend/db.js` accordingly.

### Option B — Railway

Same idea: [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
→ it detects the Dockerfile → add `JWT_SECRET` as a variable → deploy. Railway's free tier
also resets local disk storage on redeploy for the same reason as above.

### Option C — Any VPS you already have (DigitalOcean, EC2, etc.)

```bash
git clone <your-repo-url>
cd govtex-orbit
docker build -t govtex-orbit .
docker run -d -p 80:4000 -e JWT_SECRET=<your-secret> -v govtex-data:/app govtex-orbit
```
The `-v govtex-data:/app` volume keeps the SQLite file persistent across container
restarts on a VPS you control.

## Installing it as an app on your phone or PC

GovtEx Orbit is set up as a **Progressive Web App (PWA)**: it has a real app icon and a
manifest, so once it's deployed (e.g. on Railway/Render), you can install it like a native
app straight from the browser — no app store needed.

- **Android (Chrome):** open the site → tap the **⋮** menu → **Install app** (or you'll see
  an automatic "Add GovtEx Orbit to Home screen" banner). It installs with its own icon and
  opens full-screen, no browser bar.
- **iPhone/iPad (Safari):** open the site → tap the **Share** icon → **Add to Home Screen**.
- **Desktop (Chrome/Edge):** open the site → click the **install icon** in the address bar
  (or menu → **Install GovtEx Orbit…**). It opens in its own window like a desktop app.

This works on whatever URL you deployed to (e.g. your Railway domain) — it doesn't need to
be running on your local PC for this part.

## What's implemented

- **Auth:** signup / login (JWT, 30-day session), protected routes.
- **Onboarding:** 3-step wizard (basic details → education → physical profile & preferences),
  skippable, resumable (redirects to the right step based on `onboarding_step`).
- **Eligibility engine:** evaluates each exam against age (with SC/ST/OBC/EWS relaxation),
  minimum qualification, minimum percentage, and gender-specific physical standards
  (height/chest) where applicable. Returns per-criterion pass/fail/incomplete plus an
  overall status.
- **Explore Exams:** search + category filter, save/bookmark, eligibility badges inline.
- **Exam Detail:** full eligibility breakdown, add-to-tracker / mark-as-applied actions.
- **My Eligibility Status:** all exams grouped by eligible / not eligible / incomplete.
- **Application Tracker:** draft → applied → admit card → exam taken → result pipeline.
- **Study Library:** subject list → notes (PDF-style) and video lectures per subject,
  global video search, note detail view with full content.
- **Saved items:** bookmark exams, notes, and videos; unified saved list with type filters.
- **Profile:** edit all onboarding data any time; logout.

## Sample login

Since this is a fresh database, sign up with any email/password from the app itself —
there's no pre-seeded user account (only exam/content data is seeded).

## Notes on the eligibility data

The 8 seeded exams (SSC CGL, IBPS PO, RRB NTPC, UPSC CDS, State Police Constable, CTET,
SSC MTS, NDA) use realistic but illustrative age limits, qualification requirements, and
physical standards — good enough to fully exercise every branch of the eligibility engine,
but not guaranteed to match the current official notification for any real exam cycle.
Swap the rows in `backend/seed.js` (or insert directly into `exams`) with real data to make
it authoritative.
