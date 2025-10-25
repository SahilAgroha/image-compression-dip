import { useState } from 'react';

function ImageComparisonSlider({ originalSrc, compressedSrc }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="mb-10 animate-fadeInUp-delay-3">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          Interactive Comparison
        </h3>
      </div>
      
      <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border-4 border-indigo-400 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Compressed Image (Background) */}
        <img 
          src={compressedSrc} 
          alt="Compressed" 
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Original Image (Clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden transition-all duration-100"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={originalSrc} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
        
        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(e.target.value)}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
        
        {/* Slider Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 shadow-2xl pointer-events-none z-10 transition-all duration-100"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-indigo-500 animate-pulse">
            ↔️
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg border-2 border-yellow-300 pointer-events-none z-5">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg border-2 border-emerald-300 pointer-events-none z-5">
          Compressed
        </div>
        
        {/* Position Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold pointer-events-none z-5">
          {Math.round(sliderPosition)}%
        </div>
      </div>
    </div>
  );
}

export default ImageComparisonSlider;
