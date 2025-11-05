function ResultsGrid({ originalImage, compressedImage, cartoonResult, enhancementResult, stats }) {
  const hasResults = compressedImage || cartoonResult || enhancementResult;
  
  if (!originalImage || !hasResults) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 rounded-[2rem] p-10 md:p-12 mb-10 shadow-[0_30px_80px_rgba(0,0,0,0.25)] border-4 border-cyan-300 animate-fadeInUp-delay-3">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      
      <h2 className="relative text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-10 flex items-center gap-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
          {cartoonResult ? '🎨' : enhancementResult ? '📊' : '🖼️'}
        </div>
        Results Comparison
      </h2>
      
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Original Image */}
        <div className="group hover:-translate-y-4 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-4 border-cyan-300 shadow-xl">
            <h3 className="text-xl md:text-2xl font-black text-cyan-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📸</span>
              Original Image
            </h3>
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img 
                src={originalImage.src} 
                alt="Original" 
                className="w-full h-auto object-contain max-h-80"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white text-sm font-semibold">
                  {originalImage.width} × {originalImage.height}
                </div>
                <div className="text-white text-xs">
                  Size: {(originalImage.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processed Result */}
        <div className="group hover:-translate-y-4 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-4 border-indigo-300 shadow-xl">
            <h3 className="text-xl md:text-2xl font-black text-indigo-800 mb-6 flex items-center gap-3">
              {compressedImage && (
                <>
                  <span className="text-3xl">📦</span>
                  Compressed Image
                </>
              )}
              {cartoonResult && (
                <>
                  <span className="text-3xl">🎨</span>
                  Cartoon Style
                </>
              )}
              {enhancementResult && (
                <>
                  <span className="text-3xl">📊</span>
                  Enhanced Image
                </>
              )}
            </h3>
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              {compressedImage && (
                <>
                  <img 
                    src={compressedImage.src} 
                    alt="Compressed" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white text-sm font-semibold">
                      Quality: {((compressedImage.size / originalImage.size) * 100).toFixed(1)}%
                    </div>
                    <div className="text-white text-xs">
                      Size: {(compressedImage.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </>
              )}
              {cartoonResult && (
                <>
                  <img 
                    src={cartoonResult.src} 
                    alt="Cartoon" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white text-sm font-semibold">
                      Style: {cartoonResult.style?.replace('_', ' ') || 'Cartoon'}
                    </div>
                    <div className="text-white text-xs">
                      Intensity: {cartoonResult.intensity} | Colors: {cartoonResult.colorLevels}
                    </div>
                  </div>
                </>
              )}
              {enhancementResult && (
                <>
                  <img 
                    src={enhancementResult.src} 
                    alt="Enhanced" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white text-sm font-semibold">
                      Method: {enhancementResult.type?.replace('_', ' ') || 'Enhanced'}
                    </div>
                    <div className="text-white text-xs">
                      {enhancementResult.clipLimit && `Clip: ${enhancementResult.clipLimit} | `}
                      {enhancementResult.tileGridSize && `Tile: ${enhancementResult.tileGridSize}×${enhancementResult.tileGridSize}`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats for Compression */}
      {stats && compressedImage && (
        <div className="relative mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 md:p-6 rounded-3xl border-4 border-green-300 text-center hover:scale-105 transition-transform">
            <div className="text-2xl md:text-3xl font-black text-white mb-2">{stats.psnr}</div>
            <div className="text-xs md:text-sm text-green-100 uppercase font-black tracking-wider">PSNR (dB)</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 md:p-6 rounded-3xl border-4 border-blue-300 text-center hover:scale-105 transition-transform">
            <div className="text-2xl md:text-3xl font-black text-white mb-2">{stats.spaceSaved}%</div>
            <div className="text-xs md:text-sm text-blue-100 uppercase font-black tracking-wider">Saved</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 md:p-6 rounded-3xl border-4 border-purple-300 text-center hover:scale-105 transition-transform">
            <div className="text-2xl md:text-3xl font-black text-white mb-2">{stats.time}</div>
            <div className="text-xs md:text-sm text-purple-100 uppercase font-black tracking-wider">MS</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 md:p-6 rounded-3xl border-4 border-orange-300 text-center hover:scale-105 transition-transform">
            <div className="text-2xl md:text-3xl font-black text-white mb-2">{stats.compressionRatio}</div>
            <div className="text-xs md:text-sm text-orange-100 uppercase font-black tracking-wider">RATIO</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsGrid;
