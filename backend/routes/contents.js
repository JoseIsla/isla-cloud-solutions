const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/contents (public)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM contents');
    const map = {};
    rows.forEach(row => { map[row.content_key] = row; });
    res.json(map);
  } catch (err) {
    console.error('GET /api/contents error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/contents/:key (admin)
router.put('/:key', authMiddleware, [
  param('key').trim().notEmpty().isLength({ max: 100 }).matches(/^[a-z0-9_]+$/),
  body('value').optional().isLength({ max: 100000 }),
  body('title').optional().trim().isLength({ max: 255 }),
  body('content_type').optional().isIn(['text', 'html', 'json']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { value, title, content_type } = req.body;
    conn = await pool.getConnection();
    const existing = await conn.query('SELECT id FROM contents WHERE content_key = ?', [req.params.key]);
    
    if (existing.length === 0) {
      await conn.query(
        'INSERT INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)',
        [req.params.key, title || req.params.key, value || '', content_type || 'text']
      );
    } else {
      const updates = ['value = ?'];
      const params = [value || ''];
      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (content_type !== undefined) {
        updates.push('content_type = ?');
        params.push(content_type);
      }
      updates.push('updated_at = NOW()');
      params.push(req.params.key);
      await conn.query(
        `UPDATE contents SET ${updates.join(', ')} WHERE content_key = ?`,
        params
      );
    }
    res.json({ message: 'Contenido actualizado' });
  } catch (err) {
    console.error('Error updating content:', req.params.key, err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
