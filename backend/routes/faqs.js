const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/faqs — public (active only, sorted)
router.get('/', async (req, res) => {
  try {
    const rows = await pool.query(
      'SELECT * FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo FAQs' });
  }
});

// GET /api/faqs/all — admin (all)
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo FAQs' });
  }
});

// POST /api/faqs — admin
router.post('/', auth, async (req, res) => {
  try {
    const { question, answer, sort_order = 0, is_active = 1 } = req.body;
    const result = await pool.query(
      'INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, ?)',
      [question, answer, sort_order, is_active]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: 'Error creando FAQ' });
  }
});

// PUT /api/faqs/:id — admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { question, answer, sort_order, is_active } = req.body;
    await pool.query(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [question, answer, sort_order, is_active, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando FAQ' });
  }
});

// DELETE /api/faqs/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando FAQ' });
  }
});

module.exports = router;
