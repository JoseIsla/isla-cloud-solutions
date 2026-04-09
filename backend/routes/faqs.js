const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const { translateEntityAndSave } = require('../services/translator');

const router = express.Router();

const faqValidation = [
  body('question').trim().notEmpty().isLength({ max: 500 }),
  body('answer').trim().notEmpty().isLength({ max: 5000 }),
  body('sort_order').optional().isInt({ min: 0, max: 9999 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
];

const idParam = param('id').isInt({ min: 1 });

function applyLang(row, lang) {
  if (lang !== 'en') return row;
  const r = { ...row };
  if (r.question_en) r.question = r.question_en;
  if (r.answer_en) r.answer = r.answer_en;
  return r;
}

// GET /api/faqs — public (active only, sorted)
router.get('/', [query('lang').optional().isIn(['es', 'en'])], async (req, res) => {
  let conn;
  try {
    const lang = req.query.lang || 'es';
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows.map(r => applyLang(r, lang)));
  } catch (err) {
    console.error('GET /api/faqs error:', err.message);
    res.status(500).json({ error: 'Error obteniendo FAQs' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/faqs/all — admin (all)
router.get('/all', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/faqs/all error:', err.message);
    res.status(500).json({ error: 'Error obteniendo FAQs' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/faqs — admin
router.post('/', authMiddleware, faqValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { question, answer, sort_order = 0, is_active = 1 } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, ?)',
      [question, answer, sort_order, is_active]
    );
    const insertedId = Number(result.insertId);
    res.status(201).json({ id: insertedId });

    translateEntityAndSave(pool, 'faqs', insertedId, [
      { field: 'question', value: question, type: 'text' },
      { field: 'answer', value: answer, type: 'html' },
    ]).catch(err => console.error('[Translator] FAQ create error:', err.message));
  } catch (err) {
    console.error('POST /api/faqs error:', err.message);
    res.status(500).json({ error: 'Error creando FAQ' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/faqs/:id — admin
router.put('/:id', authMiddleware, idParam, faqValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { question, answer, sort_order, is_active } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [question, answer, sort_order, is_active, req.params.id]
    );
    res.json({ success: true });

    translateEntityAndSave(pool, 'faqs', Number(req.params.id), [
      { field: 'question', value: question, type: 'text' },
      { field: 'answer', value: answer, type: 'html' },
    ]).catch(err => console.error('[Translator] FAQ update error:', err.message));
  } catch (err) {
    console.error('PUT /api/faqs/:id error:', err.message);
    res.status(500).json({ error: 'Error actualizando FAQ' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/faqs/:id — admin
router.delete('/:id', authMiddleware, idParam, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/faqs/:id error:', err.message);
    res.status(500).json({ error: 'Error eliminando FAQ' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
