# RESUME GEN-AI

RESUME GEN-AI is a full-stack AI interview preparation platform. It turns resume context, self-description, and a target job description into a structured interview strategy.

## Live Project

- Frontend (Vercel): https://resume-gen-ai-one.vercel.app/
- Backend (Render): API served behind Vercel rewrite

## Core Features

- AI-generated interview report with:
  - role match score
  - technical questions with intention and answer approach
  - behavioral questions with intention and answer approach
  - skill-gap analysis with severity
  - day-wise preparation roadmap
- Input options:
  - resume PDF upload and parsing
  - self-description text
  - job description text
- Interview report history and detailed report view
- Resume context PDF export from stored report data
- Authentication:
  - local auth (email/password)
  - Google sign in/sign up
  - account linking by email (Google + local)
  - Google-first users can set a local password in Profile
- Session lifecycle and reliability:
  - JWT access + refresh token cookies
  - refresh-token retry flow with request deduplication
  - interceptor hardening for auth endpoints

## Tech Stack

### Frontend

- Vite
- Preact
- React Router
- Axios
- SCSS

### Backend

- Node.js + Express
- MongoDB + Mongoose
- OpenAI SDK + Zod schema parsing
- pdf-parse
- PDFKit
- JWT + bcrypt
- cookie-parser + CORS
- multer

## Repository Structure

```text
RESUME GEN-AI/
  Backend/
    src/
      app.js
      server.js
      controllers/
      db/
      middlewares/
      models/
      routes/
      services/
      utils/
  Frontend/
    src/
      Auth/
      Interview/
      main.jsx
      style.scss
    vercel.json
```

## Frontend Routes

- /login
- /register
- / (protected)
- /profile (protected)
- /interview/:interviewId (protected)

## Backend API

Base path: /api/v1

### User Routes

- POST /users/register (public)
- POST /users/login (public)
- POST /users/google (public)
- POST /users/refresh-token (public)
- POST /users/logout (private)
- POST /users/change-password (private)
- POST /users/set-password (private)
- GET /users/me (private)

### Interview Routes

- POST /interview/ (private, multipart/form-data)
- GET /interview/reports (private)
- GET /interview/report/:interviewId (private)
- GET /interview/report/:interviewReportId/resume (private, PDF download)

## Auth and Session Behavior

1. Login or Google auth issues access and refresh cookies.
2. Private routes use access token via cookie.
3. Frontend initializes session with GET /api/v1/users/me.
4. On 401, Axios performs one shared refresh request and retries pending requests.
5. Refresh failures dispatch an auth-expired event and UI returns to logged-out state.

Cookie policy is environment-aware:

- Production: secure=true, sameSite=none, httpOnly=true
- Development: secure=false, sameSite=lax, httpOnly=true

## Google Auth Notes

- Frontend uses Google Identity Services with a client ID.
- Backend verifies Google ID tokens using google-auth-library.
- For this flow, configure Authorized JavaScript origins in Google Cloud.
- Redirect URI is not required for the current implementation.

## Environment Variables

### Backend (Backend/.env)

| Name | Required | Purpose |
|---|---|---|
| CORS_ORIGIN | Yes | Allowed frontend origin(s), comma-separated |
| PORT | No | API port (defaults to 8000 if not set) |
| MONGODB_URI | Yes | MongoDB base URI (database name is appended in code) |
| ACCESS_TOKEN_SECRET | Yes | Access token signing secret |
| ACCESS_TOKEN_EXPIRY | Yes | Access token expiry |
| REFRESH_TOKEN_SECRET | Yes | Refresh token signing secret |
| REFRESH_TOKEN_EXPIRY | Yes | Refresh token expiry |
| GOOGLE_CLIENT_ID | Yes | Google OAuth client ID used for token verification |
| OPENAI_API_KEY | Yes | OpenAI key for report generation |
| OPENAI_MODEL | No | Defaults to gpt-4o-mini |
| NODE_ENV | No | development or production |

Important:

- CORS_ORIGIN must include your deployed frontend origin exactly.
- If MONGODB_URI ends with /, connection code trims it.
- Database name appended by code: GenAIFullStackProject.

### Frontend (Frontend/.env)

| Name | Required | Purpose |
|---|---|---|
| VITE_API_URL | Yes for local dev | Local API base URL while running dev server |
| VITE_GOOGLE_CLIENT_ID | Yes | Google OAuth client ID for GIS button |

Production behavior:

- In production build, API base resolves to current site origin.
- Vercel rewrite forwards /api/* to Render backend.
- You can keep VITE_API_URL focused on local development.

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance
- OpenAI API key
- Google OAuth web client ID

### Install

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Configure Environment

1. Copy Backend/.env.example to Backend/.env and fill values.
2. Copy Frontend/.env.example to Frontend/.env and fill values.
3. Set Frontend VITE_API_URL to your local backend URL (for example http://localhost:3000).

### Run

```bash
# terminal 1
cd Backend
npm run dev

# terminal 2
cd Frontend
npm run dev
```

## Deployment (Current Architecture)

### 1) Backend on Render

- Root: Backend
- Build command: npm install
- Start command: npm start
- Set all backend environment variables
- Set CORS_ORIGIN to Vercel frontend origin

### 2) Frontend on Vercel

- Root: Frontend
- Build command: npm run build
- Output: dist
- Set VITE_GOOGLE_CLIENT_ID

This repository includes Frontend/vercel.json rewrites:

- /api/(.*) -> Render backend /api/$1
- /(.*) -> /index.html (SPA fallback)

## Scripts

### Backend

- npm run dev
- npm start
- npm test (currently same runtime command as dev)

### Frontend

- npm run dev
- npm run build
- npm run preview

## Data Models

### User

- userName
- email
- password (optional for Google-only account until password is set)
- fullName
- authProvider (local or google)
- googleId
- avatarUrl
- refreshToken

### InterviewReport

- jobDescription
- jobTitle
- resume (parsed text)
- selfDescription
- matchScore (0-100)
- technicalQuestions[]
- behavioralQuestions[]
- skillGaps[]
- preparationPlan[]
- user reference
- timestamps

## Troubleshooting

### 401 on session endpoints

Check:

- CORS_ORIGIN contains deployed frontend origin
- Browser cookies are allowed
- Backend and frontend are both redeployed after env updates

### Google sign-in not rendering

Check:

- VITE_GOOGLE_CLIENT_ID is set in frontend environment
- Authorized JavaScript origins include current frontend URL

### API works locally but fails in production

Check:

- Vercel rewrite target points to correct Render backend URL
- Render backend is healthy and exposes /api/v1 routes
- NODE_ENV is production on backend for secure cookie behavior

## Future Improvements

- Rate limiting and abuse protection on auth endpoints
- Request validation middleware for all APIs
- Automated tests for auth refresh lifecycle and core interview flows
- CI pipeline for build and test checks
