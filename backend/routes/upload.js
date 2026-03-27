const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const API_BASE = process.env.PUBLIC_API_URL || 'https://api.islacloudsolutions.com';

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload (admin) — uploads file and auto-registers in media library
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
  }
  const url = `/uploads/${req.file.filename}`;
  const fullUrl = `${API_BASE}${url}`;
  const category = req.body.category || 'general';

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

  res.json({ url, filename: req.file.filename });
});

module.exports = router;
