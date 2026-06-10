const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('sharp not installed – image resizing disabled');
}

const router = express.Router();

const API_BASE = process.env.PUBLIC_API_URL || 'https://api.islacloudsolutions.com';

// Size presets per category (maxWidth × maxHeight)
const SIZE_PRESETS = {
  servicios:    { width: 1200, height: 675 },
  noticias:     { width: 1200, height: 675 },
  casos:        { width: 1200, height: 675 },
  fondos:       { width: 1920, height: 1080 },
  clientes:     { width: 400, height: 140 },
  partners:     { width: 400, height: 140 },
  testimonios:  { width: 200, height: 200 },
  logos:        { width: 400, height: 140 },
  general:      { width: 1200, height: 1200 },
};

// Categories that should be normalized to a fixed canvas with transparent background
const LOGO_CATEGORIES = new Set(['clientes', 'partners', 'logos']);

// Optional: remove near-white background from logo uploads (useful for JPGs without alpha).
// Enable via LOGO_REMOVE_WHITE_BG=true. Tolerance 0-255 (higher = more aggressive).
// Default OFF: respect PNG transparency as uploaded. Enable explicitly only for JPG logos with white background.
const LOGO_REMOVE_WHITE_BG = String(process.env.LOGO_REMOVE_WHITE_BG || 'false').toLowerCase() === 'true';
const LOGO_WHITE_BG_TOLERANCE = Math.min(255, Math.max(0, parseInt(process.env.LOGO_WHITE_BG_TOLERANCE, 10) || 235));

/**
 * Take a sharp input and, if enabled, convert near-white pixels to transparent.
 * Returns a sharp instance with alpha channel ready for PNG output.
 */
async function ensureLogoAlpha(inputPath) {
  const base = sharp(inputPath).ensureAlpha();
  if (!LOGO_REMOVE_WHITE_BG) return base;
  try {
    const { data, info } = await base
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const t = LOGO_WHITE_BG_TOLERANCE;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r >= t && g >= t && b >= t) {
        data[i + 3] = 0; // transparent
      }
    }
    return sharp(data, { raw: { width, height, channels } });
  } catch (e) {
    console.warn('ensureLogoAlpha failed, falling back to original:', e.message);
    return sharp(inputPath).ensureAlpha();
  }
}

// PNG compression settings — configurable via env. All preserve transparency (palette: false)
// Tuning: higher compressionLevel (0-9) = smaller files but slower; higher effort (1-10) for thumbs
// uses sharp's adaptive filtering. quality (0-100) governs zlib + adaptive filtering tradeoffs.
const num = (v, def, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
};
const PNG_LOGO_ORIGINAL = {
  quality: num(process.env.LOGO_PNG_QUALITY, 85, 0, 100),
  compressionLevel: num(process.env.LOGO_PNG_COMPRESSION_LEVEL, 9, 0, 9),
  effort: num(process.env.LOGO_PNG_EFFORT, 7, 1, 10),
  adaptiveFiltering: true,
  palette: false,
};
const PNG_LOGO_THUMB = {
  quality: num(process.env.LOGO_THUMB_PNG_QUALITY, 80, 0, 100),
  compressionLevel: num(process.env.LOGO_THUMB_PNG_COMPRESSION_LEVEL, 9, 0, 9),
  effort: num(process.env.LOGO_THUMB_PNG_EFFORT, 8, 1, 10),
  adaptiveFiltering: true,
  palette: false,
};
const PNG_GENERIC = {
  quality: num(process.env.PNG_QUALITY, 82, 0, 100),
  compressionLevel: num(process.env.PNG_COMPRESSION_LEVEL, 9, 0, 9),
  effort: num(process.env.PNG_EFFORT, 7, 1, 10),
  adaptiveFiltering: true,
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (allow larger originals before resize)
});

/**
 * Generate a WebP variant alongside the main image.
 * Returns the WebP filename if successful, null otherwise.
 */
async function generateWebpVariant(filePath, quality = 80) {
  if (!sharp) return null;

  const ext = path.extname(filePath).toLowerCase();
  // Skip SVGs and files already in WebP format
  if (ext === '.svg' || ext === '.webp') return null;

  try {
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const webpFilename = baseName + '.webp';
    const webpPath = path.join(dir, webpFilename);

    await sharp(filePath)
      .webp({ quality, effort: 4 })
      .toFile(webpPath);

    return webpFilename;
  } catch (e) {
    console.error('Error generating WebP variant:', e.message);
    return null;
  }
}

// POST /api/upload (admin) — uploads file, resizes by category, and auto-registers in media library
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
  }

  const category = req.body.category || 'general';
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  // Resize if sharp is available and it's not an SVG
  if (sharp && ext !== '.svg') {
    try {
      const preset = SIZE_PRESETS[category] || SIZE_PRESETS.general;
      const isLogo = LOGO_CATEGORIES.has(category);
      const isPng = ext === '.png';

      let newExt;
      let thumbFilename = null;

      if (isLogo) {
        // For logos, force PNG output with alpha. If source is JPG (no alpha)
        // and LOGO_REMOVE_WHITE_BG is enabled, strip near-white background so
        // it blends with the dark site theme just like a real PNG with transparency.
        const baseName = path.basename(req.file.filename, path.extname(req.file.filename));
        newExt = '.png';

        // Decode once with alpha (and optional white-removal) into a raw buffer
        // that we can reuse for both the original and the thumbnail.
        const prepared = await ensureLogoAlpha(filePath);
        const { data: rawData, info: rawInfo } = await prepared
          .raw()
          .toBuffer({ resolveWithObject: true });
        const rawOpts = { raw: { width: rawInfo.width, height: rawInfo.height, channels: rawInfo.channels } };

        // 1) ORIGINAL (capped at 1200px, preserves transparency)
        const originalBuffer = await sharp(rawData, rawOpts)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .png(PNG_LOGO_ORIGINAL)
          .toBuffer();
        const originalFilename = baseName + newExt;
        const originalPath = path.join(path.dirname(filePath), originalFilename);
        fs.writeFileSync(originalPath, originalBuffer);

        // 2) THUMBNAIL on fixed transparent canvas (for marquee/listings)
        const thumbBuffer = await sharp(rawData, rawOpts)
          .resize(preset.width, preset.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            withoutEnlargement: false,
          })
          .png(PNG_LOGO_THUMB)
          .toBuffer();
        thumbFilename = baseName + '-thumb.png';
        const thumbPath = path.join(path.dirname(filePath), thumbFilename);
        fs.writeFileSync(thumbPath, thumbBuffer);

        // Remove the multer-uploaded source if it has a different name
        if (filePath !== originalPath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        req.file.filename = originalFilename;
        req.file.path = originalPath;
        req.file.thumbFilename = thumbFilename;
      } else {
        let pipeline = sharp(filePath);
        if (isPng) {
          pipeline = pipeline
            .resize(preset.width, preset.height, { fit: 'inside', withoutEnlargement: true })
            .png(PNG_GENERIC);
          newExt = '.png';
        } else {
          pipeline = pipeline
            .resize(preset.width, preset.height, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, mozjpeg: true });
          newExt = '.jpg';
        }
        const buffer = await pipeline.toBuffer();
        const newFilename = path.basename(req.file.filename, path.extname(req.file.filename)) + newExt;
        const newPath = path.join(path.dirname(filePath), newFilename);
        fs.writeFileSync(newPath, buffer);
        if (filePath !== newPath) fs.unlinkSync(filePath);
        req.file.filename = newFilename;
        req.file.path = newPath;
      }

    } catch (e) {
      console.error('Error resizing image, keeping original:', e.message);
      // Keep original file on resize failure
    }
  }

  // Generate WebP variant for content negotiation (skip for logos to preserve PNG transparency on frontend)
  const isLogoFinal = LOGO_CATEGORIES.has(category);
  const webpFilename = isLogoFinal ? null : await generateWebpVariant(req.file.path);

  const url = `/uploads/${req.file.filename}`;
  const fullUrl = `${API_BASE}${url}`;

  // Auto-register in media library
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO media (url, original_name, category) VALUES (?, ?, ?)',
      [fullUrl, req.file.originalname, category]
    );
  } catch (e) {
    console.error('Error registering media:', e.message);
  } finally {
    if (conn) conn.release();
  }

  const thumbUrl = req.file.thumbFilename ? `/uploads/${req.file.thumbFilename}` : null;

  res.json({
    url,
    filename: req.file.filename,
    webp: webpFilename ? `/uploads/${webpFilename}` : null,
    thumb: thumbUrl,
  });

});

module.exports = router;
