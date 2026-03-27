#!/usr/bin/env node
/**
 * One-time script to generate WebP variants for all existing
 * JPG/PNG images in the uploads directory.
 *
 * Usage: node scripts/generate-webp-variants.js
 */

const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is required. Run: npm install sharp');
  process.exit(1);
}

const UPLOADS_DIR = path.join(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
const QUALITY = 80;

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`Uploads directory not found: ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  const imageFiles = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to convert...\n`);

  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of imageFiles) {
    const baseName = path.basename(file, path.extname(file));
    const webpName = baseName + '.webp';
    const webpPath = path.join(UPLOADS_DIR, webpName);

    // Skip if WebP variant already exists
    if (fs.existsSync(webpPath)) {
      skipped++;
      continue;
    }

    try {
      const srcPath = path.join(UPLOADS_DIR, file);
      await sharp(srcPath)
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(webpPath);

      const srcSize = fs.statSync(srcPath).size;
      const webpSize = fs.statSync(webpPath).size;
      const savings = Math.round((1 - webpSize / srcSize) * 100);

      console.log(`✓ ${file} → ${webpName} (${savings}% smaller)`);
      converted++;
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone! Converted: ${converted}, Skipped: ${skipped}, Errors: ${errors}`);
}

main();
