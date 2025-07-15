from paddleocr import PaddleOCR # type: ignore

ocr_model = PaddleOCR(use_gpu=False, lang='en') # Initialize OCR model globally