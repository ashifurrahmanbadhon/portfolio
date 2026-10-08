const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImage() {
  const inputPath = path.join(process.cwd(), 'public', 'ashifur.jpeg');
  const darkBlendOutputPath = path.join(process.cwd(), 'public', 'ashifur-dark-blend.webp');

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  console.log(`Processing image: ${width}x${height}`);

  const isBg = new Uint8Array(width * height);
  const queue = [];

  function isWhitePixel(idx) {
    const r = data[idx * 3];
    const g = data[idx * 3 + 1];
    const b = data[idx * 3 + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC >= 222 && (maxC - minC) < 28;
  }

  // Seed flood fill
  for (let x = 0; x < width; x++) {
    if (isWhitePixel(x)) {
      isBg[x] = 1;
      queue.push(x);
    }
  }
  for (let y = 0; y < 660; y++) {
    const leftIdx = y * width;
    if (isWhitePixel(leftIdx) && !isBg[leftIdx]) {
      isBg[leftIdx] = 1;
      queue.push(leftIdx);
    }
    const rightIdx = y * width + (width - 1);
    if (isWhitePixel(rightIdx) && !isBg[rightIdx]) {
      isBg[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1,
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
    ];

    for (const n of neighbors) {
      if (n !== -1 && isBg[n] === 0) {
        if (isWhitePixel(n)) {
          isBg[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Calculate distance from background (for smooth boundary de-fringing)
  const distFromBg = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    distFromBg[i] = isBg[i] ? 0 : 999;
  }

  // Multi-pass distance transform (manhattan approx)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (distFromBg[i] > 0) {
        distFromBg[i] = Math.min(distFromBg[i], distFromBg[i - 1] + 1, distFromBg[i - width] + 1);
      }
    }
  }
  for (let y = height - 2; y >= 1; y--) {
    for (let x = width - 2; x >= 1; x--) {
      const i = y * width + x;
      if (distFromBg[i] > 0) {
        distFromBg[i] = Math.min(distFromBg[i], distFromBg[i + 1] + 1, distFromBg[i + width] + 1);
      }
    }
  }

  const rgbDarkBlend = Buffer.alloc(width * height * 3);
  const bgBaseR = 11, bgBaseG = 15, bgBaseB = 23; // #0b0f17 website dark background

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const d = distFromBg[i];

      // Atmospheric background color
      const distFromCenter = Math.hypot(x - 384, y - 350);
      const glowFactor = Math.max(0, 1 - distFromCenter / 420);
      const bgR = Math.min(255, Math.round(bgBaseR + glowFactor * 10));
      const bgG = Math.min(255, Math.round(bgBaseG + glowFactor * 32));
      const bgB = Math.min(255, Math.round(bgBaseB + glowFactor * 22));

      if (d === 0) {
        // Pure background
        rgbDarkBlend[i * 3] = bgR;
        rgbDarkBlend[i * 3 + 1] = bgG;
        rgbDarkBlend[i * 3 + 2] = bgB;
      } else {
        let fgR = data[i * 3];
        let fgG = data[i * 3 + 1];
        let fgB = data[i * 3 + 2];

        // Smooth alpha for boundary (d = 1 to 4)
        let alpha = 1.0;
        if (d < 3.5) {
          alpha = Math.min(1.0, (d - 0.2) / 2.8);
          // De-fringe: hair and jacket edge pixels bleached by white backdrop
          // remove white contamination
          const whiteDilation = 1 - alpha;
          fgR = Math.max(0, fgR - Math.round(whiteDilation * 200));
          fgG = Math.max(0, fgG - Math.round(whiteDilation * 200));
          fgB = Math.max(0, fgB - Math.round(whiteDilation * 200));
        }

        // Bottom fade: melt bottom of the suit into #0b0f17
        let bottomFade = 1.0;
        if (y > height * 0.76) {
          const t = (y - height * 0.76) / (height * 0.24);
          bottomFade = Math.max(0, 1.0 - t * 1.0);
        }

        const effAlpha = alpha * bottomFade;

        rgbDarkBlend[i * 3] = Math.round(fgR * effAlpha + bgR * (1 - effAlpha));
        rgbDarkBlend[i * 3 + 1] = Math.round(fgG * effAlpha + bgG * (1 - effAlpha));
        rgbDarkBlend[i * 3 + 2] = Math.round(fgB * effAlpha + bgB * (1 - effAlpha));
      }
    }
  }

  // Save webp and jpg
  await sharp(rgbDarkBlend, { raw: { width, height, channels: 3 } })
    .webp({ quality: 96 })
    .toFile(darkBlendOutputPath);

  await sharp(rgbDarkBlend, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 94 })
    .toFile(path.join(process.cwd(), 'public', 'ashifur-dark-blend.jpg'));

  // Also transparent PNG with de-fringed edges and bottom fade
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const d = distFromBg[i];
      if (d === 0) {
        rgbaBuffer[i * 4] = 0;
        rgbaBuffer[i * 4 + 1] = 0;
        rgbaBuffer[i * 4 + 2] = 0;
        rgbaBuffer[i * 4 + 3] = 0;
      } else {
        let fgR = data[i * 3];
        let fgG = data[i * 3 + 1];
        let fgB = data[i * 3 + 2];
        let alpha = 1.0;
        if (d < 3.5) {
          alpha = Math.min(1.0, (d - 0.2) / 2.8);
          const whiteDilation = 1 - alpha;
          fgR = Math.max(0, fgR - Math.round(whiteDilation * 200));
          fgG = Math.max(0, fgG - Math.round(whiteDilation * 200));
          fgB = Math.max(0, fgB - Math.round(whiteDilation * 200));
        }

        let bottomFade = 1.0;
        if (y > height * 0.78) {
          const t = (y - height * 0.78) / (height * 0.22);
          bottomFade = Math.max(0, 1.0 - t);
        }

        rgbaBuffer[i * 4] = fgR;
        rgbaBuffer[i * 4 + 1] = fgG;
        rgbaBuffer[i * 4 + 2] = fgB;
        rgbaBuffer[i * 4 + 3] = Math.round(alpha * bottomFade * 255);
      }
    }
  }

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'ashifur-transparent.png'));

  console.log('Successfully generated de-fringed ashifur-dark-blend and transparent images!');
}

processImage().catch(console.error);
