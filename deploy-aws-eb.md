# Deploy to AWS Elastic Beanstalk (MUCH BETTER!) 🚀

## Why Elastic Beanstalk > Vercel for this app:
- ✅ **No serverless complexity** - Runs as a normal web app
- ✅ **No timeout limits** - Perfect for AI processing  
- ✅ **Better debugging** - Real server logs
- ✅ **No cold starts** - Always warm
- ✅ **Cheaper for AI workloads** - Pay for compute time, not per request

## Deploy Steps:

### 1. Install EB CLI
```bash
# Mac
brew install awsebcli

# Windows/Linux
pip install awsebcli
```

### 2. Create Application.py (EB Entry Point)
Already done! Create in root:

```python
# application.py
import sys
import os

# Add the api directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from main import app

# EB expects 'application' variable
application = app

if __name__ == "__main__":
    application.run(debug=True)
```

### 3. Create requirements.txt in root
```txt
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
httpx==0.25.2
google-generativeai==0.3.2
pydantic==2.5.0
```

### 4. Create .ebextensions/python.config
```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: application:application
  aws:elasticbeanstalk:application:environment:
    GOOGLE_API_KEY: "AIzaSyAKXR8abOnE_yInp-dUjoJLYhwN5k95Tf8"
```

### 5. Deploy!
```bash
# Initialize EB
eb init

# Create environment  
eb create production

# Deploy
eb deploy
```

## Frontend Update:
Update the API URLs to point to your EB URL:

```javascript
// In app/page.tsx, replace:
const API_BASE = 'https://your-eb-url.elasticbeanstalk.com';

// Replace /api/verify-claim with:
fetch(`${API_BASE}/verify-claim`, {
  // ...
})
```

## Benefits:
- 🚀 **5-10x faster** - No cold starts
- 🛠️ **Easy debugging** - Real server logs  
- 💰 **Predictable costs** - ~$10-20/month vs per-request
- ⚡ **No timeouts** - Handle long AI processing
- 📈 **Auto-scaling** - Handles traffic spikes

**Much cleaner than fighting with serverless functions!** 💪 