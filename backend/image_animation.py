import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import io
import base64
import tempfile
import os
from typing import List, Tuple

class ImageAnimation:
    def __init__(self):
        """Initialize Image Animation module"""
        pass
    
    def create_zoom_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create zoom in/out animation"""
        frames = []
        total_frames = int(duration * fps)
        
        for i in range(total_frames):
            progress = i / (total_frames - 1)
            scale = 1.0 + np.sin(progress * np.pi * 2) * 0.3
            
            # Calculate new dimensions
            h, w = image_array.shape[:2]
            new_h, new_w = int(h * scale), int(w * scale)
            
            # Resize image
            if scale > 1:
                resized = cv2.resize(image_array, (new_w, new_h))
                # Crop to original size
                start_y = (new_h - h) // 2
                start_x = (new_w - w) // 2
                frame = resized[start_y:start_y+h, start_x:start_x+w]
            else:
                resized = cv2.resize(image_array, (new_w, new_h))
                # Pad to original size
                frame = np.zeros_like(image_array)
                start_y = (h - new_h) // 2
                start_x = (w - new_w) // 2
                frame[start_y:start_y+new_h, start_x:start_x+new_w] = resized
            
            frames.append(frame)
        
        return frames
    
    def create_pan_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create panning animation"""
        frames = []
        total_frames = int(duration * fps)
        h, w = image_array.shape[:2]
        
        # Create larger canvas for panning
        large_h, large_w = int(h * 1.5), int(w * 1.5)
        large_canvas = np.zeros((large_h, large_w, 3), dtype=np.uint8)
        
        # Place image in center
        start_y = (large_h - h) // 2
        start_x = (large_w - w) // 2
        large_canvas[start_y:start_y+h, start_x:start_x+w] = image_array
        
        for i in range(total_frames):
            progress = i / (total_frames - 1)
            
            # Calculate pan offset
            pan_x = int(np.sin(progress * np.pi * 2) * (large_w - w) // 4)
            pan_y = int(np.cos(progress * np.pi * 2) * (large_h - h) // 4)
            
            # Extract frame
            crop_x = (large_w - w) // 2 + pan_x
            crop_y = (large_h - h) // 2 + pan_y
            frame = large_canvas[crop_y:crop_y+h, crop_x:crop_x+w]
            
            frames.append(frame)
        
        return frames
    
    def create_rotation_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create rotation animation"""
        frames = []
        total_frames = int(duration * fps)
        h, w = image_array.shape[:2]
        center = (w // 2, h // 2)
        
        for i in range(total_frames):
            progress = i / (total_frames - 1)
            angle = progress * 360
            
            # Create rotation matrix
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            
            # Apply rotation
            frame = cv2.warpAffine(image_array, rotation_matrix, (w, h), 
                                 borderMode=cv2.BORDER_REFLECT)
            
            frames.append(frame)
        
        return frames
    
    def create_fade_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create fade in/out animation"""
        frames = []
        total_frames = int(duration * fps)
        
        for i in range(total_frames):
            progress = i / (total_frames - 1)
            alpha = (np.sin(progress * np.pi * 2) + 1) / 2
            
            # Apply alpha blending with black background
            black_bg = np.zeros_like(image_array)
            frame = cv2.addWeighted(image_array, alpha, black_bg, 1-alpha, 0)
            
            frames.append(frame)
        
        return frames
    
    def create_ken_burns_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create Ken Burns effect (slow zoom + pan)"""
        frames = []
        total_frames = int(duration * fps)
        h, w = image_array.shape[:2]
        
        for i in range(total_frames):
            progress = i / (total_frames - 1)
            
            # Gradual zoom
            scale = 1.0 + progress * 0.5
            # Gradual pan
            pan_x = int(progress * w * 0.1)
            pan_y = int(progress * h * 0.05)
            
            # Apply transformation
            new_h, new_w = int(h * scale), int(w * scale)
            resized = cv2.resize(image_array, (new_w, new_h))
            
            # Crop with pan offset
            start_y = max(0, pan_y)
            start_x = max(0, pan_x)
            end_y = min(new_h, start_y + h)
            end_x = min(new_w, start_x + w)
            
            frame = resized[start_y:end_y, start_x:end_x]
            
            # Ensure frame is correct size
            if frame.shape[:2] != (h, w):
                frame = cv2.resize(frame, (w, h))
            
            frames.append(frame)
        
        return frames
    
    def create_glitch_animation(self, image_array: np.ndarray, duration: float, fps: int) -> List[np.ndarray]:
        """Create glitch effect animation"""
        frames = []
        total_frames = int(duration * fps)
        
        for i in range(total_frames):
            frame = image_array.copy()
            
            # Random glitch effects
            if np.random.random() < 0.3:
                # Horizontal shift glitch
                shift = np.random.randint(-20, 20)
                slice_height = np.random.randint(5, 50)
                y_start = np.random.randint(0, frame.shape[0] - slice_height)
                
                if shift > 0:
                    frame[y_start:y_start+slice_height, :-shift] = frame[y_start:y_start+slice_height, shift:]
                else:
                    frame[y_start:y_start+slice_height, -shift:] = frame[y_start:y_start+slice_height, :shift]
            
            # Color channel glitch
            if np.random.random() < 0.2:
                channel = np.random.randint(0, 3)
                frame[:, :, channel] = np.roll(frame[:, :, channel], np.random.randint(-5, 5), axis=1)
            
            frames.append(frame)
        
        return frames
    
    def frames_to_gif(self, frames: List[np.ndarray], fps: int, output_path: str) -> str:
        """Convert frames to animated GIF"""
        try:
            # Convert frames to PIL Images
            pil_frames = []
            for frame in frames:
                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_frame = Image.fromarray(rgb_frame)
                pil_frames.append(pil_frame)
            
            # Calculate duration per frame in milliseconds
            duration_ms = int(1000 / fps)
            
            # Save as GIF
            pil_frames[0].save(
                output_path,
                save_all=True,
                append_images=pil_frames[1:],
                duration=duration_ms,
                loop=0,
                optimize=True
            )
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Failed to create GIF: {str(e)}")
    
    def create_animation(self, image_array: np.ndarray, animation_type: str, 
                        duration: float = 3.0, fps: int = 10) -> Tuple[List[np.ndarray], dict]:
        """Create animation based on type"""
        print(f"Creating {animation_type} animation: {duration}s @ {fps}fps")
        
        if animation_type == 'zoom':
            frames = self.create_zoom_animation(image_array, duration, fps)
        elif animation_type == 'pan':
            frames = self.create_pan_animation(image_array, duration, fps)
        elif animation_type == 'rotate':
            frames = self.create_rotation_animation(image_array, duration, fps)
        elif animation_type == 'fade':
            frames = self.create_fade_animation(image_array, duration, fps)
        elif animation_type == 'ken_burns':
            frames = self.create_ken_burns_animation(image_array, duration, fps)
        elif animation_type == 'glitch':
            frames = self.create_glitch_animation(image_array, duration, fps)
        else:
            # Default: simple pulse effect
            frames = self.create_zoom_animation(image_array, duration, fps)
        
        # Animation statistics
        stats = {
            'frame_count': len(frames),
            'duration': duration,
            'fps': fps,
            'animation_type': animation_type,
            'total_size_estimate': len(frames) * image_array.nbytes
        }
        
        return frames, stats
