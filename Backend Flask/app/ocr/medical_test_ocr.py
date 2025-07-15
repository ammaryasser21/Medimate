from pdf2image import convert_from_bytes # type: ignore
import io
import re
import datetime
from app.ocr.common_ocr import preprocess_image, paddleocr_ocr, safe_json_parse, extract_text_from_image # type: ignore # Import common OCR functions
from app.utils.gemini_utils import get_gemini_model # type: ignore
from app.models.medical_models import MedicalTestResult, NormalRange # type: ignore # Import Pydantic models


def extract_text_medical_test(file_bytes, file_type): # Specialized text extraction for medical tests
    extracted_text = ""
    if file_type == "application/pdf":
        images = convert_from_bytes(file_bytes)
        for img in images:
            img_bytes = io.BytesIO()
            img.save(img_bytes, format="PNG")
            processed_img = preprocess_image(img_bytes.getvalue())
            text = paddleocr_ocr(processed_img)
            print("OCR Extracted Text (PDF Page - Medical Test):")
            print(text)
            extracted_text += text + "\n"
    else:
        extracted_text = extract_text_from_image(file_bytes) # Use common image extraction
        print("OCR Extracted Text (Image - Medical Test):")
        print(extracted_text)
    return extracted_text.strip()


def infer_category(test_name: str) -> str:
    test_name_lower = test_name.lower()
    if any(keyword in test_name_lower for keyword in ["wbc differential", "neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil", "band %"]):
        return "WBC Differential"
    elif any(keyword in test_name_lower for keyword in ["hemoglobin", "hgb", "rbc", "erythrocytes", "hct", "hematocrit", "mcv", "mch", "mchc", "rdw-cv"]):
        return "Hematology"
    elif any(keyword in test_name_lower for keyword in ["plt", "platelet"]):
        return "Platelets"
    elif any(keyword in test_name_lower for keyword in ["leukocytes", "wbc"]):
        return "WBC"
    elif any(keyword in test_name_lower for keyword in ["glucose", "sugar", "insulin"]):
        return "Diabetes"
    elif any(keyword in test_name_lower for keyword in ["cholesterol", "ldl", "hdl", "triglycerides"]):
        return "Lipid Profile"
    elif any(keyword in test_name_lower for keyword in ["creatinine", "bun", "urea"]):
        return "Renal Function"
    elif any(keyword in test_name_lower for keyword in ["liver", "alt", "ast", "bilirubin"]):
        return "Liver Function"
    else:
        return "General Test"

def infer_critical_and_trend(result: MedicalTestResult) -> MedicalTestResult:
    if isinstance(result.value, (int, float)) and result.normalRange.min is not None and result.normalRange.max is not None:
        if result.value < result.normalRange.min or result.value > result.normalRange.max:
            result.critical = True
        else:
            result.critical = False

    # Example of trend analysis (requires historical data)
    # Assuming `result.previousValues` is a list of previous test values
    if hasattr(result, 'previousValues') and result.previousValues:
        if len(result.previousValues) >= 2:
            trend = result.value - result.previousValues[-1]
            if trend > 0:
                result.trend = "Increasing"
            elif trend < 0:
                result.trend = "Decreasing"
            else:
                result.trend = "Stable"
    else:
        result.trend = "No trend data"
    return result


def generate_interpretation_from_gemini(test_result: MedicalTestResult) -> str:
    model = get_gemini_model()
    # ... (generate_interpretation_from_gemini function from original code) ...
    if isinstance(test_result.value, (int, float)):
        value_str = str(test_result.value)
    else:
        value_str = str(test_result.value) if test_result.value else "Value not provided"

    normal_range_str = f"{test_result.normalRange.min}-{test_result.normalRange.max} {test_result.unit}" if test_result.normalRange.min is not None and test_result.normalRange.max is not None else "Normal range not provided"

    prompt = f"""
    Interpret the following medical test result in a user-friendly way and provide brief advice.

    Test Name: {test_result.name}
    Category: {test_result.category}
    Result Value: {value_str} {test_result.unit}
    Normal Range: {normal_range_str}
    Critical Result: {'Yes' if test_result.critical else 'No'}

    Focus on making the interpretation easy to understand for someone without medical background.
    Provide advice on what the result might mean in simple terms and suggest general next steps, like 'consult your doctor if concerned' or 'maintain a healthy lifestyle'.
    Keep the interpretation concise, about 2-3 sentences maximum.

    Response should be just the interpretation text, no extra formatting.
    """

    try:
        response = model.generate_content(prompt)
        interpretation_text = response.text.strip()
        return interpretation_text
    except Exception as e:
        print(f"Error generating interpretation from Gemini: {e}")
        return "Could not generate interpretation at this time."


def extract_medical_tests(text):
    model = get_gemini_model()
    prompt = f"""
    Extract structured medical test results from the following text.
    Return the results as a JSON array of objects, where each object represents a medical test with the following format:
    {{
      "name": "Test Name",
      "value": "Test Result Value",
      "unit": "Unit of Measurement",
      "normalRange": {{
        "min": "Minimum Normal Value",
        "max": "Maximum Normal Value"
      }}
    }}
    For tests that are percentages (like 'Basophil %', 'Lymphocyte %', etc.), ensure the normalRange is always between 0 and 100.
    If a normal range is given as a single value with a comparator (e.g., "<14.5", ">15.0"), represent min or max as null accordingly.
    If no medical tests are found, return an empty JSON array.

    Text:
    {text}
    """
    response = model.generate_content(prompt)

    print("Gemini API Response (Medical Tests - Array Format):")
    print(response.text)

    raw_json = safe_json_parse(response.text)

    if "error" in raw_json:
        return []

    test_results_list = []
    if isinstance(raw_json, dict):
        for test_name, test_data in raw_json.items():
            normal_range_str = test_data.get("normal_range", None)
            normal_range = parse_normal_range(normal_range_str)

            test_result = MedicalTestResult(
                name=test_name,
                value=test_data.get("result", None),
                unit=test_data.get("unit", None),
                normalRange=normal_range
            )
            test_results_list.append(test_result)

    elif isinstance(raw_json, list):
        for item in raw_json:
            normal_range_str = item.get("normalRange", None)
            if not normal_range_str:
                normal_range_str = item.get("normal_range", None)

            normal_range = parse_normal_range(normal_range_str)

            test_result = MedicalTestResult(
                name=item.get("name"),
                value=item.get("value"),
                unit=item.get("unit"),
                normalRange=normal_range
            )
            test_results_list.append(test_result)
    else:
        return []

    results_with_metadata = []
    for result_dict in [result.dict() for result in test_results_list]:
        test_result_obj = MedicalTestResult(**result_dict)
        test_result_obj.category = infer_category(test_result_obj.name)

        is_percentage_test = False
        if "%" in test_result_obj.name or (isinstance(test_result_obj.value, str) and "%" in test_result_obj.value):
            is_percentage_test = True

        if is_percentage_test:
            test_result_obj.normalRange.min = 0.0
            test_result_obj.normalRange.max = 100.0
            test_result_obj.name = re.sub(r'%', '', test_result_obj.name).strip()
            if isinstance(test_result_obj.value, str):
                 test_result_obj.value = re.sub(r'%', '', test_result_obj.value).strip()


        test_result_obj = infer_critical_and_trend(test_result_obj)
        test_result_obj.interpretation = generate_interpretation_from_gemini(test_result_obj)
        test_result_obj.lastUpdated = datetime.datetime.now().isoformat()
        results_with_metadata.append(test_result_obj.dict())

    return results_with_metadata


def parse_normal_range(normal_range_str):
    normal_range = NormalRange()
    # ... (parse_normal_range function from original code) ...
    if normal_range_str:
        if isinstance(normal_range_str, dict):
            normal_range.min = normal_range_str.get("min")
            normal_range.max = normal_range_str.get("max")
        elif isinstance(normal_range_str, str):
            range_parts = re.split(r'[-<>]', normal_range_str)
            range_parts = [part.strip() for part in range_parts if part.strip()]

            comparator = re.search(r'([<>])', normal_range_str)

            if len(range_parts) == 2:
                try:
                    normal_range.min = float(range_parts[0])
                    normal_range.max = float(range_parts[1])
                except ValueError:
                    pass
            elif len(range_parts) == 1 and comparator:
                try:
                    value = float(range_parts[0])
                    if comparator.group(1) == '<':
                        normal_range.max = value
                    elif comparator.group(1) == '>':
                        normal_range.min = value
                except ValueError:
                    pass

    return normal_range