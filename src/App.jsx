import { useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ControlsPanel from './components/ControlsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsGrid from './components/ResultsGrid';
import StatsSection from './components/StatsSection';
import ImageComparisonSlider from './components/ImageComparisonSlider';
import HistogramChart from './components/HistogramChart';
import { 
  performDCTCompression, 
  calculatePSNR, 
  calculateMSE 
} from './utils/compressionAlgorithms';

function App() {
  const [image, setImage] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedImageData, setCompressedImageData] = useState(null);
  const [quality, setQuality] = useState(50);
  const [blockSize, setBlockSize] = useState(8);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState(null);

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
        setCompressedImage(null);
        setCompressedImageData(null);
        setStats(null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!originalImageData) return;

    setProcessing(true);
    const startTime = performance.now();

    setTimeout(() => {
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
    }, 100);
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
    setStats(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* Change Image Button - Always visible when image is loaded */}
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

        {image && !processing && (
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

        {processing && <LoadingSpinner />}

        {/* Feature #1: Image Comparison Slider */}
        {image && compressedImage && !processing && (
          <ImageComparisonSlider
            originalSrc={image.src}
            compressedSrc={compressedImage.src}
          />
        )}

        {image && !processing && (
          <ResultsGrid
            originalImage={image}
            compressedImage={compressedImage}
            stats={stats}
          />
        )}

        {/* Feature #4: Histogram Comparison */}
        {originalImageData && compressedImageData && !processing && (
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

        {/* Feature #5: Stats with Explanations */}
        {stats && !processing && <StatsSection stats={stats} />}
      </div>
    </div>
  );
}

export default App;
