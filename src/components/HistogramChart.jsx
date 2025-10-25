function HistogramChart({ imageData, title, color }) {
  const calculateHistogram = () => {
    const r = new Array(256).fill(0);
    const g = new Array(256).fill(0);
    const b = new Array(256).fill(0);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      r[imageData.data[i]]++;
      g[imageData.data[i + 1]]++;
      b[imageData.data[i + 2]]++;
    }
    
    const maxR = Math.max(...r);
    const maxG = Math.max(...g);
    const maxB = Math.max(...b);
    
    return {
      r: r.map(v => (v / maxR) * 100),
      g: g.map(v => (v / maxG) * 100),
      b: b.map(v => (v / maxB) * 100)
    };
  };

  const histogram = calculateHistogram();
  
  // Sample every 4th value for display
  const sampledIndices = Array.from({ length: 64 }, (_, i) => i * 4);

  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-6 border-4 ${color.includes('amber') ? 'border-amber-300' : 'border-emerald-300'} shadow-xl`}>
      <h4 className="font-black text-lg mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-xl">📊</span>
        {title} Histogram
      </h4>
      
      <div className="space-y-3">
        {/* Red Channel */}
        <div>
          <div className="text-xs font-bold text-red-700 mb-1">Red Channel</div>
          <div className="flex items-end gap-[2px] h-16 bg-white/50 rounded-lg p-2">
            {sampledIndices.map((i) => (
              <div
                key={`r-${i}`}
                className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-sm transition-all hover:opacity-70"
                style={{ height: `${histogram.r[i]}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Green Channel */}
        <div>
          <div className="text-xs font-bold text-green-700 mb-1">Green Channel</div>
          <div className="flex items-end gap-[2px] h-16 bg-white/50 rounded-lg p-2">
            {sampledIndices.map((i) => (
              <div
                key={`g-${i}`}
                className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-sm transition-all hover:opacity-70"
                style={{ height: `${histogram.g[i]}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Blue Channel */}
        <div>
          <div className="text-xs font-bold text-blue-700 mb-1">Blue Channel</div>
          <div className="flex items-end gap-[2px] h-16 bg-white/50 rounded-lg p-2">
            {sampledIndices.map((i) => (
              <div
                key={`b-${i}`}
                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm transition-all hover:opacity-70"
                style={{ height: `${histogram.b[i]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600 text-center font-semibold">
        Pixel intensity distribution (0-255)
      </div>
    </div>
  );
}

export default HistogramChart;
