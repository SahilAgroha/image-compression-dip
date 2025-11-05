import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt
from scipy.fftpack import dct, idct
import os

class DCTImageCompression:
    def __init__(self):
        """Initialize DCT Image Compression"""
        pass
    
    def dct2D(self, block):
        """Perform 2D DCT on a block"""
        return dct(dct(block.T, norm='ortho').T, norm='ortho')
    
    def idct2D(self, block):
        """Perform 2D Inverse DCT on a block"""
        return idct(idct(block.T, norm='ortho').T, norm='ortho')
    
    def generate_quantization_matrix(self, quality, block_size):
        """Generate quantization matrix based on quality"""
        # Standard JPEG quantization matrix for 8x8
        if block_size == 8:
            base_matrix = np.array([
                [16, 11, 10, 16, 24, 40, 51, 61],
                [12, 12, 14, 19, 26, 58, 60, 55],
                [14, 13, 16, 24, 40, 57, 69, 56],
                [14, 17, 22, 29, 51, 87, 80, 62],
                [18, 22, 37, 56, 68, 109, 103, 77],
                [24, 35, 55, 64, 81, 104, 113, 92],
                [49, 64, 78, 87, 103, 121, 120, 101],
                [72, 92, 95, 98, 112, 100, 103, 99]
            ])
        else:
            # Generate matrix for other block sizes
            base_matrix = np.ones((block_size, block_size))
            for i in range(block_size):
                for j in range(block_size):
                    base_matrix[i, j] = 1 + (i + j) * 0.5
        
        # Scale based on quality (1-100)
        if quality < 50:
            scale = 5000 / quality
        else:
            scale = 200 - 2 * quality
        
        quant_matrix = np.floor((base_matrix * scale + 50) / 100)
        quant_matrix = np.maximum(quant_matrix, 1)
        
        return quant_matrix
    
    def extract_block(self, image, x, y, block_size):
        """Extract a block from the image"""
        h, w = image.shape
        block = np.zeros((block_size, block_size))
        
        for i in range(block_size):
            for j in range(block_size):
                pos_x = min(x + i, h - 1)
                pos_y = min(y + j, w - 1)
                block[i, j] = image[pos_x, pos_y]
        
        return block
    
    def insert_block(self, image, block, x, y, block_size):
        """Insert a block back into the image"""
        h, w = image.shape
        
        for i in range(block_size):
            for j in range(block_size):
                pos_x = min(x + i, h - 1)
                pos_y = min(y + j, w - 1)
                image[pos_x, pos_y] = np.clip(block[i, j], 0, 255)
    
    def compress_channel(self, channel, quality, block_size):
        """Compress a single color channel"""
        h, w = channel.shape
        compressed = np.copy(channel).astype(np.float64)
        
        # Generate quantization matrix
        quant_matrix = self.generate_quantization_matrix(quality, block_size)
        
        # Process each block
        for i in range(0, h, block_size):
            for j in range(0, w, block_size):
                # Extract block
                block = self.extract_block(channel, i, j, block_size)
                
                # Shift pixel values to center around 0
                block = block - 128
                
                # Apply DCT
                dct_block = self.dct2D(block)
                
                # Quantize
                quantized = np.round(dct_block / quant_matrix) * quant_matrix
                
                # Apply Inverse DCT
                idct_block = self.idct2D(quantized)
                
                # Shift back and clip
                idct_block = idct_block + 128
                idct_block = np.clip(idct_block, 0, 255)
                
                # Insert back
                self.insert_block(compressed, idct_block, i, j, block_size)
        
        return compressed.astype(np.uint8)
    
    def compress_image(self, image_path, quality=50, block_size=8):
        """Compress an entire image"""
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot load image: {image_path}")
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Separate channels
        r_channel = image[:, :, 0]
        g_channel = image[:, :, 1]
        b_channel = image[:, :, 2]
        
        # Compress each channel
        compressed_r = self.compress_channel(r_channel, quality, block_size)
        compressed_g = self.compress_channel(g_channel, quality, block_size)
        compressed_b = self.compress_channel(b_channel, quality, block_size)
        
        # Combine channels
        compressed_image = np.stack([compressed_r, compressed_g, compressed_b], axis=2)
        
        return image, compressed_image
    
    def calculate_psnr(self, original, compressed):
        """Calculate Peak Signal-to-Noise Ratio"""
        mse = np.mean((original.astype(np.float64) - compressed.astype(np.float64)) ** 2)
        if mse == 0:
            return 100
        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        return psnr
    
    def calculate_mse(self, original, compressed):
        """Calculate Mean Squared Error"""
        mse = np.mean((original.astype(np.float64) - compressed.astype(np.float64)) ** 2)
        return mse
