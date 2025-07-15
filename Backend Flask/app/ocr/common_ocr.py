import cv2  # type: ignore
import numpy as np
import io
import json
import re
from PIL import Image
from app.utils.ocr_utils import ocr_model  # type: ignore  # Import OCR model

def safe_json_parse(text):
    """Safely extracts and parses JSON from a string."""
    json_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if not json_match:
        return {"error": "No JSON structure found in AI response"}
    
    json_str = json_match.group(1).strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON"}

def preprocess_image(image_bytes):
    """Preprocesses an image for better OCR accuracy."""
    img = np.array(Image.open(io.BytesIO(image_bytes)).convert("L"))

    # Preserve aspect ratio while resizing
    h, w = img.shape
    scale_factor = 1024 / max(h, w)
    new_size = (int(w * scale_factor), int(h * scale_factor))
    img = cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)

    # Denoising
    img = cv2.fastNlMeansDenoising(img, h=20)

    # CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    img = clahe.apply(img)

    # Gaussian Blur
    img = cv2.GaussianBlur(img, (5, 5), 0)

    # Adaptive Thresholding
    img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 15, 3)

    # Deskewing
    img = deskew_image(img)

    # Morphological Transformations
    kernel = np.ones((1, 1), np.uint8)
    img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)

    # Sharpening
    kernel_sharpening = np.array([[-1, -1, -1], 
                                  [-1,  9, -1],
                                  [-1, -1, -1]])
    img = cv2.filter2D(img, -1, kernel_sharpening)

    _, processed_bytes = cv2.imencode(".png", img)
    return processed_bytes.tobytes()

def deskew_image(img):
    """Corrects the skew of an image using Hough Line Transform."""
    edges = cv2.Canny(img, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)

    angle = 0
    if lines is not None:
        angles = []
        for rho, theta in lines[:, 0]:
            angle_deg = np.degrees(theta) - 90
            angles.append(angle_deg)
        angle = np.median(angles)

    (h, w) = img.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return img

def paddleocr_ocr(image_bytes):
    """Runs OCR using PaddleOCR and extracts text."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(image)
    
    try:
        result = ocr_model.ocr(img_np, cls=True)
        extracted_text = " ".join(
            text_info[1][0] for line in result for text_info in line if len(text_info) >= 2
        )
        return extracted_text.strip()
    except Exception as e:
        print(f"PaddleOCR Error: {e}")
        return ""

def extract_text_from_image(file_bytes):
    """Processes an image and extracts text using OCR."""
    processed_img = preprocess_image(file_bytes)
    extracted_text = paddleocr_ocr(processed_img)
    print("OCR Extracted Text:", extracted_text)
    return extracted_text
