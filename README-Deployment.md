# N.E.S.T Deployment Guide

## Frontend (Next.js) - Vercel ✅

The frontend deploys easily to Vercel:
1. Connect your GitHub repo to Vercel
2. Deploy automatically

## Backend (FastAPI) - Multiple Options

### Option 1: Vercel Serverless Functions (Current Setup)

**Pros:**
- Single deployment platform  
- Automatic scaling
- Built-in HTTPS

**Cons:**
- Cold starts (slower first requests)
- Limited to 10-second execution time
- More complex debugging

**Setup:**
- Already configured in `vercel.json`
- Need to set environment variables in Vercel dashboard:
  - `GOOGLE_API_KEY` 
  - `NCBI_API_KEY`

### Option 2: Separate Backend Deployment (Recommended)

Deploy the backend to a dedicated platform:

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

**Render:**
1. Connect GitHub repo
2. Choose "Web Service" 
3. Build command: `cd api && pip install -r requirements.txt`
4. Start command: `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`

**Heroku:**
```bash
# Create Procfile in root
echo "web: cd api && uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Option 3: Update Frontend URLs

If deploying backend separately, update the API URLs in the frontend:

```javascript
// Replace in app/page.tsx
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://127.0.0.1:8000';

// Use like:
fetch(`${API_BASE}/verify-claim`, {
  // ...
})
```

## Recommended Approach

For production, I recommend **Option 2** (separate backend deployment) because:
1. Better performance (no cold starts)
2. Easier debugging and monitoring  
3. More reliable for long-running AI processing
4. Better cost efficiency for frequent requests

The FastAPI backend is better suited for platforms designed for traditional web services rather than serverless functions. 