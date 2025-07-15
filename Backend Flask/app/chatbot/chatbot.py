import re
import json
import logging
import unicodedata
from typing import Tuple, Dict, Any, Union, List
from app.utils.gemini_utils import get_gemini_model
from app.models.medical_models import MedicalResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache model instance (reduces unnecessary calls)
gemini_model = get_gemini_model()


def clean_response_text(response_text: str) -> str:
    """Clean AI response by removing JSON markers and control characters."""
    cleaned_text = re.sub(r"```(?:json)?\n?|```", "", response_text).strip()
    cleaned_text = ''.join(char for char in cleaned_text if not unicodedata.category(char).startswith('C'))
    return ' '.join(cleaned_text.split())


def generate_ai_response(prompt: str) -> Dict[str, Any]:
    """Generate AI response and return parsed JSON."""
    try:
        response = gemini_model.generate_content(prompt)
        cleaned_text = clean_response_text(response.text)
        if cleaned_text.lower() in ["yes", "no"]:
            return {"message": cleaned_text}
        if cleaned_text.startswith("{") and cleaned_text.endswith("}"):
            return json.loads(cleaned_text)
        logger.error(f"Unexpected AI response format: {cleaned_text}")
        return {}

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}. Raw text: {response.text}")
        return {}
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        return {}



def detect_language_and_dialect(text: str) -> Tuple[str, str]:
    """Detect language and dialect of a given text."""
    prompt = f"""
    Identify the language and dialect of the following text.
    Provide the response in JSON format:
    {{"language": "Language Name", "dialect": "Dialect Name"}}

    Text: "{text}"
    """
    lang_data = generate_ai_response(prompt)
    return lang_data.get("language", "Unknown"), lang_data.get("dialect", "Unknown")


def is_medical_question(prompt: str) -> bool:
    """Check if a user input is related to medical topics."""
    prompt = f"""
    You are an AI medical assistant. Determine if the following user input is related to a medical condition, symptoms, treatment, or diagnosis.
    Answer ONLY "yes" or "no".

    User Input: "{prompt}"
    """
    response = generate_ai_response(prompt)
    return response.get("message", "").strip().lower() == "yes"


def is_medical_context(chat_history: List[Dict[str, str]], user_message: str) -> bool:
    """Determine if the conversation context is medical based on chat history and the current message."""
    if not chat_history:
        return is_medical_question(user_message)

    # Check last few messages to see if the discussion has been medical
    recent_history = "\n".join(f"{msg['type'].upper()}: {msg['content']}" for msg in chat_history[-5:])
    
    prompt = f"""
    You are a medical AI. Determine if the **overall conversation context** (including past messages) is medical. Consider the previous messages and the user's latest input.

    **Conversation History (Last {len(chat_history)} Messages):**
    {recent_history}

    **Current User Message:**
    "{user_message}"

    Answer ONLY "yes" or "no".
    """
    response = generate_ai_response(prompt)
    return response.get("message", "").strip().lower() == "yes"


def generate_friendly_response(user_message: str, language: str, dialect: str) -> str:
    """Generate a friendly response for non-medical queries."""
    prompt = f"""
    You are a friendly assistant specializing in medical topics. When a user asks a non-medical question, respond in a single line, warmly and politely in their dialect, guiding them towards asking medical questions instead.

    Response format:
    {{"message": "Your unique, one-line friendly response here"}}

    User Language: {language}
    User Dialect: {dialect}

    User Message: "{user_message}"
    """
    response_data = generate_ai_response(prompt)
    return response_data.get("message", "I apologize, but I couldn't generate a proper response. Can you please ask a medical question?")


def handle_chat_message(prompt: str, language: str, dialect: str, chat_history: List[Dict[str, str]] = None) -> Union[MedicalResponse, Dict[str, str]]:
    """Handle chat messages with context-aware AI response generation."""
    chat_history = chat_history[-5:] if chat_history else []  # Keep only last 5 messages for efficiency
    formatted_history = "\n".join(f"{msg['type'].upper()}: {msg['content']}" for msg in chat_history)

    structured_prompt = f"""
    You are a friendly and helpful AI assistant specializing in medical topics. Respond to the user's health-related question in a concise, reassuring, and empathetic manner, considering the conversation history.

    **Conversation History (Last {len(chat_history)} Turns):**
    {formatted_history}

    **Current User Question:**
    "{prompt}"

    Your response should:
    - Explain the potential causes briefly.
    - Suggest next steps or actions the user can take.
    - Be warm and professional, using the "{language}" language and "{dialect}" dialect.
    - If the condition is mild, suggest home remedies or OTC (over-the-counter) medications.
    - If the condition is severe, advise seeking medical attention.

    ### Response Format:
    {{"message": "A concise, empathetic response explaining possible causes and next steps."}}
    """

    response_data = generate_ai_response(structured_prompt)

    if "message" in response_data:
        return MedicalResponse(is_medical=True, message=response_data["message"])
    else:
        logger.error(f"Unexpected AI response format: {response_data}")
        return {"error": "Unexpected AI response format", "raw_response": response_data}


def chat(user_message: str, chat_history: List[Dict[str, str]] = None) -> Union[MedicalResponse, Dict[str, str]]:
    """Main chat function to process user messages and generate responses."""
    language, dialect = detect_language_and_dialect(user_message)

    if is_medical_context(chat_history, user_message):
        return handle_chat_message(user_message, language, dialect, chat_history)
    else:
        return MedicalResponse(is_medical=False, message=generate_friendly_response(user_message, language, dialect))
