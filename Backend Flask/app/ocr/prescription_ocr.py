from pdf2image import convert_from_bytes # type: ignore
import io
import logging
from typing import List, Dict, Any
from app.ocr.common_ocr import preprocess_image, paddleocr_ocr, safe_json_parse # type: ignore
from app.utils.gemini_utils import get_gemini_model # type: ignore

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_prescription(file_bytes: bytes, file_type: str) -> str:
    """
    Extract text from a prescription file (PDF or image).

    Args:
        file_bytes (bytes): The file content in bytes.
        file_type (str): The MIME type of the file.

    Returns:
        str: The extracted text from the prescription.
    """
    extracted_text = ""
    try:
        if file_type == "application/pdf":
            images = convert_from_bytes(file_bytes)
            for img in images:
                with io.BytesIO() as img_bytes:
                    img.save(img_bytes, format="PNG")
                    processed_img = preprocess_image(img_bytes.getvalue())
                    text = paddleocr_ocr(processed_img)
                    logger.info("OCR Extracted Text (PDF Page - Prescription):\n%s", text)
                    extracted_text += text + "\n"
        else:
            processed_img = preprocess_image(file_bytes)
            extracted_text = paddleocr_ocr(processed_img)
            logger.info("OCR Extracted Text (Image - Prescription):\n%s", extracted_text)
    except Exception as e:
        logger.error("Error during text extraction: %s", str(e))
        return ""
    return extracted_text.strip()

def extract_prescriptions(text: str) -> List[Dict[str, Any]]:
    """
    Extract structured prescription data from the given text.

    Args:
        text (str): The text containing prescription information.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries containing structured prescription data.
    """
    model = get_gemini_model()
    prompt = f"""
    Extract structured prescription data from the following text.
    For any missing information like category, time of day, whether to take with food or water, and duration, use your knowledge to infer these details based on the medication name. If inference is not possible, leave the field as null.
    If no prescription information can be reliably extracted due to illegible text or lack of prescription details, return an empty JSON array `[]`.
    Otherwise, return the extracted prescriptions as a JSON array of objects. Each object should represent a single medication and include the following fields:

    - id: A unique identifier for each prescription (integer, start from 1 and increment)
    - name: The name of the medication (string)
    - confidence: A confidence score (0.0 to 1.0) indicating the certainty of the extracted medication name.
    - possibleMatches:  A list of possible full medication names if the extracted name is ambiguous or short (array of strings)
    - dosage: The dosage of the medication (string, e.g., "500mg", "1 tablet")
    - frequency: How often the medication should be taken (string, e.g., "twice daily", "every 8 hours")
    - duration: How long the medication should be taken (string, e.g., "7 days", "2 weeks") - infer if possible
    - instructions:  Any special instructions for taking the medication (string or array of strings)
    - warnings: Any warnings or precautions related to the medication (string or array of strings)
    - category: Category of the medicine (string, e.g., "Antibiotic", "Pain Reliever") - infer if possible
    - timeOfDay:  Suggested time of day to take the medication (string, e.g., "morning", "night", "with meals") - infer if possible
    - withFood: Boolean, true if medication should be taken with food, false otherwise - infer if possible
    - withWater: Boolean, true if medication should be taken with water, false otherwise - infer if possible

    Example of JSON output for multiple prescriptions:
    [
        {{
            "id": 1,
            "name": "Amoxicillin",
            "confidence": 0.95,
            "possibleMatches": ["Amoxicillin 500mg", "Amoxicillin oral suspension"],
            "dosage": "500mg",
            "frequency": "twice daily",
            "duration": "7 days",
            "instructions": ["Take with food", "Complete full course"],
            "warnings": ["May cause drowsiness"],
            "category": "Antibiotic",
            "timeOfDay": "multiple",
            "withFood": true,
            "withWater": true
        }},
        {{
            "id": 2,
            "name": "Paracetamol",
            "confidence": 0.88,
            "possibleMatches": ["Paracetamol 500mg", "Acetaminophen"],
            "dosage": "500mg",
            "frequency": "as needed",
            "duration": null,
            "instructions": ["Take for pain or fever"],
            "warnings": [],
            "category": "Pain Reliever",
            "timeOfDay": null,
            "withFood": false,
            "withWater": true
        }}
    ]

    If absolutely no prescription information can be found, return an empty JSON array: `[]`

    Text:
    {text}
    """
    try:
        response = model.generate_content(prompt)
        return safe_json_parse(response.text)
    except Exception as e:
        logger.error("Error during prescription extraction: %s", str(e))
        return []