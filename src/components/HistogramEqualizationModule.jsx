import { useState, useRef } from 'react';

function HistogramEqualizationModule({ originalImage, onEnhancementCreated, useAPI = false }) {
  const [enhancementType, setEnhancementType] = useState('global');
  const [clipLimit, setClipLimit] = useState(2.0);
  const [tileGridSize, setTileGridSize] = useState(8);
  const [processing, setProcessing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState(null);
  const [histograms, setHistograms] = useState(null);
  const canvasRef = useRef(null);

  const enhancementTypes = {
    global: 'Global Histogram Equalization',
    adaptive: 'Adaptive Histogram Equalization (AHE)',
    clahe: 'Contrast Limited AHE (CLAHE)',
    color_preserving: 'Color Preserving Enhancement'
  };

  // Calculate histogram
  const calculateHistogram = (imageData, channel = 'all') => {
    const { width, height, data } = imageData;
    const histogram = new Array(256).fill(0);
    
    if (channel === 'all') {
      // Grayscale histogram
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        histogram[gray]++;
      }
    } else {
      // Specific channel histogram
      const channelIndex = channel === 'r' ? 0 : channel === 'g' ? 1 : 2;
      for (let i = channelIndex; i < data.length; i += 4) {
        histogram[data[i]]++;
      }
    }
    
    return histogram;
  };

  // Create histogram visualization
  const createHistogramImage = (histogram, color = '#3B82F6') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 200;
    
    // Clear canvas
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 256, 200);
    
    // Find max value for scaling
    const maxValue = Math.max(...histogram);
    
    // Draw histogram
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) {
      const barHeight = (histogram[i] / maxValue) * 180;
      ctx.fillRect(i, 200 - barHeight, 1, barHeight);
    }
    
    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 200);
      ctx.stroke();
    }
    
    return canvas.toDataURL();
  };

  // JavaScript implementations
  const applyGlobalHistogramEqualization = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    // Calculate histogram for each channel
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);
    
    for (let i = 0; i < data.length; i += 4) {
      histR[data[i]]++;
      histG[data[i + 1]]++;
      histB[data[i + 2]]++;
    }
    
    // Calculate cumulative distribution function (CDF)
    const cdfR = [...histR];
    const cdfG = [...histG];
    const cdfB = [...histB];
    
    for (let i = 1; i < 256; i++) {
      cdfR[i] += cdfR[i - 1];
      cdfG[i] += cdfG[i - 1];
      cdfB[i] += cdfB[i - 1];
    }
    
    // Normalize CDF
    const totalPixels = width * height;
    const lookupR = cdfR.map(val => Math.round((val / totalPixels) * 255));
    const lookupG = cdfG.map(val => Math.round((val / totalPixels) * 255));
    const lookupB = cdfB.map(val => Math.round((val / totalPixels) * 255));
    
    // Apply equalization
    for (let i = 0; i < data.length; i += 4) {
      output[i] = lookupR[data[i]];
      output[i + 1] = lookupG[data[i + 1]];
      output[i + 2] = lookupB[data[i + 2]];
      output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
  };

  const applyAdaptiveHistogramEqualization = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const tileSize = tileGridSize;
    
    // Process each tile
    for (let tileY = 0; tileY < height; tileY += tileSize) {
      for (let tileX = 0; tileX < width; tileX += tileSize) {
        // Extract tile
        const tileData = [];
        const tileWidth = Math.min(tileSize, width - tileX);
        const tileHeight = Math.min(tileSize, height - tileY);
        
        for (let y = 0; y < tileHeight; y++) {
          for (let x = 0; x < tileWidth; x++) {
            const srcIdx = ((tileY + y) * width + (tileX + x)) * 4;
            tileData.push(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2], data[srcIdx + 3]);
          }
        }
        
        // Apply local histogram equalization
        const tileImageData = new ImageData(new Uint8ClampedArray(tileData), tileWidth, tileHeight);
        const equalizedTile = applyGlobalHistogramEqualization(tileImageData);
        
        // Copy back to output
        for (let y = 0; y < tileHeight; y++) {
          for (let x = 0; x < tileWidth; x++) {
            const srcIdx = (y * tileWidth + x) * 4;
            const dstIdx = ((tileY + y) * width + (tileX + x)) * 4;
            
            output[dstIdx] = equalizedTile.data[srcIdx];
            output[dstIdx + 1] = equalizedTile.data[srcIdx + 1];
            output[dstIdx + 2] = equalizedTile.data[srcIdx + 2];
            output[dstIdx + 3] = equalizedTile.data[srcIdx + 3];
          }
        }
      }
    }
    
    return new ImageData(output, width, height);
  };

  const applyCLAHE = (imageData) => {
    // Simplified CLAHE implementation
    const adaptive = applyAdaptiveHistogramEqualization(imageData);
    const { width, height, data } = adaptive;
    const output = new Uint8ClampedArray(data);
    
    // Apply contrast limiting by clamping extreme values
    for (let i = 0; i < data.length; i += 4) {
      // Limit contrast based on clipLimit
      const factor = clipLimit / 4.0;
      
      output[i] = Math.max(0, Math.min(255, data[i] * factor));
      output[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor));
      output[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor));
      output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
  };

  const applyColorPreservingEnhancement = (imageData) => {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    // Convert to HSV, enhance V channel only
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
      
      // Apply histogram equalization to value channel
      const enhancedV = Math.pow(v / 255, 0.7) * 255; // Gamma correction as approximation
      
      const [r, g, b] = hsvToRgb(h, s, enhancedV);
      
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
      output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
  };

  // Color space conversions
  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, s * 255, v * 255];
  };

  const hsvToRgb = (h, s, v) => {
    h /= 60; s /= 255; v /= 255;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 1) [r, g, b] = [c, x, 0];
    else if (h >= 1 && h < 2) [r, g, b] = [x, c, 0];
    else if (h >= 2 && h < 3) [r, g, b] = [0, c, x];
    else if (h >= 3 && h < 4) [r, g, b] = [0, x, c];
    else if (h >= 4 && h < 5) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

  // JavaScript enhancement application
  const applyEnhancementLocal = () => {
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
        let enhancedData;

        switch (enhancementType) {
          case 'global':
            enhancedData = applyGlobalHistogramEqualization(imageData);
            break;
          case 'adaptive':
            enhancedData = applyAdaptiveHistogramEqualization(imageData);
            break;
          case 'clahe':
            enhancedData = applyCLAHE(imageData);
            break;
          case 'color_preserving':
            enhancedData = applyColorPreservingEnhancement(imageData);
            break;
          default:
            enhancedData = applyGlobalHistogramEqualization(imageData);
        }
        
        ctx.putImageData(enhancedData, 0, 0);
        const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Calculate histograms
        const originalHist = calculateHistogram(imageData);
        const enhancedHist = calculateHistogram(enhancedData);
        
        const histogramData = {
          original: createHistogramImage(originalHist, '#EF4444'),
          enhanced: createHistogramImage(enhancedHist, '#10B981'),
          originalData: originalHist,
          enhancedData: enhancedHist
        };
        
        const result = {
          src: enhancedDataUrl,
          type: enhancementType,
          clipLimit: clipLimit,
          tileGridSize: tileGridSize,
          method: 'JavaScript',
          histograms: histogramData
        };

        setEnhancementResult(result);
        setHistograms(histogramData);
        onEnhancementCreated(result);
        setProcessing(false);
      };

      img.src = originalImage.src;
    }, 100);
  };

  // Python API enhancement
  const applyEnhancementAPI = async () => {
    if (!originalImage) return;

    setProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/histogram_equalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: originalImage.src,
          type: enhancementType,
          clipLimit: clipLimit,
          tileGridSize: tileGridSize
        })
      });

      const result = await response.json();

      if (result.success) {
        const enhancementResult = {
          src: result.enhancedImage,
          type: result.type,
          clipLimit: result.clipLimit,
          tileGridSize: result.tileGridSize,
          method: 'Python API (Advanced)',
          histograms: result.histograms,
          metrics: result.metrics
        };

        setEnhancementResult(enhancementResult);
        setHistograms(result.histograms);
        onEnhancementCreated(enhancementResult);
      } else {
        console.error('Enhancement failed:', result.error);
        alert(`Enhancement failed: ${result.error}`);
      }

      setProcessing(false);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to connect to Python API. Using JavaScript fallback...');
      applyEnhancementLocal();
    }
  };

  const applyEnhancement = () => {
    if (useAPI) {
      applyEnhancementAPI();
    } else {
      applyEnhancementLocal();
    }
  };

  const downloadEnhanced = () => {
    if (!enhancementResult) return;
    const link = document.createElement('a');
    link.href = enhancementResult.src;
    link.download = `enhanced_${enhancementType}.jpg`;
    link.click();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-[2rem] p-8 md:p-10 mb-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-green-300 animate-fadeInUp-delay-3">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-2xl animate-pulse">
            📊
          </div>
          Histogram Equalization
          {useAPI && (
            <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
              🐍 Python API
            </span>
          )}
        </h2>

        {/* Enhancement Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 rounded-2xl p-6 border-2 border-green-200">
            <label className="block text-lg font-black text-green-800 mb-4">Enhancement Type</label>
            <select
              value={enhancementType}
              onChange={(e) => setEnhancementType(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-green-300 bg-white font-semibold text-gray-800 focus:border-green-500 focus:outline-none"
            >
              {Object.entries(enhancementTypes).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {(enhancementType === 'clahe') && (
            <div className="bg-white/70 rounded-2xl p-6 border-2 border-emerald-200">
              <label className="block text-lg font-black text-emerald-800 mb-4">Clip Limit: {clipLimit}</label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={clipLimit}
                onChange={(e) => setClipLimit(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}

          {(enhancementType === 'adaptive' || enhancementType === 'clahe') && (
            <div className="bg-white/70 rounded-2xl p-6 border-2 border-teal-200">
              <label className="block text-lg font-black text-teal-800 mb-4">Tile Size: {tileGridSize}×{tileGridSize}</label>
              <input
                type="range"
                min="4"
                max="32"
                step="4"
                value={tileGridSize}
                onChange={(e) => setTileGridSize(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Apply Enhancement Button */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={applyEnhancement}
            disabled={processing}
            className="px-12 py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-green-500/60 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin text-2xl">📊</span>
                Enhancing Image...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                Enhance Contrast
                <span className="text-2xl">📈</span>
              </span>
            )}
          </button>

          {enhancementResult && (
            <button
              onClick={downloadEnhanced}
              className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">💾</span>
                Download
              </span>
            </button>
          )}
        </div>

        {/* Results */}
        {enhancementResult && (
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-300">
            <h3 className="text-xl font-black text-green-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Enhancement Results
            </h3>
            
            {/* Image Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h4 className="font-black text-green-800 mb-4">Original Image</h4>
                <img 
                  src={originalImage.src} 
                  alt="Original" 
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-green-300"
                />
              </div>
              
              <div className="text-center">
                <h4 className="font-black text-emerald-800 mb-4">Enhanced Image</h4>
                <img 
                  src={enhancementResult.src} 
                  alt="Enhanced" 
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-emerald-300"
                />
              </div>
            </div>

            {/* Histogram Comparison */}
            {histograms && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <h4 className="font-black text-red-700 mb-4">Original Histogram</h4>
                  <img 
                    src={histograms.original} 
                    alt="Original Histogram" 
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-red-300"
                  />
                </div>
                
                <div className="text-center">
                  <h4 className="font-black text-emerald-700 mb-4">Enhanced Histogram</h4>
                  <img 
                    src={histograms.enhanced} 
                    alt="Enhanced Histogram" 
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-2 border-emerald-300"
                  />
                </div>
              </div>
            )}

            {/* Enhancement Metrics (Python API) */}
            {enhancementResult?.metrics && (
              <div className="mt-6">
                <h4 className="text-lg font-black text-green-800 mb-4">Enhancement Metrics</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-lg font-black text-blue-600">{enhancementResult.metrics.contrast_improvement}%</div>
                    <div className="text-sm text-blue-700 font-semibold">Contrast Gain</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-lg font-black text-purple-600">{enhancementResult.metrics.enhanced_entropy}</div>
                    <div className="text-sm text-purple-700 font-semibold">Information Content</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-lg font-black text-indigo-600">{enhancementResult.metrics.enhanced_brightness}</div>
                    <div className="text-sm text-indigo-700 font-semibold">Avg Brightness</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="text-lg font-black text-teal-600">{enhancementResult.metrics.enhanced_contrast}</div>
                    <div className="text-sm text-teal-700 font-semibold">Std Deviation</div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Display */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-green-600">{enhancementResult.type}</div>
                <div className="text-sm text-green-700 font-semibold">Method</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-emerald-600">{enhancementResult.clipLimit || 'N/A'}</div>
                <div className="text-sm text-emerald-700 font-semibold">Clip Limit</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-teal-600">{enhancementResult.tileGridSize || 'N/A'}</div>
                <div className="text-sm text-teal-700 font-semibold">Tile Size</div>
              </div>
              <div className="bg-white/70 rounded-xl p-4 text-center">
                <div className="text-sm font-black text-cyan-600">{enhancementResult.method}</div>
                <div className="text-sm text-cyan-700 font-semibold">Processing</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistogramEqualizationModule;
