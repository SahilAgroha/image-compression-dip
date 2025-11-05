import { useState, useRef, useEffect } from 'react';

function AnimationModule({ originalImage, onAnimationCreated, useAPI = false }) {
  const [animationType, setAnimationType] = useState('zoom');
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [animatedResult, setAnimatedResult] = useState(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const animationTypes = {
    zoom: 'Zoom In/Out Effect',
    pan: 'Panning Motion',
    rotate: 'Rotation Effect',
    fade: 'Fade In/Out',
    slide: 'Slide Transition',
    pulse: 'Pulse Effect',
    ken_burns: 'Ken Burns Effect',
    glitch: 'Glitch Animation'
  };

  // JavaScript animation generation
  const generateAnimationLocal = () => {
    if (!originalImage) return;

    setProcessing(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const frames = [];
        const totalFrames = duration * fps;

        // Generate frames based on animation type
        for (let i = 0; i < totalFrames; i++) {
          const progress = i / (totalFrames - 1);
          const frameCanvas = document.createElement('canvas');
          const frameCtx = frameCanvas.getContext('2d');
          frameCanvas.width = img.width;
          frameCanvas.height = img.height;

          // Clear frame
          frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);

          // Apply animation effect
          switch (animationType) {
            case 'zoom':
              applyZoomEffect(frameCtx, img, progress);
              break;
            case 'pan':
              applyPanEffect(frameCtx, img, progress);
              break;
            case 'rotate':
              applyRotateEffect(frameCtx, img, progress);
              break;
            case 'fade':
              applyFadeEffect(frameCtx, img, progress);
              break;
            case 'slide':
              applySlideEffect(frameCtx, img, progress);
              break;
            case 'pulse':
              applyPulseEffect(frameCtx, img, progress);
              break;
            case 'ken_burns':
              applyKenBurnsEffect(frameCtx, img, progress);
              break;
            case 'glitch':
              applyGlitchEffect(frameCtx, img, progress);
              break;
            default:
              frameCtx.drawImage(img, 0, 0);
          }

          frames.push(frameCanvas.toDataURL('image/jpeg', 0.8));
        }

        // Create animated preview (show some frames)
        createPreviewAnimation(frames);

        const result = {
          type: animationType,
          frames: frames,
          duration: duration,
          fps: fps,
          frameCount: frames.length,
          method: 'JavaScript'
        };

        setAnimatedResult(result);
        onAnimationCreated(result);
        setProcessing(false);
      };

      img.src = originalImage.src;
    }, 100);
  };

  // Animation effects
  const applyZoomEffect = (ctx, img, progress) => {
    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.3;
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const applyPanEffect = (ctx, img, progress) => {
    const panX = Math.sin(progress * Math.PI * 2) * 50;
    const panY = Math.cos(progress * Math.PI * 2) * 30;
    ctx.drawImage(img, panX, panY);
  };

  const applyRotateEffect = (ctx, img, progress) => {
    const angle = progress * Math.PI * 2;
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const applyFadeEffect = (ctx, img, progress) => {
    const alpha = (Math.sin(progress * Math.PI * 2) + 1) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1;
  };

  const applySlideEffect = (ctx, img, progress) => {
    const slideX = Math.sin(progress * Math.PI) * img.width;
    ctx.drawImage(img, slideX - img.width, 0);
    if (slideX < img.width) {
      ctx.drawImage(img, slideX, 0);
    }
  };

  const applyPulseEffect = (ctx, img, progress) => {
    const pulse = Math.abs(Math.sin(progress * Math.PI * 4));
    const scale = 0.8 + pulse * 0.4;
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const applyKenBurnsEffect = (ctx, img, progress) => {
    const scale = 1 + progress * 0.5;
    const panX = progress * 100;
    const panY = progress * 50;
    
    ctx.save();
    ctx.scale(scale, scale);
    ctx.drawImage(img, -panX, -panY);
    ctx.restore();
  };

  const applyGlitchEffect = (ctx, img, progress) => {
    ctx.drawImage(img, 0, 0);
    
    if (Math.random() < 0.1) {
      const sliceHeight = 10;
      const y = Math.random() * (img.height - sliceHeight);
      const offset = (Math.random() - 0.5) * 20;
      
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(img, 0, y, img.width, sliceHeight, offset, y, img.width, sliceHeight);
      ctx.restore();
    }
  };

  const createPreviewAnimation = (frames) => {
    let currentFrame = 0;
    const previewFrames = frames.slice(0, Math.min(frames.length, 8)); // Show first 8 frames
    
    const animatePreview = () => {
      setPreview(previewFrames[currentFrame % previewFrames.length]);
      currentFrame++;
      setTimeout(animatePreview, 500); // Change frame every 500ms
    };
    
    animatePreview();
  };

  // Python API animation generation
  const generateAnimationAPI = async () => {
    if (!originalImage) return;

    setProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/animate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: originalImage.src,
          animationType: animationType,
          duration: duration,
          fps: fps
        })
      });

      const result = await response.json();

      if (result.success) {
        const animationResult = {
          type: result.animationType,
          gifUrl: result.animatedGif,
          frames: result.frames || [],
          duration: result.duration,
          fps: result.fps,
          frameCount: result.frameCount,
          fileSize: result.fileSize,
          method: 'Python API (Advanced)'
        };

        setAnimatedResult(animationResult);
        onAnimationCreated(animationResult);
      } else {
        console.error('Animation failed:', result.error);
        alert(`Animation failed: ${result.error}`);
      }

      setProcessing(false);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to connect to Python API. Using JavaScript fallback...');
      generateAnimationLocal();
    }
  };

  const generateAnimation = () => {
    if (useAPI) {
      generateAnimationAPI();
    } else {
      generateAnimationLocal();
    }
  };

  const downloadAnimation = () => {
    if (animatedResult && animatedResult.frames) {
      // For JavaScript version, download frames as ZIP
      const link = document.createElement('a');
      const frames = animatedResult.frames;
      
      // Create a simple frame download (first frame as sample)
      link.href = frames[0];
      link.download = `animated_${animationType}_frame1.jpg`;
      link.click();
    } else if (animatedResult && animatedResult.gifUrl) {
      // For Python API, download GIF
      const link = document.createElement('a');
      link.href = animatedResult.gifUrl;
      link.download = `animated_${animationType}.gif`;
      link.click();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 rounded-[2rem] p-8 md:p-10 mb-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-pink-300 animate-fadeInUp-delay-3">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-700 via-rose-700 to-orange-700 bg-clip-text text-transparent mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center text-3xl shadow-2xl animate-bounce">
            🎬
          </div>
          Image Animation Creator
          {useAPI && (
            <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
              🐍 Python API
            </span>
          )}
        </h2>

        {/* Animation Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 rounded-2xl p-6 border-2 border-pink-200">
            <label className="block text-lg font-black text-pink-800 mb-4">Animation Type</label>
            <select
              value={animationType}
              onChange={(e) => setAnimationType(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-pink-300 bg-white font-semibold text-gray-800 focus:border-pink-500 focus:outline-none"
            >
              {Object.entries(animationTypes).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 border-2 border-rose-200">
            <label className="block text-lg font-black text-rose-800 mb-4">Duration: {duration}s</label>
            <input
              type="range"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="bg-white/70 rounded-2xl p-6 border-2 border-orange-200">
            <label className="block text-lg font-black text-orange-800 mb-4">FPS: {fps}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white/70 rounded-2xl p-6 border-2 border-pink-200 mb-8">
            <h3 className="text-xl font-black text-pink-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              Animation Preview
            </h3>
            <div className="flex justify-center">
              <img 
                src={preview} 
                alt="Animation Preview" 
                className="max-w-sm rounded-xl shadow-lg border-2 border-pink-300"
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={generateAnimation}
            disabled={processing}
            className="px-12 py-6 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-pink-500/60 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin text-2xl">🎬</span>
                Creating Animation...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                Generate Animation
                <span className="text-2xl">✨</span>
              </span>
            )}
          </button>

          {animatedResult && (
            <button
              onClick={downloadAnimation}
              className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">💾</span>
                Download
              </span>
            </button>
          )}
        </div>

        {/* Results */}
        {animatedResult && (
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-pink-300">
            <h3 className="text-xl font-black text-pink-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Animation Details
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-pink-600">{animatedResult.frameCount}</div>
                <div className="text-sm text-pink-700 font-semibold">Frames</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-rose-600">{animatedResult.duration}s</div>
                <div className="text-sm text-rose-700 font-semibold">Duration</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-orange-600">{animatedResult.fps}</div>
                <div className="text-sm text-orange-700 font-semibold">FPS</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-red-600">{animatedResult.method}</div>
                <div className="text-sm text-red-700 font-semibold">Method</div>
              </div>
            </div>

            {/* Show GIF if available (Python API) */}
            {animatedResult.gifUrl && (
              <div className="text-center">
                <h4 className="font-black text-pink-800 mb-4">Animated GIF Result:</h4>
                <img 
                  src={animatedResult.gifUrl} 
                  alt="Animated GIF" 
                  className="max-w-md mx-auto rounded-xl shadow-lg border-2 border-pink-300"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimationModule;
