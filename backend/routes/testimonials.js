const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/testimonials (public - only active)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id DESC'
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/testimonials/all (admin - all including inactive)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC'
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/testimonials (admin)
router.post('/', authMiddleware, [
  body('author_name').trim().notEmpty(),
  body('quote').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO testimonials (author_name, author_role, author_company, quote, avatar_url, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [author_name, author_role || '', author_company || '', quote, avatar_url || '', rating || 5, sort_order || 0]
    );
    conn.release();
    res.status(201).json({ id: Number(result.insertId), message: 'Testimonio creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order, is_active } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE testimonials SET author_name=?, author_role=?, author_company=?, quote=?, avatar_url=?, rating=?, sort_order=?, is_active=? WHERE id=?',
      [author_name, author_role, author_company, quote, avatar_url, rating || 5, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    conn.release();
    res.json({ message: 'Testimonio actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Testimonio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
