const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const { translateEntityAndSave } = require('../services/translator');

const router = express.Router();

const testimonialValidation = [
  body('author_name').trim().notEmpty().isLength({ max: 255 }),
  body('quote').trim().notEmpty().isLength({ max: 2000 }),
  body('author_role').optional().trim().isLength({ max: 255 }),
  body('author_company').optional().trim().isLength({ max: 255 }),
  body('avatar_url').optional().trim().isLength({ max: 500 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('sort_order').optional().isInt({ min: 0, max: 9999 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
];

const idParam = param('id').isInt({ min: 1 });

function applyLang(row, lang) {
  if (lang !== 'en') return row;
  const r = { ...row };
  if (r.quote_en) r.quote = r.quote_en;
  if (r.author_role_en) r.author_role = r.author_role_en;
  if (r.author_company_en) r.author_company = r.author_company_en;
  return r;
}

// GET /api/testimonials (public - only active)
router.get('/', [query('lang').optional().isIn(['es', 'en'])], async (req, res) => {
  let conn;
  try {
    const lang = req.query.lang || 'es';
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id DESC');
    res.json(rows.map(r => applyLang(r, lang)));
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
router.post('/', authMiddleware, testimonialValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO testimonials (author_name, author_role, author_company, quote, avatar_url, rating, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [author_name, author_role || '', author_company || '', quote, avatar_url || '', rating || 5, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );
    const insertedId = Number(result.insertId);
    res.status(201).json({ id: insertedId, message: 'Testimonio creado' });

    translateEntityAndSave(pool, 'testimonials', insertedId, [
      { field: 'quote', value: quote, type: 'text' },
      { field: 'author_role', value: author_role || '', type: 'text' },
      { field: 'author_company', value: author_company || '', type: 'text' },
    ]).catch(err => console.error('[Translator] Testimonial create error:', err.message));
  } catch (err) {
    console.error('POST /api/testimonials error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', authMiddleware, idParam, testimonialValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { author_name, author_role, author_company, quote, avatar_url, rating, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE testimonials SET author_name=?, author_role=?, author_company=?, quote=?, avatar_url=?, rating=?, sort_order=?, is_active=? WHERE id=?',
      [author_name, author_role, author_company, quote, avatar_url, rating || 5, sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
    );
    res.json({ message: 'Testimonio actualizado' });

    translateEntityAndSave(pool, 'testimonials', Number(req.params.id), [
      { field: 'quote', value: quote, type: 'text' },
      { field: 'author_role', value: author_role || '', type: 'text' },
      { field: 'author_company', value: author_company || '', type: 'text' },
    ]).catch(err => console.error('[Translator] Testimonial update error:', err.message));
  } catch (err) {
    console.error('PUT /api/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authMiddleware, idParam, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Testimonio eliminado' });
  } catch (err) {
    console.error('DELETE /api/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
