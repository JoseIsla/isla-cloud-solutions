const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/cases (public/admin)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const isAdmin = req.headers.authorization;
    let rows;
    if (isAdmin) {
      rows = await conn.query('SELECT * FROM success_cases ORDER BY sort_order ASC, created_at DESC');
    } else {
      rows = await conn.query('SELECT * FROM success_cases WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    }
    res.json(rows);
  } catch (err) {
    console.error('GET /api/cases error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/cases/:id (public - by id or slug)
router.get('/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM success_cases WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Caso no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/cases/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/cases (admin)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty(),
  body('client_name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { title, slug, client_name, excerpt, description, image_url, sort_order, is_active, meta_title, meta_description, noindex, nofollow } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO success_cases (title, slug, client_name, excerpt, description, image_url, sort_order, is_active, meta_title, meta_description, noindex, nofollow) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug || '', client_name, excerpt || '', description || '', image_url || '', sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, meta_title || '', meta_description || '', noindex ? 1 : 0, nofollow ? 1 : 0]
    );
    res.status(201).json({ id: Number(result.insertId), message: 'Caso de éxito creado' });
  } catch (err) {
    console.error('POST /api/cases error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/cases/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { title, slug, client_name, excerpt, description, image_url, sort_order, is_active, meta_title, meta_description, noindex, nofollow } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE success_cases SET title=?, slug=?, client_name=?, excerpt=?, description=?, image_url=?, sort_order=?, is_active=?, meta_title=?, meta_description=?, noindex=?, nofollow=? WHERE id=?',
      [title, slug || '', client_name, excerpt, description, image_url, sort_order || 0, is_active ? 1 : 0, meta_title || '', meta_description || '', noindex ? 1 : 0, nofollow ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Caso de éxito actualizado' });
  } catch (err) {
    console.error('PUT /api/cases/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/cases/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM success_cases WHERE id = ?', [req.params.id]);
    res.json({ message: 'Caso de éxito eliminado' });
  } catch (err) {
    console.error('DELETE /api/cases/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
