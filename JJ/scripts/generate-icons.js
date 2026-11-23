// scripts/generate-icons.js
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // RGBA pixels
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 4;
      
      // Rounded rectangle test
      const dx = Math.abs(x - cx) - (cx - rCorner);
      const dy = Math.abs(y - cy) - (cy - rCorner);
      const inCorner = dx > 0 && dy > 0;
      const dist = inCorner ? Math.sqrt(dx * dx + dy * dy) : 0;

      if (dist > rCorner) {
        // Outside
        rawData[pOffset] = 0;
        rawData[pOffset + 1] = 0;
        rawData[pOffset + 2] = 0;
        rawData[pOffset + 3] = 0;
        continue;
      }

      // Background Gradient (Blue #2563eb to #1d4ed8)
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(37 * (1 - gradRatio) + 29 * gradRatio);
      let g = Math.round(99 * (1 - gradRatio) + 78 * gradRatio);
      let b = Math.round(235 * (1 - gradRatio) + 216 * gradRatio);

      // Inner Notebook area
      const nbX1 = width * 0.20;
      const nbX2 = width * 0.80;
      const nbY1 = height * 0.18;
      const nbY2 = height * 0.82;

      if (x >= nbX1 && x <= nbX2 && y >= nbY1 && y <= nbY2) {
        // Spine left
        if (x < nbX1 + width * 0.12) {
          r = 226; g = 232; b = 240; // Slate 200
        } else {
          r = 255; g = 255; b = 255; // White paper
          
          // Ruled line 1 (blue header)
          if (y >= height * 0.32 && y <= height * 0.36 && x <= nbX2 - width * 0.1) {
            r = 37; g = 99; b = 235;
          }
          // Ruled line 2
          if (y >= height * 0.44 && y <= height * 0.47 && x <= nbX2 - width * 0.15) {
            r = 203; g = 213; b = 225;
          }
          // Ruled line 3
          if (y >= height * 0.54 && y <= height * 0.57 && x <= nbX2 - width * 0.1) {
            r = 203; g = 213; b = 225;
          }

          // Coin badge (Gold #f59e0b)
          const coinCx = width * 0.65;
          const coinCy = height * 0.68;
          const coinR = width * 0.14;
          const cdx = x - coinCx;
          const cdy = y - coinCy;
          if (cdx * cdx + cdy * cdy <= coinR * coinR) {
            r = 245; g = 158; b = 11;
            // Baht sign bar in center
            if (Math.abs(cdx) < coinR * 0.25 && Math.abs(cdy) < coinR * 0.6) {
              r = 255; g = 255; b = 255;
            }
          }
        }
      }

      rawData[pOffset] = r;
      rawData[pOffset + 1] = g;
      rawData[pOffset + 2] = b;
      rawData[pOffset + 3] = 255;
    }
  }

  // Compress
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type 6 = RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPNG(180, 180));

console.log('PWA icons created successfully in public/icons/');
