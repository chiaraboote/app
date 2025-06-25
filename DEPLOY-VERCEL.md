# Deploy to Vercel - Simple Setup ✅

## What You Get:
- ✅ Frontend: Fast Next.js app
- ✅ Backend: Python API as serverless functions
- ⚠️ Limitations: 10-second timeout, cold starts

## Deploy Steps:

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel with serverless backend"
git push
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 3. Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:
- `GOOGLE_API_KEY` = `AIzaSyAKXR8abOnE_yInp-dUjoJLYhwN5k95Tf8`
- `NCBI_API_KEY` = (optional)

### 4. Deploy!
Vercel will automatically deploy. Your app will be at:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/verify-claim`

## What Happens:
1. Frontend loads normally
2. When you submit a health claim → calls `/api/verify-claim`
3. Vercel runs the Python function
4. Returns AI analysis

## Expected Performance:
- ⚡ **Frontend**: Instant load
- 🐌 **First API call**: 3-5 seconds (cold start)
- ⚡ **Follow-up calls**: ~1-2 seconds
- ⏱️ **Timeout**: 10 seconds max per request

## If Issues:
Check Vercel Function logs in dashboard for any Python errors.

**That's it! One-click deployment to Vercel! 🚀** 