const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/contents (public)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM contents');
    conn.release();
    // Return as key-value map
    const map = {};
    rows.forEach(row => { map[row.content_key] = row; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/contents/:key (admin)
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { value, title, content_type } = req.body;
    const conn = await pool.getConnection();
    const existing = await conn.query('SELECT id FROM contents WHERE content_key = ?', [req.params.key]);
    
    if (existing.length === 0) {
      await conn.query(
        'INSERT INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)',
        [req.params.key, title || req.params.key, value, content_type || 'text']
      );
    } else {
      await conn.query(
        'UPDATE contents SET value = ?, title = COALESCE(?, title), content_type = COALESCE(?, content_type) WHERE content_key = ?',
        [value, title, content_type, req.params.key]
      );
    }
    conn.release();
    res.json({ message: 'Contenido actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
