const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Validation helper
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return null;
};

// GET /api/users — list all admin users
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error listing users:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/users — create new user
router.post('/',
  body('name').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 100 }).withMessage('Nombre demasiado largo'),
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('role').optional().isIn(['admin']).withMessage('Rol inválido'),
  async (req, res) => {
    const err = validate(req, res);
    if (err) return;

    let conn;
    try {
      const { name, email, password, role = 'admin' } = req.body;
      conn = await pool.getConnection();

      // Check duplicate email
      const existing = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await conn.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );

      res.status(201).json({
        id: Number(result.insertId),
        name,
        email,
        role,
      });
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Error del servidor' });
    } finally {
      if (conn) conn.release();
    }
  }
);

// PUT /api/users/me/password — change own password (MUST be before /:id to avoid conflict)
router.put('/me/password',
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
  async (req, res) => {
    const err = validate(req, res);
    if (err) return;

    let conn;
    try {
      const { currentPassword, newPassword } = req.body;
      conn = await pool.getConnection();

      const rows = await conn.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const valid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!valid) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

      res.json({ success: true });
    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ error: 'Error del servidor' });
    } finally {
      if (conn) conn.release();
    }
  }
);

// PUT /api/users/:id — update user (name, email, password optional)
router.put('/:id',
  param('id').isInt().withMessage('ID inválido'),
  body('name').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 100 }).withMessage('Nombre demasiado largo'),
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  async (req, res) => {
    const err = validate(req, res);
    if (err) return;

    let conn;
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      conn = await pool.getConnection();

      // Check user exists
      const rows = await conn.query('SELECT id FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Check duplicate email (excluding current user)
      const dup = await conn.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (dup.length > 0) {
        return res.status(409).json({ error: 'Ya existe otro usuario con ese email' });
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await conn.query(
          'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
          [name, email, hashedPassword, id]
        );
      } else {
        await conn.query(
          'UPDATE users SET name = ?, email = ? WHERE id = ?',
          [name, email, id]
        );
      }

      res.json({ id: Number(id), name, email });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Error del servidor' });
    } finally {
      if (conn) conn.release();
    }
  }
);

// DELETE /api/users/:id
router.delete('/:id',
  param('id').isInt().withMessage('ID inválido'),
  async (req, res) => {
    const err = validate(req, res);
    if (err) return;

    let conn;
    try {
      const { id } = req.params;
      conn = await pool.getConnection();

      // Prevent deleting yourself
      if (Number(id) === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
      }

      // Check at least one admin remains
      const admins = await conn.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
      if (Number(admins[0].count) <= 1) {
        return res.status(400).json({ error: 'Debe haber al menos un administrador' });
      }

      const result = await conn.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Error del servidor' });
    } finally {
      if (conn) conn.release();
    }
  }
);

module.exports = router;
