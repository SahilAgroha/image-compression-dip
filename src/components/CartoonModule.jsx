import { useState, useRef } from 'react';

function CartoonModule({ originalImage, onCartoonCreated, useAPI = false }) {
  const [cartoonStyle, setCartoonStyle] = useState('anime');  // Changed default from 'classic' to 'anime'
  const [intensity, setIntensity] = useState(5);
  const [colorLevels, setColorLevels] = useState(8);
  const [processing, setProcessing] = useState(false);
  const [cartoonResult, setCartoonResult] = useState(null);
  const canvasRef = useRef(null);

  const cartoonStyles = {
    anime: 'Anime Style',
    sketch: 'Pencil Sketch',
    comic: 'Comic Book',
    oil_painting: 'Oil Painting',
    pop_art: 'Pop Art'
  };

  // JavaScript cartoon effects
  const applyCartoonLocal = () => {
    if (!originalImage) return;

    setProcessing(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        let processedData;

        switch (cartoonStyle) {
          case 'anime':
            processedData = applyAnimeStyle(imageData);
            break;
          case 'sketch':
            processedData = applySketchEffect(imageData);
            break;
          case 'comic':
            processedData = applyComicEffect(imageData);
            break;
          case 'oil_painting':
            processedData = applyOilPaintingEffect(imageData);
            break;
          case 'pop_art':
            processedData = applyPopArtEffect(imageData);
            break;
          default:
            processedData = applyAnimeStyle(imageData);  // Changed default from classic to anime
        }
        
        ctx.putImageData(processedData, 0, 0);
        const cartoonDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const result = {
          src: cartoonDataUrl,
          style: cartoonStyle,
          intensity: intensity,
          colorLevels: colorLevels,
          method: 'JavaScript'
        };

        setCartoonResult(result);
        onCartoonCreated(result);
        setProcessing(false);
      };

      img.src = originalImage.src;
    }, 100);
  };

  // Anime style effect
  const applyAnimeStyle = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);

    // High contrast with smooth gradients
    for (let i = 0; i < data.length; i += 4) {
      // Enhance saturation
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to HSL for saturation boost
      const [h, s, l] = rgbToHsl(r, g, b);
      const [newR, newG, newB] = hslToRgb(h, Math.min(1, s * 1.5), l);
      
      // Smooth color transitions
      const levels = 6;
      output[i] = Math.round(newR / 255 * levels) * (255 / levels);
      output[i + 1] = Math.round(newG / 255 * levels) * (255 / levels);
      output[i + 2] = Math.round(newB / 255 * levels) * (255 / levels);
      output[i + 3] = data[i + 3];
    }

    return new ImageData(output, width, height);
  };

  // Sketch effect
  const applySketchEffect = (imageData) => {
    const { width, height, data } = imageData;
    const gray = new Uint8ClampedArray(data.length);

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const grayValue = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      gray[i] = gray[i + 1] = gray[i + 2] = grayValue;
      gray[i + 3] = data[i + 3];
    }

    // Apply edge detection
    const edges = detectEdges(new ImageData(gray, width, height));
    
    // Invert edges for sketch effect
    for (let i = 0; i < edges.length; i += 4) {
      const edge = 255 - edges[i];
      edges[i] = edges[i + 1] = edges[i + 2] = edge;
    }

    return new ImageData(edges, width, height);
  };

  // Comic book effect
  const applyComicEffect = (imageData) => {
    const quantized = quantizeColors(imageData, 4);
    const edges = detectEdges(imageData);
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);

    // Strong edges with flat colors
    for (let i = 0; i < data.length; i += 4) {
      const edgeStrength = edges[i] / 255;
      
      if (edgeStrength > 0.3) {
        // Black edges
        output[i] = output[i + 1] = output[i + 2] = 0;
      } else {
        // Flat colors
        output[i] = quantized[i];
        output[i + 1] = quantized[i + 1];
        output[i + 2] = quantized[i + 2];
      }
      output[i + 3] = data[i + 3];
    }

    return new ImageData(output, width, height);
  };

  // Oil painting effect
  const applyOilPaintingEffect = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const radius = intensity;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const colors = [];
        
        // Sample colors in neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            colors.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }

        // Find most frequent color
        const avgColor = colors.reduce((acc, color) => [
          acc[0] + color[0],
          acc[1] + color[1],
          acc[2] + color[2]
        ], [0, 0, 0]);

        const idx = (y * width + x) * 4;
        output[idx] = avgColor[0] / colors.length;
        output[idx + 1] = avgColor[1] / colors.length;
        output[idx + 2] = avgColor[2] / colors.length;
        output[idx + 3] = data[idx + 3];
      }
    }

    return new ImageData(output, width, height);
  };

  // Pop art effect
  const applyPopArtEffect = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);

    // High contrast with limited color palette
    for (let i = 0; i < data.length; i += 4) {
      // Posterize to 4 levels per channel
      output[i] = Math.round(data[i] / 64) * 64;
      output[i + 1] = Math.round(data[i + 1] / 64) * 64;
      output[i + 2] = Math.round(data[i + 2] / 64) * 64;
      
      // Boost saturation
      const [h, s, l] = rgbToHsl(output[i], output[i + 1], output[i + 2]);
      const [r, g, b] = hslToRgb(h, Math.min(1, s * 2), l);
      
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
      output[i + 3] = data[i + 3];
    }

    return new ImageData(output, width, height);
  };

  // Helper functions
  const quantizeColors = (imageData, levels) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const factor = 255 / (levels - 1);

    for (let i = 0; i < data.length; i += 4) {
      output[i] = Math.round(Math.round(data[i] / factor) * factor);
      output[i + 1] = Math.round(Math.round(data[i + 1] / factor) * factor);
      output[i + 2] = Math.round(Math.round(data[i + 2] / factor) * factor);
      output[i + 3] = data[i + 3];
    }

    return output;
  };

  const detectEdges = (imageData) => {
    const { width, height, data } = imageData;
    const gray = new Uint8ClampedArray(data.length);
    const edges = new Uint8ClampedArray(data.length);

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const grayValue = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      gray[i] = gray[i + 1] = gray[i + 2] = grayValue;
    }

    // Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        const gx = 
          gray[((y - 1) * width + x - 1) * 4] * -1 +
          gray[((y - 1) * width + x + 1) * 4] * 1 +
          gray[(y * width + x - 1) * 4] * -2 +
          gray[(y * width + x + 1) * 4] * 2 +
          gray[((y + 1) * width + x - 1) * 4] * -1 +
          gray[((y + 1) * width + x + 1) * 4] * 1;

        const gy = 
          gray[((y - 1) * width + x - 1) * 4] * -1 +
          gray[((y - 1) * width + x) * 4] * -2 +
          gray[((y - 1) * width + x + 1) * 4] * -1 +
          gray[((y + 1) * width + x - 1) * 4] * 1 +
          gray[((y + 1) * width + x) * 4] * 2 +
          gray[((y + 1) * width + x + 1) * 4] * 1;

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = edges[idx + 1] = edges[idx + 2] = Math.min(255, magnitude);
        edges[idx + 3] = 255;
      }
    }

    return edges;
  };

  // Color space conversions
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  };

  const hslToRgb = (h, s, l) => {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Python API cartoon generation
  const applyCartoonAPI = async () => {
    if (!originalImage) return;

    setProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/cartoonify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: originalImage.src,
          style: cartoonStyle,
          intensity: intensity,
          colorLevels: colorLevels
        })
      });

      const result = await response.json();

      if (result.success) {
        const cartoonResult = {
          src: result.cartoonImage,
          style: result.style,
          intensity: result.intensity,
          colorLevels: result.colorLevels,
          method: 'Python API (Advanced)'
        };

        setCartoonResult(cartoonResult);
        onCartoonCreated(cartoonResult);
      } else {
        console.error('Cartoonification failed:', result.error);
        alert(`Cartoonification failed: ${result.error}`);
      }

      setProcessing(false);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to connect to Python API. Using JavaScript fallback...');
      applyCartoonLocal();
    }
  };

  const applyCartoon = () => {
    if (useAPI) {
      applyCartoonAPI();
    } else {
      applyCartoonLocal();
    }
  };

  const downloadCartoon = () => {
    if (!cartoonResult) return;
    const link = document.createElement('a');
    link.href = cartoonResult.src;
    link.download = `cartoon_${cartoonStyle}.jpg`;
    link.click();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 rounded-[2rem] p-8 md:p-10 mb-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-pink-300 animate-fadeInUp-delay-3">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-700 via-rose-700 to-orange-700 bg-clip-text text-transparent mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center text-3xl shadow-2xl animate-bounce">
            🎨
          </div>
          Image Cartoonification
          {useAPI && (
            <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
              🐍 Python API
            </span>
          )}
        </h2>

        {/* Cartoon Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 rounded-2xl p-6 border-2 border-pink-200">
            <label className="block text-lg font-black text-pink-800 mb-4">Cartoon Style</label>
            <select
              value={cartoonStyle}
              onChange={(e) => setCartoonStyle(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-pink-300 bg-white font-semibold text-gray-800 focus:border-pink-500 focus:outline-none"
            >
              {Object.entries(cartoonStyles).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 border-2 border-rose-200">
            <label className="block text-lg font-black text-rose-800 mb-4">Intensity: {intensity}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-yellow-400 [&::-webkit-slider-thumb]:to-orange-500
                       [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          <div className="bg-white/70 rounded-2xl p-6 border-2 border-orange-200">
            <label className="block text-lg font-black text-orange-800 mb-4">Color Levels: {colorLevels}</label>
            <input
              type="range"
              min="4"
              max="16"
              value={colorLevels}
              onChange={(e) => setColorLevels(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-yellow-400 [&::-webkit-slider-thumb]:to-orange-500
                       [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Apply Cartoon Button */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={applyCartoon}
            disabled={processing}
            className="px-12 py-6 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-pink-500/60 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin text-2xl">🎨</span>
                Converting to Cartoon...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="text-2xl">🖌️</span>
                Cartoonify Image
                <span className="text-2xl">✨</span>
              </span>
            )}
          </button>

          {cartoonResult && (
            <button
              onClick={downloadCartoon}
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
        {cartoonResult && (
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-pink-300">
            <h3 className="text-xl font-black text-pink-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              Cartoon Result
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h4 className="font-black text-pink-800 mb-4">Original</h4>
                <img 
                  src={originalImage.src} 
                  alt="Original" 
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-pink-300"
                />
              </div>
              
              <div className="text-center">
                <h4 className="font-black text-pink-800 mb-4">Cartoon Style</h4>
                <img 
                  src={cartoonResult.src} 
                  alt="Cartoon" 
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-orange-300"
                />
              </div>
            </div>

            {/* Settings Display */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-pink-600">{cartoonResult.style}</div>
                <div className="text-sm text-pink-700 font-semibold">Style</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-rose-600">{cartoonResult.intensity}</div>
                <div className="text-sm text-rose-700 font-semibold">Intensity</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-orange-600">{cartoonResult.colorLevels}</div>
                <div className="text-sm text-orange-700 font-semibold">Color Levels</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-sm font-black text-red-600">{cartoonResult.method}</div>
                <div className="text-sm text-red-700 font-semibold">Method</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartoonModule;
