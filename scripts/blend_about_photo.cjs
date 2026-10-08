const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function blendAboutPhoto() {
  const inputPath = 'C:/Users/ashif/.gemini/antigravity-ide/brain/5884d976-8893-4a22-9212-8b239130f549/.user_uploaded/media_1791483383764.jpg';
  const outWebp = path.join(process.cwd(), 'public', 'ashifur-about-blend.webp');
  const outJpg = path.join(process.cwd(), 'public', 'ashifur-about-blend.jpg');

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  console.log(`Processing About Photo: ${width}x${height}`);

  const output = Buffer.alloc(width * height * 3);
  const bgR = 11, bgG = 15, bgB = 23; // #0b0f17 website base color

  const cx = width / 2;     // 384
  const cy = height * 0.44; // ~450 (center around face/chest)
  const maxRx = width * 0.48;
  const maxRy = height * 0.52;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const fgR = data[idx];
      const fgG = data[idx + 1];
      const fgB = data[idx + 2];

      // Normalized elliptical distance from center
      const dx = (x - cx) / maxRx;
      const dy = (y - cy) / maxRy;
      const ellipDist = Math.sqrt(dx * dx + dy * dy);

      // Edge fade calculation
      let edgeFactor = 1.0;
      if (ellipDist > 0.72) {
        const t = Math.min(1.0, (ellipDist - 0.72) / 0.28);
        // Smooth hermite step
        const smoothT = t * t * (3 - 2 * t);
        edgeFactor = 1.0 - smoothT;
      }

      // Linear edge falloffs
      // Left and right edge falloff
      const distFromXEdge = Math.min(x, width - 1 - x);
      let xEdgeFactor = 1.0;
      if (distFromXEdge < 70) {
        const t = distFromXEdge / 70;
        xEdgeFactor = t * t * (3 - 2 * t);
      }

      // Top edge falloff
      let topEdgeFactor = 1.0;
      if (y < 65) {
        const t = y / 65;
        topEdgeFactor = t * t * (3 - 2 * t);
      }

      // Bottom edge melt (suit fading into #0b0f17)
      let bottomEdgeFactor = 1.0;
      if (y > height * 0.76) {
        const t = (height - 1 - y) / (height * 0.24);
        bottomEdgeFactor = Math.max(0, t * t * (3 - 2 * t));
      }

      // Combined vignette alpha
      const alpha = Math.max(0, Math.min(1.0, edgeFactor * xEdgeFactor * topEdgeFactor * bottomEdgeFactor));

      // Atmospheric background with subtle emerald glow behind head
      const headDist = Math.hypot(x - cx, y - height * 0.35);
      const glowFactor = Math.max(0, 1 - headDist / 420);
      const curBgR = Math.min(255, Math.round(bgR + glowFactor * 8));
      const curBgG = Math.min(255, Math.round(bgG + glowFactor * 26));
      const curBgB = Math.min(255, Math.round(bgB + glowFactor * 18));

      output[idx] = Math.round(fgR * alpha + curBgR * (1 - alpha));
      output[idx + 1] = Math.round(fgG * alpha + curBgG * (1 - alpha));
      output[idx + 2] = Math.round(fgB * alpha + curBgB * (1 - alpha));
    }
  }

  await sharp(output, { raw: { width, height, channels: 3 } })
    .webp({ quality: 96 })
    .toFile(outWebp);

  await sharp(output, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 94 })
    .toFile(outJpg);

  console.log('Saved ashifur-about-blend.webp and ashifur-about-blend.jpg successfully!');
}

blendAboutPhoto().catch(console.error);
