# Mission 0 Setup Guide

## Current Status
✅ Scaffold created (no deploy, no credentials populated yet)

## Files Created
- **PROJECT_NOTES.md** — stack, safety rules, secrets policy, Mission 0 scope
- **.gitignore** — .env, node_modules, Python cache, IDE
- **.env.example** — template with empty Supabase, Groq, Doctor Inbox keys
- **web/** — React+Vite scaffold with hello page + /api/hello caller
- **api/hello.py** — Python Vercel function (hello + optional Supabase smoke test)
- **api/requirements.txt** — Python dependencies (supabase, python-dotenv)
- **api/vercel.json** — Vercel function routing config

## Root App Status
✅ Existing Home screen, theme, components remain in root (src/, index.html, package.json)

## When You Have Credentials

### Step 1: Supabase Setup
1. Log in to [supabase.com](https://supabase.com)
2. Create or select a project
3. Go to **Settings** → **API** → copy `Project URL` and `Service Role Key`
4. Go to **SQL Editor** → paste this query and run:
   ```sql
   CREATE TABLE IF NOT EXISTS smoke_test (
     id BIGSERIAL PRIMARY KEY,
     test_field TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
5. Populate `.env`:
   ```
   SUPABASE_URL=<your-project-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

### Step 2: Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Create account or sign in
3. Create new project → import this repo
4. Add environment variables (Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

### Step 3: Test Smoke Workflow
1. Deploy web/ to Vercel (frontend)
2. Update web/ proxy target to deployed api/ URL
3. Click "Call /api/hello" button
4. Verify response: `{ "message": "hello", "supabase": "connected", "smoke_row_inserted": true }`

## Local Development
```bash
# Install root deps
npm install

# Install web deps
cd web && npm install

# Run web scaffold (dev server)
npm run dev

# Run api locally (requires local Python + requirements.txt)
# For testing: use Vercel CLI or manual HTTP client
```

## Safety Checklist
- [ ] No .env file committed
- [ ] No secrets in console logs
- [ ] No hardcoded API keys in code
- [ ] Browser never calls Supabase directly (only via api/hello)
- [ ] All external calls in backend only

---

## Mission 0 Corrections

### Required Supabase Table: `smoke`
The table is named `smoke` (not `smoke_test`). Use this SQL in Supabase **SQL Editor**:
```sql
CREATE TABLE IF NOT EXISTS smoke (
  id BIGSERIAL PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Python Function Behavior
`api/hello.py` will:
1. Return `{"message": "hello"}` always
2. If `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are configured:
   - Insert one row into `smoke` table with a message
   - Read it back and report count
   - Return `{"message": "hello", "supabase": "connected", "smoke_row_inserted": true, "smoke_rows_count": N}`
3. If credentials missing: return `{"message": "hello", "supabase": "not_configured"}`

### Web App Behavior
`web/src/SmokeTest.jsx`:
1. Displays "Asha Sethu — Smoke Test" header
2. Shows "Call /api/hello" button
3. On click: sends GET to `/api/hello`, displays response
4. Error handling: shows network or API errors

### Supabase Dashboard Clicks to Configure
1. Sign in to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Paste the `smoke` table creation SQL above and click **Run**
5. Go to **Settings** → **API** (left sidebar)
6. Copy `Project URL` (looks like `https://xxxxx.supabase.co`)
7. Copy `Service Role Key` (labeled "service_role")
8. Paste both into your `.env` file:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

### Vercel Dashboard Clicks to Configure & Verify
1. Sign in to [vercel.com](https://vercel.com)
2. Create a new project → **Import Git Repository** → select this repo
3. In project **Settings** → **Environment Variables**, add:
   - Key: `SUPABASE_URL` → Value: `https://xxxxx.supabase.co`
   - Key: `SUPABASE_SERVICE_ROLE_KEY` → Value: `eyJxxx...`
4. Click **Deploy** (or redeploy if already deployed)
5. After deployment:
   - Go to **Deployments** → select latest deployment
   - Copy the deployment URL (e.g., `https://my-project.vercel.app`)
   - Test manually: visit `https://my-project.vercel.app/api/hello`
   - Verify response includes `"supabase": "connected"` and `"smoke_row_inserted": true`
6. Deploy web/ as a separate Vercel project or in same project under `/web` directory
7. In web/ config, update proxy target to point to deployed api/ URL

### Local Verification (Before Deploy)
```bash
# Terminal 1: run web dev server
cd web && npm install && npm run dev
# Visit http://localhost:5173 → click button → should call /api/hello

# Terminal 2: test api locally (requires Python 3.9+)
cd api
pip install -r requirements.txt
# Use Vercel CLI or curl to test: curl http://localhost:3001/hello
```

### Live Checks
- ✅ Smoke table created in Supabase
- ✅ Environment variables set in Vercel
- ✅ GET /api/hello returns status 200 with valid JSON
- ✅ Response includes `"supabase": "connected"` when creds present
- ✅ Supabase SQL Editor shows rows in `smoke` table after calling endpoint
- ✅ Web app button successfully displays response (no CORS errors)

**No deploy, sign up, commit, or push yet.** Wait for credentials.
