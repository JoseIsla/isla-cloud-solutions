const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/testimonials (public - only active)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/testimonials error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/testimonials/all (admin)
router.get('/all', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/testimonials/all error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/testimonials (admin)
router.post('/', authMiddleware, [
  body('author_name').trim().notEmpty(),
  body('quote').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO testimonials (author_name, author_role, author_company, quote, avatar_url, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [author_name, author_role || '', author_company || '', quote, avatar_url || '', rating || 5, sort_order || 0]
    );
    res.status(201).json({ id: Number(result.insertId), message: 'Testimonio creado' });
  } catch (err) {
    console.error('POST /api/testimonials error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE testimonials SET author_name=?, author_role=?, author_company=?, quote=?, avatar_url=?, rating=?, sort_order=?, is_active=? WHERE id=?',
      [author_name, author_role, author_company, quote, avatar_url, rating || 5, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ message: 'Testimonio actualizado' });
  } catch (err) {
    console.error('PUT /api/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Testimonio eliminado' });
  } catch (err) {
    console.error('DELETE /api/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
