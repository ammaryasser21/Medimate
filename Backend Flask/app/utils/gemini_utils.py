import google.generativeai as genai # type: ignore
from app.config import GENAI_API_KEY, MY_MODEL_NAME # type: ignore

genai.configure(api_key=GENAI_API_KEY)
gemini_model_name = MY_MODEL_NAME

def get_gemini_model():
    return genai.GenerativeModel(gemini_model_name)