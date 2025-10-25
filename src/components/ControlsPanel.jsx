function ControlsPanel({ quality, setQuality, blockSize, setBlockSize, onCompress, onDownload, hasCompressed }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 rounded-[2rem] p-8 md:p-10 mb-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-violet-300 animate-fadeInUp-delay-2">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative">
        {/* Compression Presets - NEW FEATURE #3 */}
        <div className="mb-8">
          <h4 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🎚️</span>
            Quick Presets
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => { setQuality(90); setBlockSize(8); }}
              className="px-4 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all border-2 border-green-300"
            >
              <div className="text-2xl mb-1">🏆</div>
              High Quality
              <div className="text-xs opacity-90">90% • 8x8</div>
            </button>
            <button 
              onClick={() => { setQuality(50); setBlockSize(8); }}
              className="px-4 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all border-2 border-blue-300"
            >
              <div className="text-2xl mb-1">⚖️</div>
              Balanced
              <div className="text-xs opacity-90">50% • 8x8</div>
            </button>
            <button 
              onClick={() => { setQuality(20); setBlockSize(16); }}
              className="px-4 py-4 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all border-2 border-orange-300"
            >
              <div className="text-2xl mb-1">🚀</div>
              Max Compression
              <div className="text-xs opacity-90">20% • 16x16</div>
            </button>
          </div>
        </div>

        {/* Quality Control */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-violet-200">
          <div className="flex justify-between items-center mb-5">
            <span className="font-black text-gray-800 text-lg md:text-xl flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Compression Quality
            </span>
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-black text-lg shadow-lg animate-pulse">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full appearance-none cursor-pointer shadow-lg
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-yellow-400 [&::-webkit-slider-thumb]:to-orange-500
                     [&::-webkit-slider-thumb]:shadow-2xl [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
          />
        </div>

        {/* Block Size Control */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-fuchsia-200">
          <div className="flex justify-between items-center mb-5">
            <span className="font-black text-gray-800 text-lg md:text-xl flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Block Size
            </span>
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-lg shadow-lg animate-pulse">
              {blockSize}x{blockSize}
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="16"
            step="4"
            value={blockSize}
            onChange={(e) => setBlockSize(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full appearance-none cursor-pointer shadow-lg
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-green-400 [&::-webkit-slider-thumb]:to-emerald-500
                     [&::-webkit-slider-thumb]:shadow-2xl [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 md:gap-6 flex-wrap">
          <button
            onClick={onCompress}
            className="relative flex-1 min-w-[220px] px-10 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl hover:shadow-red-500/60 hover:scale-105 transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-3xl animate-bounce">⚡</span>
              Compress Now
              <span className="text-3xl">🚀</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          {hasCompressed && (
            <button
              onClick={onDownload}
              className="relative flex-1 min-w-[220px] px-10 py-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-3xl animate-bounce">💾</span>
                Download
                <span className="text-3xl">✨</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlsPanel;
