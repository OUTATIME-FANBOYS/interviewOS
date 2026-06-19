import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Icon design: dark background, stacked cards motif, cyan accent
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0d18"/>
      <stop offset="100%" stop-color="#111122"/>
    </linearGradient>
    <linearGradient id="card1grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a30"/>
      <stop offset="100%" stop-color="#141428"/>
    </linearGradient>
    <linearGradient id="card2grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1e38"/>
      <stop offset="100%" stop-color="#181830"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Back card (rotated slightly left) -->
  <g transform="translate(256,256) rotate(-12) translate(-256,-256)">
    <rect x="112" y="148" width="288" height="200" rx="20" fill="url(#card1grad)" stroke="#2a2a50" stroke-width="1.5"/>
  </g>

  <!-- Middle card (rotated slightly right) -->
  <g transform="translate(256,256) rotate(6) translate(-256,-256)">
    <rect x="112" y="148" width="288" height="200" rx="20" fill="url(#card2grad)" stroke="#2e2e58" stroke-width="1.5"/>
  </g>

  <!-- Front card -->
  <rect x="112" y="155" width="288" height="200" rx="20" fill="#16162e" stroke="#2a2a55" stroke-width="1.5"/>

  <!-- Card shimmer line -->
  <rect x="112" y="155" width="288" height="2" rx="1" fill="#00e5ff" opacity="0.15"/>

  <!-- Lightning bolt (centered on front card) -->
  <path
    d="M272 185 L238 255 L262 255 L240 330 L282 248 L257 248 L285 185 Z"
    fill="#00e5ff"
    filter="url(#glow)"
    opacity="0.95"
  />

  <!-- Subtle dot grid on front card -->
  <g opacity="0.07" fill="#00e5ff">
    <circle cx="152" cy="195" r="2.5"/>
    <circle cx="172" cy="195" r="2.5"/>
    <circle cx="152" cy="215" r="2.5"/>
    <circle cx="172" cy="215" r="2.5"/>
    <circle cx="340" cy="305" r="2.5"/>
    <circle cx="360" cy="305" r="2.5"/>
    <circle cx="340" cy="325" r="2.5"/>
    <circle cx="360" cy="325" r="2.5"/>
  </g>
</svg>`;

async function generate(svgBuffer, outPath, size) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath} (${size}x${size})`);
}

const buf = Buffer.from(svgIcon);

// Next.js web icons
await generate(buf, resolve(root, "public/icon-512.png"), 512);
await generate(buf, resolve(root, "public/icon-192.png"), 192);
await generate(buf, resolve(root, "public/apple-touch-icon.png"), 180);

// App router icon (Next.js picks this up automatically)
await generate(buf, resolve(root, "app/icon.png"), 512);

// Favicon sizes → write as separate PNGs (browser will use icon.png for modern)
await generate(buf, resolve(root, "public/favicon-32.png"), 32);
await generate(buf, resolve(root, "public/favicon-16.png"), 16);

// Save the master SVG too
writeFileSync(resolve(root, "public/icon.svg"), svgIcon);
console.log("✓ public/icon.svg");

// iOS Capacitor icon sizes
const iosDir = resolve(root, "public/ios-icons");
mkdirSync(iosDir, { recursive: true });
const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
for (const size of iosSizes) {
  await generate(buf, resolve(iosDir, `icon-${size}.png`), size);
}

console.log("\nDone. Add ios-icons/ to Capacitor via Xcode asset catalog or npx capacitor-assets.");
