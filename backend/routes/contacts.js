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

    // Resolver email destino ANTES de responder
    let toEmail = process.env.SMTP_USER;
    try {
      const rows = await conn.query("SELECT value FROM contents WHERE content_key = 'contact_email'");
      if (rows.length > 0 && rows[0].value) toEmail = rows[0].value;
    } catch (e) {
      console.error('[CONTACTS] No se pudo leer contact_email de BD:', e.message);
    }
    console.log(`[CONTACTS] Lead guardado. Notificando a "${toEmail}". SMTP_USER="${process.env.SMTP_USER}"`);

    // Responder al cliente inmediatamente (no bloqueamos UX por SMTP lento)
    res.status(201).json({ message: 'Mensaje enviado correctamente' });

    // Disparar emails con manejo de errores asegurado (sin unhandledRejection)
    Promise.allSettled([
      sendContactNotification({ nombre, email, empresa, telefono, mensaje }, toEmail),
      sendContactConfirmation({ nombre, email }),
    ]).then((results) => {
      const [notif, conf] = results;
      console.log(`[CONTACTS] Resultado notificación admin: ${JSON.stringify(notif.value || notif.reason)}`);
      console.log(`[CONTACTS] Resultado confirmación user: ${JSON.stringify(conf.value || conf.reason)}`);
    }).catch((e) => {
      console.error('[CONTACTS] Error inesperado en envío de emails:', e);
    });
  } catch (err) {
    console.error('POST /api/contacts error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'Error del servidor' });
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
