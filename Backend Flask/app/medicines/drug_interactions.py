import requests
import re
from typing import List, Dict, Optional

def get_drug_interactions(primary_drug: str, related_drugs: List[str]) -> Dict:
    """
    Get drug interactions for a primary drug with a list of related drugs using FDA API.
    
    Args:
        primary_drug (str): The primary drug to check interactions for
        related_drugs (List[str]): List of drugs to check interactions with
        
    Returns:
        Dict: Dictionary containing interaction results
    """
    try:
        # Step 1: Send the request to get all interactions with the primary drug
        url = f"https://api.fda.gov/drug/label.json?search=drug_interactions:{primary_drug}"
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        
        # Step 2: Extract drug_interactions from the response
        interaction_text = ""
        for result in data.get("results", []):
            interaction_list = result.get("drug_interactions")
            if interaction_list and len(interaction_list) > 0:
                interaction_text = interaction_list[0]
                break  # Stop at the first one found
        
        # Step 3: Search within drug_interactions for specific drugs
        interactions = {}
        if interaction_text:
            for drug in related_drugs:
                # Improved regex pattern to find sentences containing the drug name
                # This pattern looks for the drug name within a sentence (ending with period)
                pattern = r'([^.]*?\b' + re.escape(drug) + r'\b[^.]*?\.)'
                matches = re.findall(pattern, interaction_text, re.IGNORECASE)
                
                if matches:
                    # Clean up the matches - remove extra whitespace and ensure proper formatting
                    cleaned_matches = []
                    for match in matches:
                        cleaned = match.strip()
                        if cleaned and len(cleaned) > 10:  # Only include meaningful sentences
                            cleaned_matches.append(cleaned)
                    interactions[drug] = cleaned_matches
                else:
                    interactions[drug] = []
        else:
            return {
                "success": False,
                "message": f"No drug interactions found for {primary_drug}",
                "interactions": {}
            }
        
        return {
            "success": True,
            "primary_drug": primary_drug,
            "interactions": interactions,
            "total_drugs_checked": len(related_drugs),
            "drugs_with_interactions": len([drug for drug, interactions_list in interactions.items() if interactions_list])
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "message": f"Error connecting to FDA API: {str(e)}",
            "interactions": {}
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Unexpected error: {str(e)}",
            "interactions": {}
        }

def format_interaction_response(interaction_data: Dict) -> Dict:
    """
    Format the interaction data for API response.
    
    Args:
        interaction_data (Dict): Raw interaction data
        
    Returns:
        Dict: Formatted response
    """
    if not interaction_data.get("success"):
        return {
            "error": interaction_data.get("message", "Unknown error occurred"),
            "interactions": []
        }
    
    interactions = []
    primary_drug = interaction_data.get("primary_drug", "")
    
    for drug, interaction_sentences in interaction_data.get("interactions", {}).items():
        if interaction_sentences:
            interactions.append({
                "drug": drug,
                "interactions": interaction_sentences,
                "has_interactions": True
            })
        else:
            interactions.append({
                "drug": drug,
                "interactions": [],
                "has_interactions": False,
                "message": f"No interactions found between {primary_drug} and {drug}"
            })
    
    return {
        "primary_drug": primary_drug,
        "interactions": interactions,
        "summary": {
            "total_drugs_checked": interaction_data.get("total_drugs_checked", 0),
            "drugs_with_interactions": interaction_data.get("drugs_with_interactions", 0)
        }
    } 