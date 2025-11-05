import cv2
import numpy as np
from PIL import Image, ImageEnhance
import matplotlib.pyplot as plt
import io
import base64

class HistogramEqualization:
    def __init__(self):
        """Initialize Histogram Equalization module"""
        pass
    
    def calculate_histogram(self, image_array, channel='gray'):
        """Calculate histogram for given channel"""
        if channel == 'gray':
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        elif channel == 'r':
            hist = cv2.calcHist([image_array], [0], None, [256], [0, 256])
        elif channel == 'g':
            hist = cv2.calcHist([image_array], [1], None, [256], [0, 256])
        elif channel == 'b':
            hist = cv2.calcHist([image_array], [2], None, [256], [0, 256])
        else:
            # RGB combined
            hist_r = cv2.calcHist([image_array], [0], None, [256], [0, 256])
            hist_g = cv2.calcHist([image_array], [1], None, [256], [0, 256])
            hist_b = cv2.calcHist([image_array], [2], None, [256], [0, 256])
            hist = (hist_r + hist_g + hist_b) / 3
        
        return hist.flatten()
    
    def create_histogram_visualization(self, histogram, color='blue', title='Histogram'):
        """Create histogram visualization image"""
        plt.figure(figsize=(8, 6))
        plt.clf()
        
        # Create the plot
        plt.plot(histogram, color=color, alpha=0.7)
        plt.fill_between(range(len(histogram)), histogram, alpha=0.3, color=color)
        
        plt.title(title, fontsize=14, fontweight='bold')
        plt.xlabel('Pixel Intensity', fontsize=12)
        plt.ylabel('Frequency', fontsize=12)
        plt.xlim([0, 255])
        plt.grid(True, alpha=0.3)
        
        # Convert plot to base64 image
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        
        # Encode to base64
        plot_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return f"data:image/png;base64,{plot_base64}"
    
    def global_histogram_equalization(self, image_array):
        """Apply global histogram equalization"""
        print("Applying global histogram equalization...")
        
        # Convert to different color spaces for better results
        # Method 1: Equalize each channel separately
        equalized = np.zeros_like(image_array)
        
        for i in range(3):  # R, G, B channels
            equalized[:, :, i] = cv2.equalizeHist(image_array[:, :, i])
        
        return equalized
    
    def adaptive_histogram_equalization(self, image_array, tile_grid_size=8):
        """Apply adaptive histogram equalization (AHE)"""
        print(f"Applying adaptive histogram equalization with tile size {tile_grid_size}...")
        
        # Convert to YUV color space to preserve color information
        yuv = cv2.cvtColor(image_array, cv2.COLOR_RGB2YUV)
        
        # Apply AHE to Y channel only
        clahe = cv2.createCLAHE(clipLimit=40.0, tileGridSize=(tile_grid_size, tile_grid_size))
        yuv[:, :, 0] = clahe.apply(yuv[:, :, 0])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(yuv, cv2.COLOR_YUV2RGB)
        
        return enhanced
    
    def clahe_equalization(self, image_array, clip_limit=2.0, tile_grid_size=8):
        """Apply Contrast Limited Adaptive Histogram Equalization (CLAHE)"""
        print(f"Applying CLAHE with clip limit {clip_limit} and tile size {tile_grid_size}...")
        
        # Convert to LAB color space for better results
        lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        return enhanced
    
    def color_preserving_enhancement(self, image_array):
        """Apply color-preserving histogram equalization"""
        print("Applying color-preserving enhancement...")
        
        # Convert to HSV color space
        hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
        
        # Apply histogram equalization to V (value/brightness) channel only
        hsv[:, :, 2] = cv2.equalizeHist(hsv[:, :, 2])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        
        return enhanced
    
    def multi_scale_retinex(self, image_array, scales=[15, 80, 250]):
        """Apply Multi-Scale Retinex for advanced enhancement"""
        print("Applying Multi-Scale Retinex...")
        
        # Convert to float
        img = image_array.astype(np.float64)
        
        # Initialize retinex output
        retinex = np.zeros_like(img)
        
        for scale in scales:
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(img, (0, 0), scale)
            
            # Avoid division by zero
            blurred[blurred == 0] = 1
            
            # Calculate single scale retinex
            ssr = np.log10(img + 1) - np.log10(blurred + 1)
            retinex += ssr
        
        # Average the scales
        retinex = retinex / len(scales)
        
        # Normalize to 0-255
        retinex = ((retinex - retinex.min()) / (retinex.max() - retinex.min()) * 255).astype(np.uint8)
        
        return retinex
    
    def apply_enhancement(self, image_array, enhancement_type='global', clip_limit=2.0, tile_grid_size=8):
        """Apply specified histogram enhancement"""
        original_hist = self.calculate_histogram(image_array, 'gray')
        
        if enhancement_type == 'global':
            enhanced = self.global_histogram_equalization(image_array)
        elif enhancement_type == 'adaptive':
            enhanced = self.adaptive_histogram_equalization(image_array, tile_grid_size)
        elif enhancement_type == 'clahe':
            enhanced = self.clahe_equalization(image_array, clip_limit, tile_grid_size)
        elif enhancement_type == 'color_preserving':
            enhanced = self.color_preserving_enhancement(image_array)
        elif enhancement_type == 'retinex':
            enhanced = self.multi_scale_retinex(image_array)
        else:
            # Default to global
            enhanced = self.global_histogram_equalization(image_array)
        
        enhanced_hist = self.calculate_histogram(enhanced, 'gray')
        
        # Create histogram visualizations
        original_hist_img = self.create_histogram_visualization(
            original_hist, 'red', 'Original Histogram'
        )
        enhanced_hist_img = self.create_histogram_visualization(
            enhanced_hist, 'green', 'Enhanced Histogram'
        )
        
        histogram_data = {
            'original': original_hist_img,
            'enhanced': enhanced_hist_img,
            'originalData': original_hist.tolist(),
            'enhancedData': enhanced_hist.tolist()
        }
        
        return enhanced, histogram_data
    
    def calculate_enhancement_metrics(self, original, enhanced):
        """Calculate enhancement quality metrics"""
        # Convert to grayscale for metrics
        original_gray = cv2.cvtColor(original, cv2.COLOR_RGB2GRAY)
        enhanced_gray = cv2.cvtColor(enhanced, cv2.COLOR_RGB2GRAY)
        
        # Calculate contrast improvement
        original_contrast = np.std(original_gray)
        enhanced_contrast = np.std(enhanced_gray)
        contrast_improvement = (enhanced_contrast / original_contrast) * 100
        
        # Calculate entropy (measure of information)
        original_entropy = self.calculate_entropy(original_gray)
        enhanced_entropy = self.calculate_entropy(enhanced_gray)
        
        # Calculate average brightness
        original_brightness = np.mean(original_gray)
        enhanced_brightness = np.mean(enhanced_gray)
        
        metrics = {
            'contrast_improvement': round(contrast_improvement, 2),
            'original_entropy': round(original_entropy, 3),
            'enhanced_entropy': round(enhanced_entropy, 3),
            'original_brightness': round(original_brightness, 1),
            'enhanced_brightness': round(enhanced_brightness, 1),
            'original_contrast': round(original_contrast, 2),
            'enhanced_contrast': round(enhanced_contrast, 2)
        }
        
        return metrics
    
    def calculate_entropy(self, image):
        """Calculate image entropy"""
        hist = cv2.calcHist([image], [0], None, [256], [0, 256])
        hist = hist.flatten()
        hist = hist / np.sum(hist)  # Normalize
        
        # Remove zero entries
        hist = hist[hist > 0]
        
        # Calculate entropy
        entropy = -np.sum(hist * np.log2(hist))
        
        return entropy
    
    def enhance_with_unsharp_masking(self, image_array, sigma=1.0, strength=1.5):
        """Apply unsharp masking for additional enhancement"""
        print("Applying unsharp masking...")
        
        # Create Gaussian blur
        blurred = cv2.GaussianBlur(image_array, (0, 0), sigma)
        
        # Create unsharp mask
        unsharp_mask = image_array.astype(np.float64) - blurred.astype(np.float64)
        
        # Apply the mask
        enhanced = image_array.astype(np.float64) + strength * unsharp_mask
        
        # Clip values
        enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
        
        return enhanced
    
    def advanced_enhancement_pipeline(self, image_array, enhancement_type='clahe', **kwargs):
        """Apply advanced enhancement pipeline"""
        print("Starting advanced enhancement pipeline...")
        
        # Step 1: Initial enhancement
        enhanced, hist_data = self.apply_enhancement(image_array, enhancement_type, **kwargs)
        
        # Step 2: Optional unsharp masking for sharpness
        if enhancement_type in ['clahe', 'adaptive']:
            enhanced = self.enhance_with_unsharp_masking(enhanced, sigma=1.0, strength=0.5)
        
        # Step 3: Final color correction
        enhanced = self.apply_color_correction(enhanced)
        
        # Recalculate histograms after pipeline
        final_hist = self.calculate_histogram(enhanced, 'gray')
        hist_data['enhanced'] = self.create_histogram_visualization(
            final_hist, 'green', 'Final Enhanced Histogram'
        )
        hist_data['enhancedData'] = final_hist.tolist()
        
        return enhanced, hist_data
    
    def apply_color_correction(self, image_array, gamma=1.0):
        """Apply gamma correction for color balance"""
        if gamma != 1.0:
            # Build lookup table
            inv_gamma = 1.0 / gamma
            table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype(np.uint8)
            
            # Apply gamma correction
            corrected = cv2.LUT(image_array, table)
            return corrected
        
        return image_array
