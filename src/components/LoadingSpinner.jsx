import { motion } from 'framer-motion';

function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-lg rounded-3xl p-16 text-center shadow-lg border border-gray-200"
    >
      <div className="relative w-28 h-28 mx-auto mb-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-200/30 animate-ping"></div>
        <div className="w-28 h-28 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
      <div className="text-2xl font-semibold text-gray-800 mb-3">Processing Your Image</div>
      <div className="text-gray-600 text-base">Applying DCT compression algorithm...</div>
      <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden mt-6">
        <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 progress-animation"></div>
      </div>
    </motion.div>
  );
}

export default LoadingSpinner;
