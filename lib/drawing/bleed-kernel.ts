/**
 * Pixel-level ink bleed operations for the drawing worker.
 * Operates on ImageData within a bounding box for efficiency.
 */

/** Apply morphological dilation — expands non-transparent pixels outward */
export function dilate(
  imageData: ImageData,
  radius: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);
  const r = Math.ceil(radius);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let maxAlpha = 0;
      let bestR = 0, bestG = 0, bestB = 0;

      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

          const nIdx = (ny * width + nx) * 4;
          const alpha = data[nIdx + 3]!;
          if (alpha > maxAlpha) {
            maxAlpha = alpha;
            bestR = data[nIdx]!;
            bestG = data[nIdx + 1]!;
            bestB = data[nIdx + 2]!;
          }
        }
      }

      output[idx] = bestR;
      output[idx + 1] = bestG;
      output[idx + 2] = bestB;
      output[idx + 3] = maxAlpha;
    }
  }

  return new ImageData(output, width, height);
}

/** Apply Gaussian blur using two-pass separable filter */
export function gaussianBlur(
  imageData: ImageData,
  sigma: number
): ImageData {
  const { width, height } = imageData;
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = buildGaussianKernel(kernelSize, sigma);

  // Horizontal pass
  const horizontal = applyKernel1D(imageData.data, width, height, kernel, true);
  // Vertical pass
  const final = applyKernel1D(horizontal, width, height, kernel, false);

  return new ImageData(final as unknown as Uint8ClampedArray<ArrayBuffer>, width, height);
}

function buildGaussianKernel(size: number, sigma: number): Float32Array {
  const kernel = new Float32Array(size);
  const half = Math.floor(size / 2);
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - half;
    const value = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = value;
    sum += value;
  }

  for (let i = 0; i < size; i++) {
    kernel[i] = kernel[i]! / sum;
  }

  return kernel;
}

function applyKernel1D(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: Float32Array,
  horizontal: boolean
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const half = Math.floor(kernel.length / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let k = 0; k < kernel.length; k++) {
        const offset = k - half;
        let sx: number, sy: number;

        if (horizontal) {
          sx = Math.max(0, Math.min(width - 1, x + offset));
          sy = y;
        } else {
          sx = x;
          sy = Math.max(0, Math.min(height - 1, y + offset));
        }

        const idx = (sy * width + sx) * 4;
        const w = kernel[k]!;
        r += data[idx]! * w;
        g += data[idx + 1]! * w;
        b += data[idx + 2]! * w;
        a += data[idx + 3]! * w;
      }

      const outIdx = (y * width + x) * 4;
      output[outIdx] = r;
      output[outIdx + 1] = g;
      output[outIdx + 2] = b;
      output[outIdx + 3] = a;
    }
  }

  return output;
}

/**
 * Apply full ink bleed effect: dilate edges, blur, then composite
 * over the original so the core stays sharp.
 */
export function applyInkBleed(
  imageData: ImageData,
  dilateRadius: number = 0.3,
  blurSigma: number = 0.4
): ImageData {
  // Scale up radius for pixel-level operations (minimum 1px to have visible effect)
  const effectiveDilate = Math.max(1, Math.round(dilateRadius * 3));
  const effectiveSigma = Math.max(0.5, blurSigma * 2);

  const dilated = dilate(imageData, effectiveDilate);
  const blurred = gaussianBlur(dilated, effectiveSigma);

  // Composite: bleed layer underneath, original on top (core stays sharp)
  const { width, height } = imageData;
  const result = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < result.length; i += 4) {
    const origAlpha = imageData.data[i + 3]! / 255;
    const bleedAlpha = blurred.data[i + 3]! / 255;

    const outAlpha = origAlpha + bleedAlpha * (1 - origAlpha);

    if (outAlpha > 0) {
      result[i] =
        (imageData.data[i]! * origAlpha +
          blurred.data[i]! * bleedAlpha * (1 - origAlpha)) /
        outAlpha;
      result[i + 1] =
        (imageData.data[i + 1]! * origAlpha +
          blurred.data[i + 1]! * bleedAlpha * (1 - origAlpha)) /
        outAlpha;
      result[i + 2] =
        (imageData.data[i + 2]! * origAlpha +
          blurred.data[i + 2]! * bleedAlpha * (1 - origAlpha)) /
        outAlpha;
    }

    result[i + 3] = outAlpha * 255;
  }

  return new ImageData(result, width, height);
}
