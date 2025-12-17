import pytesseract
from PIL import Image as PILImage
import cv2
import numpy as np
import os
from config import config
from utils.helpers import clean_text

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = config.TESSERACT_PATH

class OCRService:
    @staticmethod
    def perform_ocr(image_path, language='sqi'):
        """
        Perform OCR on image file
        Args:
            image_path: Path to image file
            language: Language code (sqi=Albanian, eng=English)
        Returns:
            dict: {'text': extracted_text, 'confidence': confidence_score}
        """
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Cannot read image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply preprocessing for better OCR
            # 1. Denoising
            denoised = cv2.fastNlMeansDenoising(gray, h=10)
            
            # 2. Thresholding (Otsu's method)
            _, thresholded = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # 3. Dilation to make text more prominent
            kernel = np.ones((1, 1), np.uint8)
            dilated = cv2.dilate(thresholded, kernel, iterations=1)
            
            # Convert to PIL Image for Tesseract
            pil_image = PILImage.fromarray(dilated)
            
            # Configure Tesseract parameters
            custom_config = f'--oem 3 --psm 6 -l {language}'
            
            # Perform OCR with detailed data
            ocr_data = pytesseract.image_to_data(
                pil_image, 
                config=custom_config, 
                output_type=pytesseract.Output.DICT
            )
            
            # Extract text and calculate confidence
            extracted_text = pytesseract.image_to_string(pil_image, config=custom_config)
            extracted_text = clean_text(extracted_text)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'success': True,
                'text': extracted_text,
                'confidence': round(avg_confidence, 2),
                'language': language,
                'word_count': len(extracted_text.split())
            }
            
        except Exception as e:
            print(f"OCR Error: {e}")
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'confidence': 0
            }
    
    @staticmethod
    def process_from_url(url, language='sqi'):
        """
        Download image from URL and perform OCR
        """
        try:
            import requests
            from io import BytesIO
            
            # Download image
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Open image
            image = PILImage.open(BytesIO(response.content))
            
            # Save temporarily
            temp_path = os.path.join(config.UPLOAD_FOLDER, 'temp_ocr.jpg')
            image.save(temp_path)
            
            # Perform OCR
            result = OCRService.perform_ocr(temp_path, language)
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }