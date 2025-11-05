from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image
import io
import base64
import tempfile
import os
from dct_compression import DCTImageCompression
from image_cartoonification import ImageCartoonification
from histogram_equalization import HistogramEqualization

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Initialize modules
compressor = DCTImageCompression()
cartoonifier = ImageCartoonification()
hist_equalizer = HistogramEqualization()

def decode_base64_image(image_data):
    """Helper function to decode base64 image"""
    image_bytes = base64.b64decode(image_data.split(',')[1])
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != 'RGB':
        image = image.convert('RGB')
    return np.array(image), image_bytes

def encode_image_to_base64(image_array, quality=95):
    """Helper function to encode image array to base64"""
    image_pil = Image.fromarray(image_array.astype(np.uint8))
    buffer = io.BytesIO()
    image_pil.save(buffer, format='JPEG', quality=quality)
    return base64.b64encode(buffer.getvalue()).decode()

@app.route('/compress', methods=['POST'])
def compress_image():
    """DCT Compression endpoint"""
    try:
        data = request.get_json()
        image_data = data['image']
        quality = int(data.get('quality', 50))
        block_size = int(data.get('blockSize', 8))
        
        print(f"Compression request: quality={quality}, blockSize={block_size}")
        
        image_array, image_bytes = decode_base64_image(image_data)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            Image.fromarray(image_array).save(temp_file.name, 'JPEG')
            temp_path = temp_file.name
        
        try:
            original, compressed = compressor.compress_image(temp_path, quality, block_size)
            psnr = compressor.calculate_psnr(original, compressed)
            mse = compressor.calculate_mse(original, compressed)
            
            compressed_base64 = encode_image_to_base64(compressed, quality)
            
            original_size = len(image_bytes)
            compressed_size = len(base64.b64decode(compressed_base64))
            compression_ratio = original_size / compressed_size if compressed_size > 0 else 1
            space_saved = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
            
            return jsonify({
                'success': True,
                'compressedImage': f"data:image/jpeg;base64,{compressed_base64}",
                'metrics': {
                    'psnr': round(psnr, 2),
                    'mse': round(mse, 2),
                    'compressionRatio': round(compression_ratio, 2),
                    'spaceSaved': round(space_saved, 1),
                    'originalSize': original_size,
                    'compressedSize': compressed_size
                }
            })
            
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        print(f"Compression error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/cartoonify', methods=['POST'])
def cartoonify_image():
    """Cartoonification endpoint"""
    try:
        data = request.get_json()
        image_data = data['image']
        style = data.get('style', 'anime')
        intensity = int(data.get('intensity', 5))
        color_levels = int(data.get('colorLevels', 8))
        
        print(f"Cartoonify request: {style}, intensity={intensity}, colors={color_levels}")
        
        image_array, _ = decode_base64_image(image_data)
        
        # Apply cartoon effect
        cartoon_array = cartoonifier.apply_cartoon_effect(image_array, style, intensity, color_levels)
        
        cartoon_base64 = encode_image_to_base64(cartoon_array)
        
        return jsonify({
            'success': True,
            'cartoonImage': f"data:image/jpeg;base64,{cartoon_base64}",
            'style': style,
            'intensity': intensity,
            'colorLevels': color_levels
        })
        
    except Exception as e:
        print(f"Cartoonification error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/histogram_equalize', methods=['POST'])
def histogram_equalize():
    """Histogram equalization endpoint"""
    try:
        data = request.get_json()
        image_data = data['image']
        enhancement_type = data.get('type', 'global')
        clip_limit = float(data.get('clipLimit', 2.0))
        tile_grid_size = int(data.get('tileGridSize', 8))
        
        print(f"Histogram equalization request: {enhancement_type}, clip={clip_limit}, tile={tile_grid_size}")
        
        image_array, _ = decode_base64_image(image_data)
        
        # Apply enhancement based on type
        if enhancement_type == 'clahe':
            enhanced_array, histogram_data = hist_equalizer.apply_enhancement(
                image_array, enhancement_type, clip_limit=clip_limit, tile_grid_size=tile_grid_size
            )
        elif enhancement_type in ['adaptive']:
            enhanced_array, histogram_data = hist_equalizer.apply_enhancement(
                image_array, enhancement_type, tile_grid_size=tile_grid_size
            )
        else:
            enhanced_array, histogram_data = hist_equalizer.apply_enhancement(
                image_array, enhancement_type
            )
        
        # Calculate enhancement metrics
        metrics = hist_equalizer.calculate_enhancement_metrics(image_array, enhanced_array)
        
        enhanced_base64 = encode_image_to_base64(enhanced_array)
        
        return jsonify({
            'success': True,
            'enhancedImage': f"data:image/jpeg;base64,{enhanced_base64}",
            'type': enhancement_type,
            'clipLimit': clip_limit,
            'tileGridSize': tile_grid_size,
            'histograms': histogram_data,
            'metrics': metrics
        })
        
    except Exception as e:
        print(f"Histogram equalization error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/advanced_enhance', methods=['POST'])
def advanced_enhance():
    """Advanced enhancement with multiple techniques"""
    try:
        data = request.get_json()
        image_data = data['image']
        enhancement_type = data.get('type', 'clahe')
        clip_limit = float(data.get('clipLimit', 2.0))
        tile_grid_size = int(data.get('tileGridSize', 8))
        use_advanced = data.get('useAdvanced', True)
        
        print(f"Advanced enhancement request: {enhancement_type}, advanced={use_advanced}")
        
        image_array, _ = decode_base64_image(image_data)
        
        if use_advanced:
            # Use advanced pipeline
            enhanced_array, histogram_data = hist_equalizer.advanced_enhancement_pipeline(
                image_array, 
                enhancement_type=enhancement_type,
                clip_limit=clip_limit,
                tile_grid_size=tile_grid_size
            )
        else:
            # Use basic enhancement
            enhanced_array, histogram_data = hist_equalizer.apply_enhancement(
                image_array, enhancement_type, clip_limit, tile_grid_size
            )
        
        # Calculate comprehensive metrics
        metrics = hist_equalizer.calculate_enhancement_metrics(image_array, enhanced_array)
        
        enhanced_base64 = encode_image_to_base64(enhanced_array)
        
        return jsonify({
            'success': True,
            'enhancedImage': f"data:image/jpeg;base64,{enhanced_base64}",
            'type': enhancement_type,
            'clipLimit': clip_limit,
            'tileGridSize': tile_grid_size,
            'histograms': histogram_data,
            'metrics': metrics,
            'advanced': use_advanced
        })
        
    except Exception as e:
        print(f"Advanced enhancement error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'Complete DIP Suite API is running!', 
        'version': '2.1',
        'modules': ['compression', 'cartoonification', 'histogram_equalization']
    })

if __name__ == '__main__':
    print("🚀 Starting Complete DIP Suite API...")
    print("📡 Server: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/health")
    print("📦 Available endpoints:")
    print("  • /compress - DCT Compression")
    print("  • /cartoonify - Image Cartoonification") 
    print("  • /histogram_equalize - Histogram Equalization")
    print("  • /advanced_enhance - Advanced Enhancement Pipeline")
    app.run(debug=True, port=5000, host='0.0.0.0')
