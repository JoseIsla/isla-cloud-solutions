const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const partnerValidation = [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('logo_url').optional().trim().isLength({ max: 500 }),
  body('website_url').optional().trim().isLength({ max: 500 }),
  body('sort_order').optional().isInt({ min: 0, max: 9999 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
];

const idParam = param('id').isInt({ min: 1 });

// GET /api/partners (public)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM partners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/partners error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/partners (admin)
router.post('/', authMiddleware, partnerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { name, logo_url, website_url, sort_order } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO partners (name, logo_url, website_url, sort_order) VALUES (?, ?, ?, ?)',
      [name, logo_url || '', website_url || '', sort_order || 0]
    );
    res.status(201).json({ id: Number(result.insertId), message: 'Partner creado' });
  } catch (err) {
    console.error('POST /api/partners error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/partners/:id (admin)
router.put('/:id', authMiddleware, idParam, partnerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { name, logo_url, website_url, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE partners SET name=?, logo_url=?, website_url=?, sort_order=?, is_active=? WHERE id=?',
      [name, logo_url, website_url, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ message: 'Partner actualizado' });
  } catch (err) {
    console.error('PUT /api/partners/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/partners/:id (admin)
router.delete('/:id', authMiddleware, idParam, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Partner eliminado' });
  } catch (err) {
    console.error('DELETE /api/partners/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
