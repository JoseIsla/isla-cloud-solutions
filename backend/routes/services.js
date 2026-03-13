const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/services (public)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    conn.release();
    // Parse features JSON
    const services = rows.map(s => ({ ...s, features: typeof s.features === 'string' ? JSON.parse(s.features) : s.features }));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/services/:id (public)
router.get('/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM services WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    conn.release();
    if (rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
    const s = rows[0];
    s.features = typeof s.features === 'string' ? JSON.parse(s.features) : s.features;
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/services (admin)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty(),
  body('slug').trim().notEmpty(),
  body('short_title').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { slug, title, short_title, description, long_description, icon, features, image_url, sort_order } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO services (slug, title, short_title, description, long_description, icon, features, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, title, short_title, description || '', long_description || '', icon || 'Server', JSON.stringify(features || []), image_url || '', sort_order || 0]
    );
    conn.release();
    res.status(201).json({ id: Number(result.insertId), message: 'Servicio creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/services/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { slug, title, short_title, description, long_description, icon, features, image_url, sort_order, is_active } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE services SET slug=?, title=?, short_title=?, description=?, long_description=?, icon=?, features=?, image_url=?, sort_order=?, is_active=? WHERE id=?',
      [slug, title, short_title, description, long_description, icon, JSON.stringify(features || []), image_url, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    conn.release();
    res.json({ message: 'Servicio actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/services/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Servicio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
