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
  clientes:     { width: 280, height: 80 },
  testimonios:  { width: 200, height: 200 },
  logos:        { width: 200, height: 60 },
  general:      { width: 1200, height: 1200 },
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
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp, svg)'));
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
      const isPng = ext === '.png';

      let pipeline = sharp(filePath)
        .resize(preset.width, preset.height, {
          fit: 'inside',          // Scale down to fit, never upscale beyond original
          withoutEnlargement: true,
        });

      let newExt;
      if (isPng) {
        // Preserve transparency for PNGs (logos, icons)
        pipeline = pipeline.png({ quality: 85, compressionLevel: 9 });
        newExt = '.png';
      } else {
        pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
        newExt = '.jpg';
      }

      const buffer = await pipeline.toBuffer();

      const newFilename = path.basename(req.file.filename, path.extname(req.file.filename)) + newExt;
      const newPath = path.join(path.dirname(filePath), newFilename);
      fs.writeFileSync(newPath, buffer);

      // Remove original if different file
      if (filePath !== newPath) {
        fs.unlinkSync(filePath);
      }

      req.file.filename = newFilename;
      req.file.path = newPath;
    } catch (e) {
      console.error('Error resizing image, keeping original:', e.message);
      // Keep original file on resize failure
    }
  }

  // Generate WebP variant for content negotiation
  const webpFilename = await generateWebpVariant(req.file.path);

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

  res.json({
    url,
    filename: req.file.filename,
    webp: webpFilename ? `/uploads/${webpFilename}` : null,
  });
});

module.exports = router;
