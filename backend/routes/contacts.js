const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendContactNotification, sendContactConfirmation } = require('../config/mailer');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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
  body('recaptchaToken').trim().notEmpty().withMessage('reCAPTCHA es obligatorio'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Verify reCAPTCHA token with Google
  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${req.body.recaptchaToken}`;
      const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        return res.status(400).json({ error: 'Verificación reCAPTCHA fallida. Inténtalo de nuevo.' });
      }
    }
  } catch (recaptchaErr) {
    console.error('reCAPTCHA verification error:', recaptchaErr.message);
    return res.status(500).json({ error: 'Error verificando reCAPTCHA' });
  }

  let conn;
  try {
    const { nombre, email, empresa, telefono, mensaje } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO contacts (nombre, email, empresa, telefono, mensaje) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, empresa || '', telefono || '', mensaje]
    );
    res.status(201).json({ message: 'Mensaje enviado correctamente' });

    // Enviar notificación por email (no bloqueante)
    let notifConn;
    try {
      notifConn = await pool.getConnection();
      const rows = await notifConn.query("SELECT value FROM contents WHERE content_key = 'contact_email'");
      const toEmail = (rows.length > 0 && rows[0].value) ? rows[0].value : process.env.SMTP_USER;
      if (toEmail) {
        sendContactNotification({ nombre, email, empresa, telefono, mensaje }, toEmail);
      }
      // Confirmación al usuario
      sendContactConfirmation({ nombre, email });
    } catch (notifErr) {
      console.error('Error obteniendo email destino:', notifErr.message);
    } finally {
      if (notifConn) notifConn.release();
    }
  } catch (err) {
    console.error('POST /api/contacts error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/contacts (admin)
router.get('/', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/contacts error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/contacts/:id/read (admin)
router.put('/:id/read', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marcado como leído' });
  } catch (err) {
    console.error('PUT /api/contacts/:id/read error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/contacts/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contacto eliminado' });
  } catch (err) {
    console.error('DELETE /api/contacts/:id error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
