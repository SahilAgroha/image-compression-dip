function StatsSection({ stats }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100 rounded-[2rem] p-10 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.25)] border-4 border-slate-300 animate-fadeInUp-delay-4">
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      
      <h2 className="relative text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-10 flex items-center gap-5">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
          📊
        </div>
        Compression Statistics
      </h2>
      
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-7 rounded-3xl border-4 border-blue-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 group">
          <div className="text-xs md:text-sm text-blue-100 mb-3 uppercase font-black tracking-widest flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            PSNR
          </div>
          <div className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">
            {stats.psnr} dB
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-7 rounded-3xl border-4 border-red-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-red-500/60 transition-all duration-300 group">
          <div className="text-xs md:text-sm text-red-100 mb-3 uppercase font-black tracking-widest flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            MSE
          </div>
          <div className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">
            {stats.mse}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-7 rounded-3xl border-4 border-purple-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/60 transition-all duration-300 group">
          <div className="text-xs md:text-sm text-purple-100 mb-3 uppercase font-black tracking-widest flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            Time
          </div>
          <div className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">
            {stats.time} ms
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-7 rounded-3xl border-4 border-green-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/60 transition-all duration-300 group">
          <div className="text-xs md:text-sm text-green-100 mb-3 uppercase font-black tracking-widest flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Saved
          </div>
          <div className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">
            {stats.spaceSaved}%
          </div>
        </div>
      </div>

      {/* Metrics Explanation - NEW FEATURE #5 */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-4 border-blue-300 rounded-3xl p-6 md:p-8 shadow-xl">
        <h4 className="font-black text-blue-900 text-xl mb-5 flex items-center gap-3">
          <span className="text-3xl">💡</span>
          What do these metrics mean?
        </h4>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white/70 rounded-2xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
            <div className="font-black text-blue-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              PSNR (Peak Signal-to-Noise Ratio)
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              Measures image quality after compression. <strong>Higher is better!</strong>
              <br/>• Above 40 dB = Excellent quality
              <br/>• 30-40 dB = Good quality
              <br/>• Below 30 dB = Noticeable degradation
            </p>
          </div>
          
          <div className="bg-white/70 rounded-2xl p-5 border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-lg">
            <div className="font-black text-red-800 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              MSE (Mean Squared Error)
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              Average squared difference between pixels. <strong>Lower is better!</strong>
              <br/>• 0 = Perfect match (lossless)
              <br/>• &lt;100 = Minimal distortion
              <br/>• &gt;500 = Visible quality loss
            </p>
          </div>
          
          <div className="bg-white/70 rounded-2xl p-5 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
            <div className="font-black text-purple-800 mb-2 flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              Processing Time
            </div>
            <p className="text-sm text-purple-700 leading-relaxed">
              Time taken to apply DCT compression algorithm.
              <br/>• Depends on image size and block size
              <br/>• Larger blocks = faster processing
              <br/>• Trade-off between speed and quality
            </p>
          </div>
          
          <div className="bg-white/70 rounded-2xl p-5 border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg">
            <div className="font-black text-green-800 mb-2 flex items-center gap-2">
              <span className="text-xl">💰</span>
              Space Saved
            </div>
            <p className="text-sm text-green-700 leading-relaxed">
              Percentage reduction in file size.
              <br/>• 50% = File is half the original size
              <br/>• Higher compression = more space saved
              <br/>• But may reduce image quality
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-3 border-yellow-400 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📌</span>
            <div>
              <div className="font-black text-orange-900 mb-2">DCT Compression Tips</div>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• <strong>Lower quality</strong> = smaller file size but more artifacts</li>
                <li>• <strong>Larger block size</strong> = faster but blockier results</li>
                <li>• <strong>8x8 blocks</strong> are standard in JPEG compression</li>
                <li>• Balance quality and file size for best results!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsSection;
