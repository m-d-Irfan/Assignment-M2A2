# Assignment-M2A2
# 🚼 DevPulse API

> Internal Tech Issue & Feature Tracker

**Live URL:** `https://devpulse-api.onrender.com`
**GitHub:** `https://github.com/m-d-Irfan/devpulse`

---

## Tech Stack
- Node.js 24.x, TypeScript 5.x, Express.js
- PostgreSQL (NeonDB), raw `pg` driver — no ORM, no JOINs
- bcryptjs, jsonwebtoken, http-status-codes

## Local Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| POST | /api/issues | Authenticated |
| GET | /api/issues | Public |
| GET | /api/issues/:id | Public |
| PATCH | /api/issues/:id | Authenticated |
| DELETE | /api/issues/:id | Maintainer only |

**Authorization header:** `Authorization: <token>` (no Bearer prefix)