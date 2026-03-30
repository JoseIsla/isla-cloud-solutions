const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;

// Helper to get client IP
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const ip = getClientIp(req);
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Log failed attempt even if user doesn't exist
      await conn.query('INSERT INTO login_attempts (email, ip_address) VALUES (?, ?)', [email, ip]);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Check if account is permanently locked
    if (user.is_locked) {
      await conn.query('INSERT INTO login_attempts (email, ip_address) VALUES (?, ?)', [email, ip]);
      return res.status(423).json({
        error: 'Cuenta bloqueada por seguridad. Contacta con un administrador para desbloquearla.',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Log failed attempt
      await conn.query('INSERT INTO login_attempts (email, ip_address) VALUES (?, ?)', [email, ip]);

      const attempts = (user.failed_login_attempts || 0) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        // Permanent lock
        await conn.query(
          'UPDATE users SET failed_login_attempts = ?, is_locked = 1 WHERE id = ?',
          [attempts, user.id]
        );
        return res.status(423).json({
          error: 'Cuenta bloqueada por demasiados intentos fallidos. Contacta con un administrador.',
        });
      }
      await conn.query('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [attempts, user.id]);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Successful login — reset failed attempts
    await conn.query(
      'UPDATE users SET failed_login_attempts = 0, is_locked = 0, locked_until = NULL WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
