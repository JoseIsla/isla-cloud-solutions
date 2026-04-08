const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const { translateAndSave } = require('../services/translator');

const router = express.Router();

// GET /api/contents (public) — supports ?lang=en
router.get('/', [
  query('lang').optional().isIn(['es', 'en']),
], async (req, res) => {
  let conn;
  try {
    const lang = req.query.lang || 'es';
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM contents');

    const map = {};

    if (lang === 'en') {
      // Build maps: base keys and __en keys
      const baseRows = {};
      const enRows = {};
      rows.forEach(row => {
        if (row.content_key.endsWith('__en')) {
          enRows[row.content_key.replace('__en', '')] = row;
        } else {
          baseRows[row.content_key] = row;
        }
      });

      // For each base key, prefer __en version, fallback to ES
      for (const [key, row] of Object.entries(baseRows)) {
        map[key] = enRows[key] || row;
        // Ensure the key in the response is the base key
        map[key] = { ...map[key], content_key: key };
      }
    } else {
      // Spanish: return only base keys (exclude __en)
      rows.forEach(row => {
        if (!row.content_key.endsWith('__en')) {
          map[row.content_key] = row;
        }
      });
    }

    res.json(map);
  } catch (err) {
    console.error('GET /api/contents error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/contents/:key (admin) — auto-translates to EN in background
router.put('/:key', authMiddleware, [
  param('key').trim().notEmpty().isLength({ max: 100 }).matches(/^[a-z0-9_]+$/),
  body('value').optional().isLength({ max: 100000 }),
  body('title').optional().trim().isLength({ max: 255 }),
  body('content_type').optional().isIn(['text', 'html', 'json']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let conn;
  try {
    const { value, title, content_type } = req.body;
    conn = await pool.getConnection();
    const existing = await conn.query('SELECT id, content_type FROM contents WHERE content_key = ?', [req.params.key]);

    let resolvedContentType = content_type;

    if (existing.length === 0) {
      resolvedContentType = content_type || 'text';
      await conn.query(
        'INSERT INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)',
        [req.params.key, title || req.params.key, value || '', resolvedContentType]
      );
    } else {
      resolvedContentType = content_type || existing[0].content_type || 'text';
      const updates = ['value = ?'];
      const params = [value || ''];
      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (content_type !== undefined) {
        updates.push('content_type = ?');
        params.push(content_type);
      }
      updates.push('updated_at = NOW()');
      params.push(req.params.key);
      await conn.query(
        `UPDATE contents SET ${updates.join(', ')} WHERE content_key = ?`,
        params
      );
    }

    res.json({ message: 'Contenido actualizado' });

    // Fire-and-forget: translate in background
    if (!req.params.key.endsWith('__en')) {
      translateAndSave(pool, req.params.key, value || '', resolvedContentType, title)
        .catch(err => console.error('[Translator] Background error:', err.message));
    }
  } catch (err) {
    console.error('Error updating content:', req.params.key, err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/contents/translate-all (admin) — retranslate all ES contents to EN
router.post('/translate-all', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT content_key, value, content_type, title FROM contents WHERE content_key NOT LIKE '%\\_\\_en' ESCAPE '\\\\'");
    conn.release();
    conn = null;

    const translatable = rows.filter(r => r.value && r.value.trim() && r.content_type !== 'json');
    res.json({ message: `Traduciendo ${translatable.length} contenidos en background`, count: translatable.length });

    // Fire-and-forget all translations
    for (const row of translatable) {
      translateAndSave(pool, row.content_key, row.value, row.content_type || 'text', row.title)
        .catch(err => console.error('[Translator] Bulk error:', row.content_key, err.message));
    }
  } catch (err) {
    console.error('POST /api/contents/translate-all error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
