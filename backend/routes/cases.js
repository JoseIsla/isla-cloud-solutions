const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/cases (public - only active)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const isAdmin = req.headers.authorization;
    let rows;
    if (isAdmin) {
      rows = await conn.query('SELECT * FROM success_cases ORDER BY sort_order ASC, created_at DESC');
    } else {
      rows = await conn.query('SELECT * FROM success_cases WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    }
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/cases/:id
router.get('/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM success_cases WHERE id = ?', [req.params.id]);
    conn.release();
    if (rows.length === 0) return res.status(404).json({ error: 'Caso no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/cases (admin)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty(),
  body('client_name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, client_name, excerpt, description, image_url, sort_order, is_active } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO success_cases (title, client_name, excerpt, description, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, client_name, excerpt || '', description || '', image_url || '', sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );
    conn.release();
    res.status(201).json({ id: Number(result.insertId), message: 'Caso de éxito creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/cases/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, client_name, excerpt, description, image_url, sort_order, is_active } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE success_cases SET title=?, client_name=?, excerpt=?, description=?, image_url=?, sort_order=?, is_active=? WHERE id=?',
      [title, client_name, excerpt, description, image_url, sort_order || 0, is_active ? 1 : 0, req.params.id]
    );
    conn.release();
    res.json({ message: 'Caso de éxito actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/cases/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM success_cases WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Caso de éxito eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
