const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(423).json({
        error: `Cuenta bloqueada temporalmente. Inténtalo en ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}.`,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
        await conn.query(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [attempts, lockedUntil, user.id]
        );
        return res.status(423).json({
          error: `Demasiados intentos fallidos. Cuenta bloqueada durante ${LOCKOUT_MINUTES} minutos.`,
        });
      }
      await conn.query('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [attempts, user.id]);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Successful login — reset failed attempts and lockout
    await conn.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
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
