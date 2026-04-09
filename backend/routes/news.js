const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { translateEntityAndSave } = require('../services/translator');

const router = express.Router();

const newsValidation = [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('slug').trim().notEmpty().isLength({ max: 255 }),
  body('excerpt').optional().isLength({ max: 5000 }),
  body('content').optional().isLength({ max: 200000 }),
  body('image_url').optional().trim().isLength({ max: 500 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('sort_order').optional().isInt({ min: 0, max: 9999 }),
  body('meta_title').optional().trim().isLength({ max: 255 }),
  body('meta_description').optional().trim().isLength({ max: 500 }),
];

const idParam = param('id').isInt({ min: 1 });

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function applyLang(row, lang) {
  if (lang !== 'en') return row;
  const r = { ...row };
  if (r.title_en) r.title = r.title_en;
  if (r.excerpt_en) r.excerpt = r.excerpt_en;
  if (r.content_en) r.content = r.content_en;
  return r;
}

// GET /api/news (public / admin sees all)
router.get('/', [query('lang').optional().isIn(['es', 'en'])], async (req, res) => {
  let conn;
  try {
    const lang = req.query.lang || 'es';
    conn = await pool.getConnection();
    const user = verifyToken(req);
    let rows;
    if (user) {
      rows = await conn.query('SELECT * FROM news ORDER BY sort_order ASC, created_at DESC');
    } else {
      rows = await conn.query('SELECT * FROM news WHERE is_published = 1 ORDER BY sort_order ASC, published_at DESC');
    }
    // Only apply lang for public requests (admin sees original)
    const mapped = user ? rows : rows.map(r => applyLang(r, lang));
    res.json(mapped);
  } catch (err) {
    console.error('GET /api/news error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/news/:id (public)
router.get('/:id', [query('lang').optional().isIn(['es', 'en'])], async (req, res) => {
  let conn;
  try {
    const lang = req.query.lang || 'es';
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM news WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(applyLang(rows[0], lang));
  } catch (err) {
    console.error('GET /api/news/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/news (admin)
router.post('/', authMiddleware, newsValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { title, slug, excerpt, content, image_url, category, is_published, sort_order, meta_title, meta_description, noindex, nofollow } = req.body;
    const publishedAt = is_published ? new Date() : null;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO news (title, slug, excerpt, content, image_url, category, is_published, sort_order, published_at, meta_title, meta_description, noindex, nofollow) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, excerpt || '', content || '', image_url || '', category || '', is_published ? 1 : 0, sort_order || 0, publishedAt, meta_title || '', meta_description || '', noindex ? 1 : 0, nofollow ? 1 : 0]
    );
    const insertedId = Number(result.insertId);
    res.status(201).json({ id: insertedId, message: 'Noticia creada' });

    translateEntityAndSave(pool, 'news', insertedId, [
      { field: 'title', value: title, type: 'text' },
      { field: 'excerpt', value: excerpt || '', type: 'text' },
      { field: 'content', value: content || '', type: 'html' },
    ]).catch(err => console.error('[Translator] News create error:', err.message));
  } catch (err) {
    console.error('POST /api/news error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/news/:id (admin)
router.put('/:id', authMiddleware, idParam, newsValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { title, slug, excerpt, content, image_url, category, is_published, sort_order, meta_title, meta_description, noindex, nofollow } = req.body;
    conn = await pool.getConnection();
    
    let publishedAt = null;
    if (is_published) {
      const existing = await conn.query('SELECT published_at FROM news WHERE id = ?', [req.params.id]);
      publishedAt = existing[0]?.published_at || new Date();
    }

    await conn.query(
      'UPDATE news SET title=?, slug=?, excerpt=?, content=?, image_url=?, category=?, is_published=?, sort_order=?, published_at=?, meta_title=?, meta_description=?, noindex=?, nofollow=? WHERE id=?',
      [title, slug, excerpt, content, image_url, category, is_published ? 1 : 0, sort_order || 0, publishedAt, meta_title || '', meta_description || '', noindex ? 1 : 0, nofollow ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Noticia actualizada' });

    translateEntityAndSave(pool, 'news', Number(req.params.id), [
      { field: 'title', value: title, type: 'text' },
      { field: 'excerpt', value: excerpt || '', type: 'text' },
      { field: 'content', value: content || '', type: 'html' },
    ]).catch(err => console.error('[Translator] News update error:', err.message));
  } catch (err) {
    console.error('PUT /api/news/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/news/:id (admin)
router.delete('/:id', authMiddleware, idParam, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    console.error('DELETE /api/news/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;