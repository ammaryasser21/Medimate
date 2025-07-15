import sys
import os
from pathlib import Path

# Fix Python path when running this file directly
if __name__ == "__main__":
    # Add the parent directory to Python path
    current_file = Path(__file__)
    parent_dir = current_file.parent.parent
    sys.path.insert(0, str(parent_dir))

from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from app.ocr.medical_test_ocr import extract_medical_tests, extract_text_medical_test # type: ignore
from app.ocr.prescription_ocr import extract_prescriptions, extract_text_prescription # type: ignore
from app.medicines.medicines_db import get_medicines_data # type: ignore
from app.medicines.drug_interactions import get_drug_interactions, format_interaction_response # type: ignore
from app.chatbot.chatbot import chat # type: ignore
from app.models.medical_models import MedicalResponse # type: ignore # Import MedicalResponse model
from huggingface_hub import login # type: ignore
from app.config import HUGGINGFACE_TOKEN # type: ignore

if HUGGINGFACE_TOKEN:
    login(token=HUGGINGFACE_TOKEN)
else:
    print("Warning: HUGGINGFACE_TOKEN is missing from .env file. Medicine database and chatbot features might be limited.")


app = Flask(__name__)
CORS(app)

@app.route("/extract-medical-tests", methods=["POST"])
def extract_medical_tests_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Invalid file"}), 400

    file_bytes = file.read()
    file_type = file.content_type
    if file_type not in ["application/pdf", "image/jpeg", "image/png"]:
        return jsonify({"error": "Unsupported file format"}), 400

    extracted_text = extract_text_medical_test(file_bytes, file_type) # Use medical test specific extraction
    test_results = extract_medical_tests(extracted_text)
    return jsonify({"medical_tests": test_results})

@app.route("/extract-prescriptions", methods=["POST"])
def extract_prescriptions_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Invalid file"}), 400

    file_bytes = file.read()
    file_type = file.content_type
    if file_type not in ["application/pdf", "image/jpeg", "image/png"]:
        return jsonify({"error": "Unsupported file format"}), 400

    extracted_text = extract_text_prescription(file_bytes, file_type) # Use prescription specific extraction
    prescription_details_raw = extract_prescriptions(extracted_text)

    if "error" in prescription_details_raw:
        return jsonify({"prescriptions": prescription_details_raw}), 200
    elif isinstance(prescription_details_raw, list):
        if not prescription_details_raw:
            return jsonify({"error": "No medicines detected in the prescription."}), 400
        else:
            return jsonify({"prescriptions": prescription_details_raw}), 200
    elif isinstance(prescription_details_raw, dict):
        if "prescriptions" in prescription_details_raw and isinstance(prescription_details_raw["prescriptions"], list) and not prescription_details_raw["prescriptions"]:
            return jsonify({"error": "No medicines detected in the prescription."}), 400
        else:
            return jsonify({"prescriptions": prescription_details_raw.get("prescriptions", [])}), 200
    else:
        return jsonify({"prescriptions": {"error": "Unexpected response format from prescription extraction."}}), 500


@app.route('/medicines', methods=['GET'])
def get_medicines_endpoint():
    medicines_response = get_medicines_data()
    return jsonify(medicines_response)

@app.route('/drug-interactions', methods=['POST'])
def drug_interactions_endpoint():
    """
    Check drug interactions between a primary drug and a list of related drugs.
    
    Expected JSON payload:
    {
        "primary_drug": "Simvastatin",
        "related_drugs": ["Clarithromycin", "Warfarin", "Aspirin"]
    }
    """
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    primary_drug = data.get("primary_drug", "").strip()
    related_drugs = data.get("related_drugs", [])
    
    if not primary_drug:
        return jsonify({"error": "primary_drug is required"}), 400
    
    if not related_drugs or not isinstance(related_drugs, list):
        return jsonify({"error": "related_drugs must be a non-empty list"}), 400
    
    # Filter out empty drug names
    related_drugs = [drug.strip() for drug in related_drugs if drug.strip()]
    
    if not related_drugs:
        return jsonify({"error": "At least one valid related_drug is required"}), 400
    
    # Get drug interactions
    interaction_data = get_drug_interactions(primary_drug, related_drugs)
    formatted_response = format_interaction_response(interaction_data)
    
    return jsonify(formatted_response)

@app.route("/chat", methods=["POST"])
def chat_endpoint():
    data = request.json
    prompt = data.get("message", "").strip()
    chat_history = data.get("chat_history", []) # Get chat history from request
    if not prompt:
        return jsonify({"error": "Message is required"}), 400

    chat_response = chat(prompt, chat_history) # Pass chat_history to chat function

    if isinstance(chat_response, MedicalResponse):
        return jsonify(chat_response.dict())
    else:
        return jsonify(chat_response), 500


if __name__ == "__main__":
    app.run(debug=True)