# Medical App

A comprehensive Flask-based application for extracting medical test results and prescriptions from images or PDFs, checking drug interactions, retrieving medicine data, and providing a medical chatbot interface. Designed for healthcare, pharmacy, and research use cases.

---

## Table of Contents
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Modules Overview](#modules-overview)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Medical Test Extraction**: Upload medical test reports (PDF/JPG/PNG) and extract structured test results using OCR and NLP.
- **Prescription Extraction**: Upload prescription images or PDFs to extract prescribed medicines and dosages.
- **Medicine Database**: Retrieve information about available medicines from a curated database.
- **Drug Interaction Checker**: Check for interactions between a primary drug and related drugs, with detailed interaction descriptions.
- **Medical Chatbot**: Ask medical questions and get AI-powered responses, with chat history support.

---

## Folder Structure
```text
medical_app/
│
├── app/
│   ├── main.py                # Main Flask app and API endpoints
│   ├── config.py              # Configuration (e.g., HuggingFace token)
│   ├── medicines/
│   │   ├── drug_interactions.py   # Drug interaction logic and data
│   │   └── medicines_db.py        # Medicine database and retrieval
│   ├── chatbot/
│   │   └── chatbot.py             # Chatbot logic and integration
│   ├── models/
│   │   └── medical_models.py      # Pydantic models for API responses
│   ├── ocr/
│   │   ├── medical_test_ocr.py    # OCR and extraction for medical tests
│   │   ├── prescription_ocr.py    # OCR and extraction for prescriptions
│   │   └── common_ocr.py          # Shared OCR utilities
│   └── utils/
│       ├── gemini_utils.py        # Utility functions for Gemini API
│       └── ocr_utils.py           # Utility functions for OCR
│
├── run.py                     # Entry point to start the Flask server
├── requirements.txt           # Python dependencies
├── generate_docx.py           # (Optional) Document generation script
└── project_documentation.docx # Project documentation (Word)
```

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd medical_app
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv .venv
   # On Unix/macOS:
   source .venv/bin/activate
   # On Windows:
   .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   - Create a `.env` file in the `app/` directory.
   - Add your HuggingFace token:
     ```
     HUGGINGFACE_TOKEN=your_token_here
     ```

---

## Usage

Start the Flask server:

```bash
python run.py
```

The API will be available at `http://localhost:5000/`.

---

## API Endpoints

### 1. Extract Medical Tests
- **Endpoint:** `POST /extract-medical-tests`
- **Description:** Upload a PDF or image to extract medical test results.
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body: `file` (PDF, JPG, or PNG)
- **Response Example:**
  ```json
  {
    "medical_tests": [
      {"test": "Hemoglobin", "value": "13.5", "unit": "g/dL"},
      {"test": "WBC", "value": "6.2", "unit": "x10^3/uL"}
    ]
  }
  ```

### 2. Extract Prescriptions
- **Endpoint:** `POST /extract-prescriptions`
- **Description:** Upload a PDF or image to extract prescription details.
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body: `file` (PDF, JPG, or PNG)
- **Response Example:**
  ```json
  {
    "prescriptions": [
      {"medicine": "Paracetamol", "dosage": "500mg", "frequency": "2x daily"}
    ]
  }
  ```

### 3. Get Medicines
- **Endpoint:** `GET /medicines`
- **Description:** Retrieve the list of medicines from the database.
- **Response Example:**
  ```json
  {
    "medicines": [
      {"name": "Aspirin", "description": "Pain reliever and anti-inflammatory"},
      {"name": "Simvastatin", "description": "Cholesterol-lowering medication"}
    ]
  }
  ```

### 4. Drug Interactions
- **Endpoint:** `POST /drug-interactions`
- **Description:** Check for drug interactions between a primary drug and related drugs.
- **Request:**
  - Content-Type: `application/json`
  - Body Example:
    ```json
    {
      "primary_drug": "Simvastatin",
      "related_drugs": ["Clarithromycin", "Warfarin"]
    }
    ```
- **Response Example:**
  ```json
  {
    "interactions": [
      {
        "primary": "Simvastatin",
        "related": "Clarithromycin",
        "severity": "major",
        "description": "Increased risk of muscle toxicity."
      }
    ]
  }
  ```

### 5. Medical Chatbot
- **Endpoint:** `POST /chat`
- **Description:** Ask a medical question and receive an AI-powered response.
- **Request:**
  - Content-Type: `application/json`
  - Body Example:
    ```json
    {
      "message": "What are the side effects of aspirin?",
      "chat_history": []
    }
    ```
- **Response Example:**
  ```json
  {
    "response": "Common side effects of aspirin include upset stomach, heartburn, drowsiness, and mild headache."
  }
  ```

---

## Modules Overview

- **app/main.py**: Defines all API endpoints and integrates the core modules.
- **app/medicines/**: Handles medicine data and drug interaction logic.
- **app/chatbot/**: Implements the chatbot using AI/LLM models.
- **app/models/**: Contains Pydantic models for structured API responses.
- **app/ocr/**: Contains OCR and NLP logic for extracting data from medical documents.
- **app/utils/**: Utility functions for OCR and external API integrations.
- **app/config.py**: Loads configuration and environment variables.

---

## Dependencies

Main libraries used (see `requirements.txt` for full list):
- Flask
- Flask-CORS
- google-generativeai
- opencv-python
- Pillow
- pdf2image
- datasets
- huggingface_hub
- paddleocr
- pydantic
- requests

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[Specify your license here, e.g., MIT] 