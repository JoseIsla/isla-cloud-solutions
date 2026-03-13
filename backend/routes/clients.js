const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/clients (public)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM clients WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/clients (admin)
router.post('/', authMiddleware, [
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, logo_url, website_url, sort_order } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO clients (name, logo_url, website_url, sort_order) VALUES (?, ?, ?, ?)',
      [name, logo_url || '', website_url || '', sort_order || 0]
    );
    conn.release();
    res.status(201).json({ id: Number(result.insertId), message: 'Cliente creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/clients/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, logo_url, website_url, sort_order, is_active } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE clients SET name=?, logo_url=?, website_url=?, sort_order=?, is_active=? WHERE id=?',
      [name, logo_url, website_url, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    conn.release();
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/clients/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
