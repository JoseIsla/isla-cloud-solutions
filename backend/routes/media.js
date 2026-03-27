const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CATEGORIES = ['general', 'logos', 'fondos', 'servicios', 'noticias', 'casos', 'clientes', 'testimonios'];

// GET /api/media (admin) - list all media with optional filters
router.get('/', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(original_name LIKE ? OR alt_text LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error listing media:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/media/categories (admin) - list categories
router.get('/categories', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT DISTINCT category FROM media WHERE category IS NOT NULL ORDER BY category');
    const dbCategories = rows.map(r => r.category);
    const all = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])].sort();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/media (admin) - register a media entry (called after upload)
router.post('/', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { url, original_name, category, alt_text } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO media (url, original_name, category, alt_text) VALUES (?, ?, ?, ?)',
      [url, original_name || '', category || 'general', alt_text || '']
    );
    res.json({ id: Number(result.insertId), url });
  } catch (err) {
    console.error('Error creating media:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/media/:id (admin) - update category or alt_text
router.put('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { category, alt_text } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE media SET category = COALESCE(?, category), alt_text = COALESCE(?, alt_text) WHERE id = ?',
      [category, alt_text, req.params.id]
    );
    res.json({ message: 'Medio actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/media/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
