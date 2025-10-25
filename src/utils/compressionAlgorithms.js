export function performDCTCompression(imageData, quality, blockSize) {
  const width = imageData.width;
  const height = imageData.height;
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      for (let c = 0; c < 3; c++) {
        const block = extractBlock(data, width, height, x, y, blockSize, c);
        const dctBlock = dct2D(block, blockSize);
        const quantized = quantizeBlock(dctBlock, quality, blockSize);
        const idctBlock = idct2D(quantized, blockSize);
        insertBlock(data, width, height, x, y, blockSize, c, idctBlock);
      }
    }
  }
  
  return new ImageData(data, width, height);
}

function extractBlock(data, width, height, startX, startY, blockSize, channel) {
  const block = [];
  for (let y = 0; y < blockSize; y++) {
    for (let x = 0; x < blockSize; x++) {
      const px = Math.min(startX + x, width - 1);
      const py = Math.min(startY + y, height - 1);
      const idx = (py * width + px) * 4 + channel;
      block.push(data[idx]);
    }
  }
  return block;
}

function insertBlock(data, width, height, startX, startY, blockSize, channel, block) {
  for (let y = 0; y < blockSize; y++) {
    for (let x = 0; x < blockSize; x++) {
      const px = Math.min(startX + x, width - 1);
      const py = Math.min(startY + y, height - 1);
      const idx = (py * width + px) * 4 + channel;
      data[idx] = Math.max(0, Math.min(255, Math.round(block[y * blockSize + x])));
    }
  }
}

function dct2D(block, size) {
  const result = new Array(size * size).fill(0);
  const sqrt2 = Math.sqrt(2);
  const sqrtN = Math.sqrt(size);
  
  for (let u = 0; u < size; u++) {
    for (let v = 0; v < size; v++) {
      let sum = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          sum += block[x * size + y] * 
                 Math.cos((2 * x + 1) * u * Math.PI / (2 * size)) *
                 Math.cos((2 * y + 1) * v * Math.PI / (2 * size));
        }
      }
      const cu = u === 0 ? 1 / sqrtN : sqrt2 / sqrtN;
      const cv = v === 0 ? 1 / sqrtN : sqrt2 / sqrtN;
      result[u * size + v] = cu * cv * sum;
    }
  }
  return result;
}

function idct2D(block, size) {
  const result = new Array(size * size).fill(0);
  const sqrt2 = Math.sqrt(2);
  const sqrtN = Math.sqrt(size);
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let sum = 0;
      for (let u = 0; u < size; u++) {
        for (let v = 0; v < size; v++) {
          const cu = u === 0 ? 1 / sqrtN : sqrt2 / sqrtN;
          const cv = v === 0 ? 1 / sqrtN : sqrt2 / sqrtN;
          sum += cu * cv * block[u * size + v] *
                 Math.cos((2 * x + 1) * u * Math.PI / (2 * size)) *
                 Math.cos((2 * y + 1) * v * Math.PI / (2 * size));
        }
      }
      result[x * size + y] = sum;
    }
  }
  return result;
}

function quantizeBlock(block, quality, size) {
  const quantMatrix = generateQuantizationMatrix(quality, size);
  return block.map((val, idx) => Math.round(val / quantMatrix[idx]) * quantMatrix[idx]);
}

function generateQuantizationMatrix(quality, size) {
  const matrix = new Array(size * size);
  const q = quality < 0.5 ? (1 / quality) * 25 : (2 - 2 * quality) * 25;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const val = 1 + (i + j) * q / 10;
      matrix[i * size + j] = Math.max(1, val);
    }
  }
  return matrix;
}

export function calculatePSNR(original, compressed) {
  const mse = calculateMSE(original, compressed);
  if (mse === 0) return 100;
  const maxPixel = 255;
  return 10 * Math.log10((maxPixel * maxPixel) / mse);
}

export function calculateMSE(original, compressed) {
  let sum = 0;
  const len = original.data.length;
  for (let i = 0; i < len; i += 4) {
    for (let j = 0; j < 3; j++) {
      const diff = original.data[i + j] - compressed.data[i + j];
      sum += diff * diff;
    }
  }
  return sum / (len * 0.75);
}
