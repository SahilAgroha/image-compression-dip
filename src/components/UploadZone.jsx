import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function UploadZone({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`
        bg-white/95 backdrop-blur-lg rounded-3xl p-16 text-center
        border-3 border-dashed transition-all duration-300 cursor-pointer
        mb-8 shadow-lg hover:shadow-2xl hover:-translate-y-2
        ${dragOver ? 'border-primary-500 bg-primary-50 scale-105' : 'border-gray-300'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl animate-bounce-slow">
        📁
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-3">Upload Your Image</h3>
      <p className="text-gray-600 text-lg mb-6">Drag and drop an image here or click to browse</p>
      <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        Choose Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </motion.div>
  );
}

export default UploadZone;
