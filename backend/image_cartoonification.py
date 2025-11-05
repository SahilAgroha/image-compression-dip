import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import io
import base64

class ImageCartoonification:
    def __init__(self):
        """Initialize Image Cartoonification module"""
        pass
    
    def classic_cartoon(self, image_array, intensity=5, color_levels=8):
        """Apply classic cartoon effect"""
        # Step 1: Bilateral filter for smoothing
        bilateral = cv2.bilateralFilter(image_array, intensity*2, 80, 80)
        
        # Step 2: Create edge mask
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        gray_blur = cv2.medianBlur(gray, 5)
        edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
        
        # Step 3: Color quantization
        data = np.float32(bilateral).reshape((-1, 3))
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, color_levels, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        centers = np.uint8(centers)
        quantized_data = centers[labels.flatten()]
        quantized_image = quantized_data.reshape(bilateral.shape)
        
        # Step 4: Combine with edges
        edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
        cartoon = cv2.bitwise_and(quantized_image, edges)
        
        return cartoon
    
    def anime_style(self, image_array, intensity=5):
        """Apply anime/manga style effect"""
        # Enhance saturation
        pil_image = Image.fromarray(image_array)
        enhancer = ImageEnhance.Color(pil_image)
        enhanced = enhancer.enhance(1.5)
        
        # Convert back to numpy
        enhanced_array = np.array(enhanced)
        
        # Apply bilateral filter
        bilateral = cv2.bilateralFilter(enhanced_array, intensity*3, 100, 100)
        
        # Create smooth color regions
        data = np.float32(bilateral).reshape((-1, 3))
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, 6, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        centers = np.uint8(centers)
        quantized_data = centers[labels.flatten()]
        anime_image = quantized_data.reshape(bilateral.shape)
        
        return anime_image
    
    def sketch_effect(self, image_array):
        """Convert to pencil sketch"""
        # Convert to grayscale
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Create inverted grayscale
        gray_inv = 255 - gray
        
        # Apply Gaussian blur
        gray_inv_blur = cv2.GaussianBlur(gray_inv, (21, 21), 0)
        
        # Create sketch using color dodge
        sketch = cv2.divide(gray, 255 - gray_inv_blur, scale=256)
        
        # Convert back to RGB
        sketch_rgb = cv2.cvtColor(sketch, cv2.COLOR_GRAY2RGB)
        
        return sketch_rgb
    
    def watercolor_effect(self, image_array, intensity=5):
        """Apply watercolor painting effect"""
        # Apply multiple bilateral filters for smoothing
        smooth = image_array.copy()
        for _ in range(3):
            smooth = cv2.bilateralFilter(smooth, 9, 200, 200)
        
        # Reduce colors
        data = np.float32(smooth).reshape((-1, 3))
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, 12, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        centers = np.uint8(centers)
        quantized_data = centers[labels.flatten()]
        watercolor = quantized_data.reshape(smooth.shape)
        
        # Add texture
        texture_noise = np.random.randint(0, 25, watercolor.shape, dtype=np.uint8)
        watercolor = cv2.add(watercolor, texture_noise)
        
        return watercolor
    
    def comic_book_effect(self, image_array, color_levels=4):
        """Apply comic book style"""
        # Strong bilateral filter
        bilateral = cv2.bilateralFilter(image_array, 15, 100, 100)
        
        # Aggressive color quantization
        data = np.float32(bilateral).reshape((-1, 3))
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, color_levels, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        centers = np.uint8(centers)
        quantized_data = centers[labels.flatten()]
        quantized = quantized_data.reshape(bilateral.shape)
        
        # Create strong edges
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 7, 7)
        edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
        
        # Combine
        comic = cv2.bitwise_and(quantized, edges)
        
        return comic
    
    def oil_painting_effect(self, image_array, intensity=7):
        """Apply oil painting effect"""
        # OpenCV's oil painting filter
        oil_painting = cv2.xphoto.oilPainting(image_array, intensity, 1)
        
        return oil_painting
    
    def pop_art_effect(self, image_array):
        """Apply pop art style"""
        # High contrast
        pil_image = Image.fromarray(image_array)
        enhancer = ImageEnhance.Contrast(pil_image)
        high_contrast = enhancer.enhance(2.0)
        
        # Convert back and posterize
        posterized = np.array(high_contrast)
        posterized = (posterized // 64) * 64
        
        # Boost saturation
        pil_posterized = Image.fromarray(posterized)
        sat_enhancer = ImageEnhance.Color(pil_posterized)
        pop_art = sat_enhancer.enhance(2.5)
        
        return np.array(pop_art)
    
    def apply_cartoon_effect(self, image_array, style='classic', intensity=5, color_levels=8):
        """Apply specified cartoon effect"""
        print(f"Applying {style} cartoon effect...")
        
        if style == 'classic':
            return self.classic_cartoon(image_array, intensity, color_levels)
        elif style == 'anime':
            return self.anime_style(image_array, intensity)
        elif style == 'sketch':
            return self.sketch_effect(image_array)
        elif style == 'watercolor':
            return self.watercolor_effect(image_array, intensity)
        elif style == 'comic':
            return self.comic_book_effect(image_array, color_levels)
        elif style == 'oil_painting':
            try:
                return self.oil_painting_effect(image_array, intensity)
            except:
                # Fallback if xphoto not available
                return self.classic_cartoon(image_array, intensity, color_levels)
        elif style == 'pop_art':
            return self.pop_art_effect(image_array)
        else:
            return self.classic_cartoon(image_array, intensity, color_levels)
