# Asha Sethu — Mission 0 Project Notes

## Stack
- **Frontend:** React 18 + Vite (two separate apps: root app + web/ scaffold)
- **Backend:** Python + Vercel Functions (api/)
- **Database:** Supabase (PostgreSQL) — optional smoke test
- **Auth/Secrets:** Environment variables only; never hardcoded or console-printed
- **Package Manager:** npm

## Safety & Secrets Rules
1. **No hardcoded secrets** in any file
2. **No console.log() of sensitive data** (API keys, tokens, URLs, user data)
3. **No browser-to-database access** — all Supabase queries via backend API
4. **.env files never committed** — use .env.example as template
5. **Vercel Functions** handle all external integrations (Supabase, Groq, Doctor Inbox)
6. **No email/phone/PII logged** in frontend or function logs
7. **CORS/origin validation** on API routes

## Mission 0 Scope
Build a minimal smoke-test scaffold to validate full-stack setup:
- **Frontend:** web/ React+Vite page with "hello" UI + button to call api/hello
- **Backend:** api/hello.py Vercel function returning hello response
- **Database:** When SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY present, insert & read one smoke row (validates Supabase connectivity)
- **No deploy/commit/push** until credentials provided
- **No service signups** required at this stage
- **Existing root app** remains functional; web/ is separate scaffold

## Current Files
- **Root app:** src/, index.html, package.json (Home screen + theme tokens + components)
- **Mission 0:** web/ (React scaffold), api/ (Python function), .env.example, .gitignore, PROJECT_NOTES.md

## Project Context
- **Project:** Asha Sethu (Hackathon: Code for a Billion)
- **Built in:** AgentFoundry
- **Web Frontend:** React 18 + Vite in plain JavaScript (NO TypeScript)
- **Backend:** Python (FastAPI) agent using LangGraph, deployed as Vercel Python functions
- **Database:** Supabase (PostgreSQL)
- **AI Model:** Groq API (called only from Python backend, never from browser)
- **Deploy Target:** Vercel

## Safety & Danger Level Rules
- **Danger-level floor** is computed in plain Python; agent can raise it but never lower it
- **Levels:** RED, AMBER, UNSURE, GREEN
- **UNSURE Display:** shown in amber style with the word "Unsure"
- **GREEN Display:** only when worker finished the checklist and nothing was found or unclear
- **Data Saving:** nothing is saved or sent without the worker's tap
- **Patient Identity:** no patient names, no initials — use a random patient code
- **Demo Data Tag:** any made-up data must be tagged "DEMO DATA"
- **API Keys:** only in `.env` and Vercel env vars; `.env` in `.gitignore`
- **Browser Security:** browser never talks to Supabase directly (all via backend API)

## Design Rules
- Follow DESIGN.md exactly before any screen work
- Current mission: 0 (smoke test scaffold)

## Next Steps (when credentials available)
1. Populate .env with Supabase credentials + Groq API key + Doctor Inbox code
2. Set up Supabase table via provided SQL
3. Deploy api/ to Vercel (function)
4. Deploy web/ to Vercel (frontend)
5. Test smoke workflow end-to-end
