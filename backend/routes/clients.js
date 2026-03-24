const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/clients (public)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM clients WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/clients error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/clients (admin)
router.post('/', authMiddleware, [
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { name, logo_url, website_url, sort_order } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO clients (name, logo_url, website_url, sort_order) VALUES (?, ?, ?, ?)',
      [name, logo_url || '', website_url || '', sort_order || 0]
    );
    res.status(201).json({ id: Number(result.insertId), message: 'Cliente creado' });
  } catch (err) {
    console.error('POST /api/clients error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/clients/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { name, logo_url, website_url, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE clients SET name=?, logo_url=?, website_url=?, sort_order=?, is_active=? WHERE id=?',
      [name, logo_url, website_url, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    console.error('PUT /api/clients/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/clients/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error('DELETE /api/clients/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
