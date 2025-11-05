import { useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ControlsPanel from './components/ControlsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsGrid from './components/ResultsGrid';
import StatsSection from './components/StatsSection';
import ImageComparisonSlider from './components/ImageComparisonSlider';
import HistogramChart from './components/HistogramChart';
import CartoonModule from './components/CartoonModule';
import HistogramEqualizationModule from './components/HistogramEqualizationModule';
import { 
  performDCTCompression, 
  calculatePSNR, 
  calculateMSE 
} from './utils/compressionAlgorithms';

function App() {
  // Core states
  const [image, setImage] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Compression states
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedImageData, setCompressedImageData] = useState(null);
  const [quality, setQuality] = useState(50);
  const [blockSize, setBlockSize] = useState(8);
  const [stats, setStats] = useState(null);
  
  // Cartoon states
  const [cartoonResult, setCartoonResult] = useState(null);
  
  // Histogram Equalization states
  const [enhancementResult, setEnhancementResult] = useState(null);
  
  // UI states
  const [activeModule, setActiveModule] = useState('compression');
  const [useAPI, setUseAPI] = useState(false);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        setImage({
          src: e.target.result,
          width: img.width,
          height: img.height,
          size: file.size
        });
        setOriginalImageData(imageData);
        
        // Reset all results when new image is uploaded
        setCompressedImage(null);
        setCompressedImageData(null);
        setCartoonResult(null);
        setEnhancementResult(null);
        setStats(null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Compression functions
  const compressImageLocal = () => {
    if (!originalImageData) return;

    setProcessing(true);
    const startTime = performance.now();

    setTimeout(() => {
      try {
        const qualityValue = quality / 100;
        const compressed = performDCTCompression(originalImageData, qualityValue, blockSize);
        
        const canvas = document.createElement('canvas');
        canvas.width = compressed.width;
        canvas.height = compressed.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(compressed, 0, 0);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', qualityValue);
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        const ratio = (image.size / compressedSize).toFixed(2);
        const psnr = calculatePSNR(originalImageData, compressed);
        const mse = calculateMSE(originalImageData, compressed);
        const savedPercent = (((image.size - compressedSize) / image.size) * 100).toFixed(1);
        const processingTime = (performance.now() - startTime).toFixed(0);
        
        setCompressedImage({
          src: compressedDataUrl,
          size: compressedSize
        });
        setCompressedImageData(compressed);
        
        setStats({
          compressionRatio: ratio,
          psnr: psnr.toFixed(2),
          mse: mse.toFixed(2),
          spaceSaved: savedPercent,
          time: processingTime
        });
        
        setProcessing(false);
      } catch (error) {
        console.error('Local compression error:', error);
        setProcessing(false);
      }
    }, 100);
  };

  const compressImageWithAPI = async () => {
    if (!image) return;
    
    setProcessing(true);
    const startTime = performance.now();
    
    try {
      const response = await fetch('http://localhost:5000/compress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image.src,
          quality: quality,
          blockSize: blockSize
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const compressedImg = new Image();
        compressedImg.onload = () => {
          const compCanvas = document.createElement('canvas');
          const compCtx = compCanvas.getContext('2d');
          compCanvas.width = compressedImg.width;
          compCanvas.height = compressedImg.height;
          compCtx.drawImage(compressedImg, 0, 0);
          const compImageData = compCtx.getImageData(0, 0, compressedImg.width, compressedImg.height);
          
          setCompressedImageData(compImageData);
        };
        compressedImg.src = result.compressedImage;
        
        setCompressedImage({
          src: result.compressedImage,
          size: result.metrics.compressedSize
        });
        
        const processingTime = (performance.now() - startTime).toFixed(0);
        
        setStats({
          compressionRatio: result.metrics.compressionRatio,
          psnr: result.metrics.psnr,
          mse: result.metrics.mse,
          spaceSaved: result.metrics.spaceSaved,
          time: processingTime
        });
      } else {
        console.error('Compression failed:', result.error);
        alert(`Compression failed: ${result.error}`);
      }
      
      setProcessing(false);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to connect to compression API. Make sure Flask server is running on localhost:5000');
      setProcessing(false);
    }
  };

  const compressImage = () => {
    if (useAPI) {
      compressImageWithAPI();
    } else {
      compressImageLocal();
    }
  };

  const downloadCompressed = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.href = compressedImage.src;
    link.download = 'compressed_image.jpg';
    link.click();
  };

  const resetImage = () => {
    setImage(null);
    setOriginalImageData(null);
    setCompressedImage(null);
    setCompressedImageData(null);
    setCartoonResult(null);
    setEnhancementResult(null);
    setStats(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* Processing Method Toggle */}
        <div className="flex justify-center mb-6 animate-fadeInDown">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Processing Method:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setUseAPI(false)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    !useAPI 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🚀 JavaScript (Fast)
                </button>
                <button
                  onClick={() => setUseAPI(true)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    useAPI 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🐍 Python API (Advanced)
                </button>
              </div>
            </div>
            {useAPI && (
              <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                ⚠️ Make sure Python server is running on localhost:5000
              </div>
            )}
          </div>
        </div>

        {/* Module Navigation */}
        <div className="flex justify-center mb-6 animate-fadeInDown">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">DIP Modules:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveModule('compression')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeModule === 'compression'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📦 Compression
                </button>
                <button
                  onClick={() => setActiveModule('cartoon')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeModule === 'cartoon'
                      ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🎨 Cartoon
                </button>
                <button
                  onClick={() => setActiveModule('enhancement')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeModule === 'enhancement'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📊 Enhancement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Image Button */}
        {image && (
          <div className="flex justify-center mb-6 animate-fadeInDown">
            <button
              onClick={resetImage}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-2xl hover:shadow-purple-500/60 hover:scale-105 transition-all duration-300 border-2 border-white/30 flex items-center gap-3"
            >
              <span className="text-2xl">🔄</span>
              Change Image
              <span className="text-2xl">🖼️</span>
            </button>
          </div>
        )}

        {!image && <UploadZone onUpload={handleImageUpload} />}

        {/* Compression Module */}
        {image && activeModule === 'compression' && !processing && (
          <ControlsPanel
            quality={quality}
            setQuality={setQuality}
            blockSize={blockSize}
            setBlockSize={setBlockSize}
            onCompress={compressImage}
            onDownload={downloadCompressed}
            hasCompressed={!!compressedImage}
          />
        )}

        {/* Cartoon Module */}
        {image && activeModule === 'cartoon' && !processing && (
          <CartoonModule
            originalImage={image}
            onCartoonCreated={setCartoonResult}
            useAPI={useAPI}
          />
        )}

        {/* Histogram Equalization Module */}
        {image && activeModule === 'enhancement' && !processing && (
          <HistogramEqualizationModule
            originalImage={image}
            onEnhancementCreated={setEnhancementResult}
            useAPI={useAPI}
          />
        )}

        {processing && <LoadingSpinner />}

        {/* Image Comparison Slider - Show for compression results ONLY */}
        {image && compressedImage && activeModule === 'compression' && !processing && (
          <ImageComparisonSlider
            originalSrc={image.src}
            compressedSrc={compressedImage.src}
          />
        )}

        {/* Results Grid - Show ONLY for compression module */}
        {image && activeModule === 'compression' && !processing && (
          <ResultsGrid
            originalImage={image}
            compressedImage={compressedImage}
            cartoonResult={null}
            enhancementResult={null}
            stats={stats}
          />
        )}

        {/* Histogram Comparison - Show for compression module ONLY */}
        {originalImageData && compressedImageData && activeModule === 'compression' && !processing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 animate-fadeInUp-delay-4">
            <HistogramChart
              imageData={originalImageData}
              title="Original"
              color="from-amber-100 via-orange-100 to-red-100"
            />
            <HistogramChart
              imageData={compressedImageData}
              title="Compressed"
              color="from-emerald-100 via-teal-100 to-cyan-100"
            />
          </div>
        )}

        {/* Cartoon Results Display - ONLY for cartoon module */}
        {cartoonResult && activeModule === 'cartoon' && !processing && (
          <div className="mb-10 animate-fadeInUp-delay-4">
            <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-pink-300">
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-700 via-rose-700 to-orange-700 bg-clip-text text-transparent mb-8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center text-3xl shadow-2xl animate-bounce">
                  🎭
                </div>
                Cartoon Transformation Results
              </h2>

              {/* Before & After Comparison */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-pink-800 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">📸</span>
                    Original Photo
                  </h3>
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border-4 border-pink-300 group hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={image.src} 
                      alt="Original" 
                      className="w-full h-auto max-h-96 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-black text-orange-800 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">🎨</span>
                    Cartoon Style
                  </h3>
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border-4 border-orange-300 group hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={cartoonResult.src} 
                      alt="Cartoon" 
                      className="w-full h-auto max-h-96 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {cartoonResult.style?.replace('_', ' ').toUpperCase() || 'CARTOON'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transformation Settings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-pink-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">🎭</div>
                  <div className="text-xl font-black text-pink-600 mb-2">{cartoonResult.style?.replace('_', ' ') || 'Classic'}</div>
                  <div className="text-sm text-pink-700 font-semibold">Cartoon Style</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-rose-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-3xl font-black text-rose-600 mb-2">{cartoonResult.intensity || 5}</div>
                  <div className="text-sm text-rose-700 font-semibold">Effect Intensity</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-orange-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">🌈</div>
                  <div className="text-3xl font-black text-orange-600 mb-2">{cartoonResult.colorLevels || 8}</div>
                  <div className="text-sm text-orange-700 font-semibold">Color Levels</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-red-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">{cartoonResult.method?.includes('Python') ? '🐍' : '🚀'}</div>
                  <div className="text-lg font-black text-red-600 mb-2">{cartoonResult.method || 'JavaScript'}</div>
                  <div className="text-sm text-red-700 font-semibold">Processing Method</div>
                </div>
              </div>

              {/* Download Section */}
              <div className="text-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = cartoonResult.src;
                    link.download = `cartoon_${cartoonResult.style || 'image'}.jpg`;
                    link.click();
                  }}
                  className="px-12 py-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">💾</span>
                    Download Cartoon Image
                    <span className="text-2xl">🎨</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhancement Results Display - ONLY for enhancement module */}
        {enhancementResult && activeModule === 'enhancement' && !processing && (
          <div className="mb-10 animate-fadeInUp-delay-4">
            <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-green-300">
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-2xl animate-pulse">
                  📊
                </div>
                Image Enhancement Results
              </h2>

              {/* Before & After Comparison */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-green-800 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">📸</span>
                    Original Image
                  </h3>
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border-4 border-green-300 group hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={image.src} 
                      alt="Original" 
                      className="w-full h-auto max-h-96 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-black text-emerald-800 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">✨</span>
                    Enhanced Image
                  </h3>
                  <div className="relative overflow-hidden rounded-2xl shadow-lg border-4 border-emerald-300 group hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={enhancementResult.src} 
                      alt="Enhanced" 
                      className="w-full h-auto max-h-96 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {enhancementResult.type?.replace('_', ' ').toUpperCase() || 'ENHANCED'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Histogram Comparison */}
              {enhancementResult.histograms && (
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="text-center">
                    <h4 className="text-xl font-black text-red-700 mb-4 flex items-center justify-center gap-2">
                      <span className="text-2xl">📉</span>
                      Original Histogram
                    </h4>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-300">
                      <img 
                        src={enhancementResult.histograms.original} 
                        alt="Original Histogram" 
                        className="w-full rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-xl font-black text-emerald-700 mb-4 flex items-center justify-center gap-2">
                      <span className="text-2xl">📈</span>
                      Enhanced Histogram
                    </h4>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-emerald-300">
                      <img 
                        src={enhancementResult.histograms.enhanced} 
                        alt="Enhanced Histogram" 
                        className="w-full rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enhancement Metrics (Python API) */}
              {enhancementResult.metrics && (
                <div className="mb-8">
                  <h4 className="text-xl font-black text-green-800 mb-6 text-center">Enhancement Quality Metrics</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-blue-200 hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">📈</div>
                      <div className="text-2xl font-black text-blue-600 mb-2">{enhancementResult.metrics.contrast_improvement}%</div>
                      <div className="text-sm text-blue-700 font-semibold">Contrast Gain</div>
                    </div>
                    <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-purple-200 hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">💡</div>
                      <div className="text-2xl font-black text-purple-600 mb-2">{enhancementResult.metrics.enhanced_entropy}</div>
                      <div className="text-sm text-purple-700 font-semibold">Information Content</div>
                    </div>
                    <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-indigo-200 hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">☀️</div>
                      <div className="text-2xl font-black text-indigo-600 mb-2">{enhancementResult.metrics.enhanced_brightness}</div>
                      <div className="text-sm text-indigo-700 font-semibold">Avg Brightness</div>
                    </div>
                    <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-teal-200 hover:shadow-lg transition-all">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-2xl font-black text-teal-600 mb-2">{enhancementResult.metrics.enhanced_contrast}</div>
                      <div className="text-sm text-teal-700 font-semibold">Std Deviation</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhancement Settings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-green-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-lg font-black text-green-600 mb-2">{enhancementResult.type?.replace('_', ' ') || 'Global'}</div>
                  <div className="text-sm text-green-700 font-semibold">Enhancement Method</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-emerald-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">✂️</div>
                  <div className="text-2xl font-black text-emerald-600 mb-2">{enhancementResult.clipLimit || 'N/A'}</div>
                  <div className="text-sm text-emerald-700 font-semibold">Clip Limit</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-teal-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">⚏</div>
                  <div className="text-2xl font-black text-teal-600 mb-2">{enhancementResult.tileGridSize || 'N/A'}</div>
                  <div className="text-sm text-teal-700 font-semibold">Tile Size</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 text-center border-2 border-cyan-200 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-2">{enhancementResult.method?.includes('Python') ? '🐍' : '🚀'}</div>
                  <div className="text-lg font-black text-cyan-600 mb-2">{enhancementResult.method || 'JavaScript'}</div>
                  <div className="text-sm text-cyan-700 font-semibold">Processing Method</div>
                </div>
              </div>

              {/* Download Section */}
              <div className="text-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = enhancementResult.src;
                    link.download = `enhanced_${enhancementResult.type || 'image'}.jpg`;
                    link.click();
                  }}
                  className="px-12 py-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">💾</span>
                    Download Enhanced Image
                    <span className="text-2xl">✨</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section - Show for compression module ONLY */}
        {stats && activeModule === 'compression' && !processing && <StatsSection stats={stats} />}
      </div>
    </div>
  );
}

export default App;
