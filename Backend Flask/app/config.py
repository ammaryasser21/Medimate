import os
from dotenv import load_dotenv # type: ignore

load_dotenv()

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
MY_MODEL_NAME = "gemini-1.5-flash" # Define model name here

if not GENAI_API_KEY:
    raise ValueError("GEMAI_API_KEY is missing from environment variables")