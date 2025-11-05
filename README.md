# 🎨 Complete Digital Image Processing Suite

A comprehensive web application for **Digital Image Processing** with dual **JavaScript** and **Python** implementations.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-red.svg)](https://flask.palletsprojects.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.8.0+-orange.svg)](https://opencv.org/)

## 📋 Overview

This project demonstrates **three core DIP techniques**:

1. **📦 DCT Image Compression** - Lossy compression using Discrete Cosine Transform
2. **🎨 Image Cartoonification** - Convert photos to artistic styles (Anime, Sketch, Comic, Oil Painting, Pop Art)
3. **📊 Histogram Equalization** - Enhance image contrast (Global, Adaptive, CLAHE, Color-preserving)

## ✨ Key Features

- **🔄 Dual Architecture**: Fast JavaScript + Advanced Python API processing
- **⚡ Real-time Toggle**: Switch between methods seamlessly
- **📊 Quality Metrics**: PSNR, MSE, compression ratio analysis
- **🎨 Interactive Controls**: Adjustable parameters with live preview
- **💾 Easy Download**: Save processed images instantly

## 🛠️ Tech Stack

| Frontend | Backend | Libraries |
|----------|---------|-----------|
| React 18 + Vite | Python 3.8+ + Flask | OpenCV 4.8+ |
| Tailwind CSS | Flask-CORS | NumPy, SciPy |
| Canvas API | Pillow (PIL) | Matplotlib |

## 📂 Project Structure
```bash
image-compression-dip/
├── src/ # React Frontend
│ ├── components/ # UI Components
│ ├── utils/ # DCT Algorithms
│ └── App.jsx # Main Application
├── backend/ # Python API
│ ├── app.py # Flask Server
│ ├── dct_compression.py
│ ├── image_cartoonification.py
│ └── histogram_equalization.py
└── package.json # Dependencies
```


## 🚀 Quick Setup & Run

### **Prerequisites**
node --version # Need 16.0+
python --version # Need 3.8+


### **Installation**
1. Clone repository
git clone https://github.com/SahilAgroha/image-compression-dip.git
cd image-compression-dip

2. Install frontend dependencies
npm install

3. Setup backend
cd backend
python -m venv venv

Activate virtual environment
Windows: venv\Scripts\activate
macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cd ..


### **Run Application**
Terminal 1 - Backend Server
cd backend && python app.py

Terminal 2 - Frontend Server
npm run dev

Open: http://localhost:3000


## 🎮 Usage Guide

1. **📤 Upload**: Drag & drop image (JPG, PNG, WebP, GIF)
2. **🔄 Select Method**: JavaScript (fast) or Python API (advanced)
3. **📦 Choose Module**: Compression, Cartoon, or Enhancement
4. **⚙️ Adjust Parameters**: Use sliders and controls
5. **🎯 Process**: Click main action button
6. **📊 Review Results**: Compare before/after with metrics
7. **💾 Download**: Save processed image

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status |
| POST | `/compress` | DCT compression |
| POST | `/cartoonify` | Cartoon effects |
| POST | `/histogram_equalize` | Enhancement |

### **Example Request**
const response = await fetch('http://localhost:5000/compress', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
image: 'data:image/jpeg;base64,/9j/4AAQ...',
quality: 75,
blockSize: 8
})
});


## 📊 Performance

| Operation | JavaScript | Python API | 
|-----------|------------|------------|
| DCT Compression | ~100ms | ~200ms |
| Cartoonification | ~150ms | ~300ms |
| Histogram EQ | ~80ms | ~250ms |

**System Requirements**: 4GB+ RAM, Dual-core CPU, Modern browser

## 🎓 Academic Context

Perfect for **Digital Image Processing** coursework covering:
- Frequency domain processing (DCT transforms)
- Spatial domain enhancement (histogram manipulation)
- Color space conversions (RGB, HSV, LAB)
- Quality assessment metrics (PSNR, MSE)
- Interactive algorithm demonstrations

