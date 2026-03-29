const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const serviceValidation = [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('slug').trim().notEmpty().isLength({ max: 255 }),
  body('short_title').trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 5000 }),
  body('long_description').optional().isLength({ max: 50000 }),
  body('icon').optional().trim().isLength({ max: 50 }),
  body('image_url').optional().trim().isLength({ max: 500 }),
  body('sort_order').optional().isInt({ min: 0, max: 9999 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
];

const idParam = param('id').isInt({ min: 1 });

// GET /api/services (public)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const services = rows.map(s => ({ ...s, features: typeof s.features === 'string' ? JSON.parse(s.features) : s.features }));
    res.json(services);
  } catch (err) {
    console.error('GET /api/services error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/services/:id (public)
router.get('/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM services WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
    const s = rows[0];
    s.features = typeof s.features === 'string' ? JSON.parse(s.features) : s.features;
    res.json(s);
  } catch (err) {
    console.error('GET /api/services/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/services (admin)
router.post('/', authMiddleware, serviceValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { slug, title, short_title, description, long_description, icon, features, image_url, sort_order } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO services (slug, title, short_title, description, long_description, icon, features, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, title, short_title, description || '', long_description || '', icon || 'Server', JSON.stringify(features || []), image_url || '', sort_order || 0]
    );
    res.status(201).json({ id: Number(result.insertId), message: 'Servicio creado' });
  } catch (err) {
    console.error('POST /api/services error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/services/:id (admin)
router.put('/:id', authMiddleware, idParam, serviceValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { slug, title, short_title, description, long_description, icon, features, image_url, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE services SET slug=?, title=?, short_title=?, description=?, long_description=?, icon=?, features=?, image_url=?, sort_order=?, is_active=? WHERE id=?',
      [slug, title, short_title, description, long_description, icon, JSON.stringify(features || []), image_url, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ message: 'Servicio actualizado' });
  } catch (err) {
    console.error('PUT /api/services/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/services/:id (admin)
router.delete('/:id', authMiddleware, idParam, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Servicio eliminado' });
  } catch (err) {
    console.error('DELETE /api/services/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
