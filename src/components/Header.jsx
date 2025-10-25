function Header() {
  return (
    <header className="text-center mb-16 animate-fadeInDown">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 blur-3xl opacity-50 animate-pulse"></div>
        <h1 className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl tracking-tight">
          🎨 Image Compression Lab
        </h1>
      </div>
      <p className="text-white text-lg md:text-2xl font-semibold bg-black/30 backdrop-blur-sm px-8 py-3 rounded-full inline-block border-2 border-white/20">
        ⚡ DCT-based JPEG Compression • Real-time Visualization
      </p>
    </header>
  );
}

export default Header;