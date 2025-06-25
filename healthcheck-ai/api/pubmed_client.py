import httpx
import os
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

# It's good practice to use an API key for NCBI E-utilities
# You can get one here: https://www.ncbi.nlm.nih.gov/account/
# Store it in a .env file or as an environment variable
NCBI_API_KEY = os.getenv("NCBI_API_KEY")
BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

async def search_pubmed(query: str, max_results: int = 10) -> List[str]:
    """
    Searches PubMed for a given query and returns a list of article IDs.
    """
    search_url = f"{BASE_URL}esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": str(max_results),
        "sort": "relevance",
        "retmode": "json",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(search_url, params=params)
            response.raise_for_status()  # Raises an exception for 4XX or 5XX status codes
            data = response.json()
            return data.get("esearchresult", {}).get("idlist", [])
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"An error occurred during PubMed search: {e}")
            return []

async def fetch_abstracts(pmids: List[str]) -> List[Dict[str, Any]]:
    """
    Fetches abstracts and other details for a list of PubMed IDs (PMIDs).
    """
    if not pmids:
        return []

    fetch_url = f"{BASE_URL}efetch.fcgi"
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(fetch_url, data=params) # Use POST for larger ID lists
            response.raise_for_status()
            
            # Parse the XML response
            root = ET.fromstring(response.content)
            articles = []
            for article_element in root.findall('.//PubmedArticle'):
                pmid_element = article_element.find('.//PMID')
                pmid = pmid_element.text if pmid_element is not None else ''

                title_element = article_element.find('.//ArticleTitle')
                title = title_element.text if title_element is not None else 'No Title'

                abstract_text_elements = article_element.findall('.//Abstract/AbstractText')
                abstract = ' '.join([elem.text for elem in abstract_text_elements if elem.text]) if abstract_text_elements else 'No Abstract'
                
                articles.append({
                    "pmid": pmid,
                    "title": title,
                    "abstract": abstract
                })
            return articles
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred while fetching abstracts: {e.response.status_code} - {e.response.text}")
            return []
        except ET.ParseError as e:
            print(f"Error parsing XML: {e}")
            return []
        except Exception as e:
            print(f"An error occurred during abstract fetching: {e}")
            return [] 