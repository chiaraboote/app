from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv() # Load environment variables from .env file

import pubmed_client
import ai_client
import asyncio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ClaimRequest(BaseModel):
    claim: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the N.E.S.T API"}

@app.post("/verify-claim")
async def verify_claim(claim_request: ClaimRequest):
    original_claim = claim_request.claim
    print(f"--- 1. Received Claim: {original_claim} ---")

    # Step 1.5: Refine the claim into a search query using Gemini
    print("--- 1.5. Generating PubMed Query ---")
    search_query = await ai_client.generate_pubmed_query(original_claim)
    print(f"--- Generated Query: {search_query} ---")

    # Step 2: Search PubMed for article IDs
    print(f"--- 2. Searching PubMed with query: '{search_query}' ---")
    pmids = await pubmed_client.search_pubmed(search_query)
    print(f"--- Found {len(pmids)} PubMed IDs ---")

    if not pmids:
        return {
            "status": "no_results",
            "claim_text": original_claim,
            "summary": "No relevant articles found on PubMed for this claim."
        }

    # Step 3: Fetch abstracts for the given PMIDs
    print(f"--- 3. Fetching {len(pmids)} abstracts ---")
    articles_with_abstracts = await pubmed_client.fetch_abstracts(pmids)
    print(f"--- Fetched {len(articles_with_abstracts)} abstracts ---")

    # Step 4: Classify each abstract
    tasks = [ai_client.classify_abstract(original_claim, article.get("abstract", "")) for article in articles_with_abstracts]
    classifications = await asyncio.gather(*tasks)
    print(f"--- 4. Finished Classifications: {classifications} ---")

    # Combine articles with their classifications
    classified_articles = []
    for i, article in enumerate(articles_with_abstracts):
        article['classification'] = classifications[i]
        classified_articles.append(article)

    # Step 5: Generate the final summary
    print("--- 5. Generating Final Summary ---")
    summary = await ai_client.generate_summary(original_claim, classified_articles)
    
    return {"summary": summary, "articles": classified_articles}

@app.post("/breakdown-claim")
async def breakdown_claim_endpoint(claim_request: ClaimRequest):
    claim = claim_request.claim
    try:
        suggestions = await ai_client.breakdown_claim(claim)
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Error breaking down claim: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions.") 