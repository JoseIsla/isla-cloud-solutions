const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET /api/news (public)
router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const isAdmin = req.headers.authorization;
    let rows;
    if (isAdmin) {
      rows = await conn.query('SELECT * FROM news ORDER BY created_at DESC');
    } else {
      rows = await conn.query('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC');
    }
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/news/:id (public)
router.get('/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM news WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    conn.release();
    if (rows.length === 0) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/news (admin)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty(),
  body('slug').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, slug, excerpt, content, image_url, category, is_published } = req.body;
    const publishedAt = is_published ? new Date() : null;
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO news (title, slug, excerpt, content, image_url, category, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, excerpt || '', content || '', image_url || '', category || '', is_published ? 1 : 0, publishedAt]
    );
    conn.release();
    res.status(201).json({ id: Number(result.insertId), message: 'Noticia creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/news/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, content, image_url, category, is_published } = req.body;
    const conn = await pool.getConnection();
    
    // If publishing for the first time, set published_at
    let publishedAt = null;
    if (is_published) {
      const existing = await conn.query('SELECT published_at FROM news WHERE id = ?', [req.params.id]);
      publishedAt = existing[0]?.published_at || new Date();
    }

    await conn.query(
      'UPDATE news SET title=?, slug=?, excerpt=?, content=?, image_url=?, category=?, is_published=?, published_at=? WHERE id=?',
      [title, slug, excerpt, content, image_url, category, is_published ? 1 : 0, publishedAt, req.params.id]
    );
    conn.release();
    res.json({ message: 'Noticia actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/news/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
