# N.E.S.T Backend Setup

## Prerequisites
- Python 3.12+ 
- Google Gemini API key

## Quick Start

1. **Install Dependencies:**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Set Environment Variables:**
   Create a `.env` file in the root directory:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   NCBI_API_KEY=your_ncbi_api_key_here  # optional but recommended
   ```

3. **Start the Server:**
   ```bash
   ./start-backend.sh
   ```
   Or manually:
   ```bash
   cd api
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Test the API:**
   - Open: http://127.0.0.1:8000
   - API docs: http://127.0.0.1:8000/docs

## API Endpoints

- `GET /` - Welcome message
- `POST /verify-claim` - Analyze a health claim
- `POST /breakdown-claim` - Break down complex claims into specific questions

## Dependencies

- **FastAPI** - Web framework
- **Google Generative AI** - Gemini AI integration  
- **httpx** - HTTP client for PubMed API
- **python-dotenv** - Environment variable management 