import os
import google.generativeai as genai
from typing import List, Dict, Any

# Configure the Gemini client
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    raise ValueError("GOOGLE_API_KEY environment variable is required")

# Set up the models
classification_model = genai.GenerativeModel('gemini-1.5-flash')
summary_model = genai.GenerativeModel('gemini-1.5-pro')
query_generation_model = genai.GenerativeModel('gemini-1.5-flash') # Use flash for speed
breakdown_model = genai.GenerativeModel('gemini-1.5-flash')

async def breakdown_claim(claim: str) -> List[str]:
    """
    Breaks down a broad health claim into several specific, answerable questions.
    """
    if not claim:
        return []

    prompt = f"""
    A user has submitted the following broad health claim: "{claim}"

    Your task is to break this broad claim down into 3-5 specific, answerable, and distinct questions that can be investigated using scientific literature on PubMed. Each question should explore a different facet of the original claim.

    For example, if the claim is "red meat is bad for you," you could generate questions like:
    - "What is the association between red meat consumption and colorectal cancer incidence?"
    - "Does the type of red meat (e.g., beef, pork, lamb) differentially affect cancer risk?"
    - "What is the impact of different cooking methods of red meat on cancer risk?"
    - "Is there a link between red meat consumption and cardiovascular disease?"

    Generate a list of questions based on the user's claim. Return the questions as a Python list of strings.
    """

    try:
        response = await breakdown_model.generate_content_async(prompt)
        # Assuming the model returns a string that looks like a Python list
        suggestions = eval(response.text.strip())
        if isinstance(suggestions, list):
            return suggestions
        return []
    except Exception as e:
        print(f"An error occurred during claim breakdown: {e}")
        return []

async def generate_pubmed_query(claim: str) -> str:
    """
    Uses Gemini to refine a natural language health claim into a
    keyword-focused search query for PubMed.
    """
    if not claim:
        return ""

    prompt = f"Convert the following health claim into a concise, effective search query for the PubMed database. Focus on keywords and scientific terminology. Do not include quotes or boolean operators in the output.\n\nClaim: \"{claim}\"\n\nPubMed Query:"

    try:
        response = await query_generation_model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"An error occurred during query generation: {e}")
        return claim # Fallback to the original claim

async def classify_abstract(claim: str, abstract: str) -> str:
    """
    Classifies an abstract as SUPPORTING, OPPOSING, or NEUTRAL
    in relation to a given health claim using Gemini.
    """
    if not abstract or not claim:
        return "NEUTRAL"

    prompt = f"Health Claim: \"{claim}\"\n\nAbstract: \"{abstract}\"\n\nBased on the abstract, does it support, oppose, or is it neutral towards the health claim? Respond with only one word: SUPPORTS, OPPOSES, or NEUTRAL."
    
    try:
        response = await classification_model.generate_content_async(prompt)
        classification = response.text.strip().upper()
        if classification not in ["SUPPORTS", "OPPOSES", "NEUTRAL"]:
            return "NEUTRAL"
        return classification
    except Exception as e:
        print(f"An error occurred during Gemini classification: {e}")
        return "NEUTRAL"

async def generate_summary(claim: str, articles: List[Dict[str, Any]]) -> str:
    """
    Generates a final summary and verdict based on the classified articles using Gemini.
    """
    if not articles:
        return "No articles were analyzed."

    prompt = f"Health Claim: \"{claim}\"\n\nI have analyzed several articles with the following classifications:\n"
    for article in articles:
        prompt += f"- Title: {article.get('title', 'N/A')}, Classification: {article.get('classification', 'N/A')}\n"
    
    prompt += "\nBased on this evidence, please provide a concise, neutral, one-paragraph summary of the findings regarding the health claim. Start with a clear verdict (e.g., 'Largely Supported', 'Largely Opposed', 'Mixed Evidence', 'Not Enough Evidence')."

    try:
        response = await summary_model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"An error occurred during Gemini summary generation: {e}")
        return "Could not generate a summary due to an error." 