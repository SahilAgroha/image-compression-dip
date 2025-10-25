function ResultsGrid({ originalImage, compressedImage, stats }) {
  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="results-grid">
      <div className="result-card">
        <h3>
          <div className="card-icon icon-original">🖼️</div>
          Original Image
        </h3>
        <div className="image-container">
          <img src={originalImage.src} alt="Original" />
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">File Size</div>
            <div className="metric-value">{formatBytes(originalImage.size)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Dimensions</div>
            <div className="metric-value">{originalImage.width}x{originalImage.height}</div>
          </div>
        </div>
      </div>

      {compressedImage && (
        <div className="result-card">
          <h3>
            <div className="card-icon icon-compressed">✨</div>
            Compressed Image
          </h3>
          <div className="image-container">
            <img src={compressedImage.src} alt="Compressed" />
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">File Size</div>
              <div className="metric-value">{formatBytes(compressedImage.size)}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Compression</div>
              <div className="metric-value">{stats.compressionRatio}:1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsGrid;
