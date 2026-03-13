const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
});

// POST /api/contacts (public, rate-limited)
router.post('/', contactLimiter, [
  body('nombre').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().isLength({ max: 255 }),
  body('mensaje').trim().notEmpty().isLength({ max: 1000 }),
  body('empresa').optional().trim().isLength({ max: 100 }),
  body('telefono').optional().trim().isLength({ max: 20 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { nombre, email, empresa, telefono, mensaje } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO contacts (nombre, email, empresa, telefono, mensaje) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, empresa || '', telefono || '', mensaje]
    );
    conn.release();
    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /api/contacts (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM contacts ORDER BY created_at DESC');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT /api/contacts/:id/read (admin)
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Marcado como leído' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE /api/contacts/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    conn.release();
    res.json({ message: 'Contacto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
