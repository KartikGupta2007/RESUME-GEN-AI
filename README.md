# RESUME GEN-AI

RESUME GEN-AI is a full-stack application that helps users prepare for interviews by generating a structured AI report from job context and candidate profile data.

The project currently runs as:
- Frontend on Vercel (Vite + Preact)
- Backend on Render (Express + MongoDB)
- OpenAI-backed report generation

## What This Project Does

- User authentication with JWT access and refresh tokens
- Secure session persistence via HttpOnly cookies
- Resume PDF upload and text extraction
- AI-generated interview preparation report, including:
  - match score
  - technical questions with answer strategy
  - behavioral questions with answer strategy
  - skill gaps and severity
  - day-wise preparation plan
- Personal report history and detailed report view
- Resume PDF export from stored interview context

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
- JWT + bcrypt
- cookie-parser + CORS
- multer (memory storage)
- pdf-parse
- OpenAI SDK + Zod output parsing
- PDFKit

## Repository Layout

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

## Frontend Route Map

- /login
- /register
- / (protected)
- /profile (protected)
- /interview/:interviewId (protected)

Auth guarding is handled by Auth context + protected route wrapper.

## Backend API Overview

Base path: /api/v1

### User Endpoints

- POST /users/register (public)
- POST /users/login (public)
- POST /users/refresh-token (public)
- POST /users/logout (private)
- POST /users/change-password (private)
- GET /users/me (private)

### Interview Endpoints

- POST /interview/ (private, multipart/form-data)
- GET /interview/reports (private)
- GET /interview/report/:interviewId (private)
- GET /interview/report/:interviewReportId/resume (private, PDF download)

## API Payload Quick Reference

### Register

POST /api/v1/users/register

```json
{
  "fullName": "Your Name",
  "userName": "yourusername",
  "email": "you@example.com",
  "password": "your-password"
}
```

### Login

POST /api/v1/users/login

```json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

### Generate Interview Report

POST /api/v1/interview/

Content-Type: multipart/form-data

Fields:
- jobDescription (string)
- selfDescription (string, optional)
- resume (file, optional PDF, max 5 MB)

## Authentication and Session Flow

1. Login issues accessToken + refreshToken cookies.
2. Access token protects private API routes.
3. Frontend checks current session via GET /api/v1/users/me on app load.
4. If access token expires, Axios interceptor calls refresh-token once and retries pending request.
5. If refresh fails, protected routing naturally returns user to login state.

Cookie options in backend are currently set for hosted HTTPS:
- httpOnly: true
- secure: true
- sameSite: none

## Environment Variables

## Backend (Backend/.env)

| Name | Required | Example | Purpose |
|---|---|---|---|
| PORT | No | 8000 | Backend port (defaults to 8000) |
| MONGODB_URI | Yes | mongodb+srv://user:pass@cluster | MongoDB base URI |
| CORS_ORIGIN | Yes | http://localhost:5173 | Allowed frontend origin(s), comma-separated |
| ACCESS_TOKEN_SECRET | Yes | long-random-string | JWT access token signing secret |
| ACCESS_TOKEN_EXPIRY | Yes | 15m | Access token lifetime |
| REFRESH_TOKEN_SECRET | Yes | long-random-string | JWT refresh token signing secret |
| REFRESH_TOKEN_EXPIRY | Yes | 7d | Refresh token lifetime |
| OPENAI_API_KEY | Yes | sk-... | OpenAI API key for report generation |
| NODE_ENV | No | development | Runtime mode |

Important backend notes:
- DB name GenAIFullStackProject is appended in code.
- If MONGODB_URI ends with a slash, code trims it before connect.
- CORS_ORIGIN must match deployed frontend origin exactly (no trailing slash).

## Frontend (Frontend/.env)

| Name | Required | Example | Purpose |
|---|---|---|---|
| VITE_API_URL | Yes | http://localhost:8000 | API base used by Axios |

Production note for this repository:
- Because Frontend/vercel.json proxies /api to Render, set VITE_API_URL to your Vercel domain, not Render.
- Example: VITE_API_URL=https://resume-gen-ai-one.vercel.app

No trailing slash.

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB
- OpenAI API key

### Install

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Run Backend

```bash
cd Backend
npm run dev
```

### Run Frontend

```bash
cd Frontend
npm run dev
```

Defaults:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Deployment Guide (Current Architecture)

## 1) Deploy Backend on Render

- Root directory: Backend
- Build command: npm install
- Start command: npm start
- Add all backend environment variables
- Set CORS_ORIGIN to your Vercel origin (for example https://resume-gen-ai-one.vercel.app)

## 2) Deploy Frontend on Vercel

- Root directory: Frontend
- Build command: npm run build
- Output directory: dist
- Add VITE_API_URL as your Vercel domain

This project already includes Frontend/vercel.json rewrites:
- /api/(.*) -> Render API
- /(.*) -> /index.html

## Scripts

### Backend
- npm run dev
- npm start
- npm test (currently mapped to nodemon server run)

### Frontend
- npm run dev
- npm run build
- npm run preview

## Data Model Summary

### User
- userName
- email
- password (hashed)
- fullName
- refreshToken

### InterviewReport
- jobDescription
- jobTitle
- resume (parsed text)
- selfDescription
- matchScore
- technicalQuestions[]
- behavioralQuestions[]
- skillGaps[]
- preparationPlan[]
- user reference
- timestamps

## AI Generation Details

- Uses OpenAI model gpt-4o
- Uses Zod schema parsing to enforce structured response
- Stores parsed result directly in InterviewReport collection

## Troubleshooting

### 404 on /login after refresh in production

Cause: missing SPA fallback rewrite.

Fix: ensure Vercel rewrite sends all non-API routes to /index.html.

### 401 on /api/v1/users/me

Possible causes:
- no auth cookies yet (normal before login)
- expired access token and invalid refresh token
- origin mismatch between Vercel and Render CORS setting

Fix:
- verify CORS_ORIGIN on Render equals deployed Vercel origin
- verify VITE_API_URL on Vercel equals Vercel domain when using proxy
- redeploy after env var updates

### Infinite auth retry loops

Fix in current codebase:
- refresh endpoint is excluded from retry interception
- single shared refresh request is used for concurrent 401 responses
- hard redirect inside interceptor has been removed

### 405 method not allowed

Cause: wrong request method or rewrite mismatch.

Fix:
- verify frontend uses correct HTTP method for endpoint
- verify vercel.json API rewrite points to Render /api path

### CORS error with credentials

Cause: wildcard origin with credentials.

Fix:
- use explicit origins in CORS_ORIGIN only
- include withCredentials in frontend Axios requests

## Security and Hardening Suggestions

- Add rate limiting on auth endpoints.
- Add request validation middleware on all routes.
- Add audit logging and request IDs.
- Add integration tests for auth refresh lifecycle.
- Add CI checks for lint/build/test.
