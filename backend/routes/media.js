const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CATEGORIES = ['general', 'logos', 'fondos', 'servicios', 'noticias', 'casos', 'clientes', 'testimonios'];

// GET /api/media (admin) - list all media with optional filters
router.get('/', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(original_name LIKE ? OR alt_text LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error listing media:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/media/categories (admin) - list categories
router.get('/categories', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT DISTINCT category FROM media WHERE category IS NOT NULL ORDER BY category');
    const dbCategories = rows.map(r => r.category);
    const all = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])].sort();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/media (admin) - register a media entry (called after upload)
router.post('/', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { url, original_name, category, alt_text } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO media (url, original_name, category, alt_text) VALUES (?, ?, ?, ?)',
      [url, original_name || '', category || 'general', alt_text || '']
    );
    res.json({ id: Number(result.insertId), url });
  } catch (err) {
    console.error('Error creating media:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/media/:id (admin) - update category or alt_text
router.put('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    const { category, alt_text } = req.body;
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE media SET category = COALESCE(?, category), alt_text = COALESCE(?, alt_text) WHERE id = ?',
      [category, alt_text, req.params.id]
    );
    res.json({ message: 'Medio actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/media/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medio eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/media/sync (admin) - scan all tables for image URLs and register in media
router.post('/sync', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Gather all image URLs from every table that has them
    const sources = [
      { query: 'SELECT image_url AS url, title AS name FROM services WHERE image_url IS NOT NULL AND image_url != \'\'', category: 'servicios' },
      { query: 'SELECT image_url AS url, title AS name FROM news WHERE image_url IS NOT NULL AND image_url != \'\'', category: 'noticias' },
      { query: 'SELECT logo_url AS url, name FROM clients WHERE logo_url IS NOT NULL AND logo_url != \'\'', category: 'clientes' },
      { query: 'SELECT image_url AS url, title AS name FROM success_cases WHERE image_url IS NOT NULL AND image_url != \'\'', category: 'casos' },
      { query: 'SELECT avatar_url AS url, author_name AS name FROM testimonials WHERE avatar_url IS NOT NULL AND avatar_url != \'\'', category: 'testimonios' },
    ];

    // Also grab CMS content values that look like image URLs
    const cmsRows = await conn.query(
      "SELECT value AS url, title AS name FROM contents WHERE (content_key LIKE '%logo%' OR content_key LIKE '%bg%' OR content_key LIKE '%image%') AND value IS NOT NULL AND value != '' AND (value LIKE '%.jpg' OR value LIKE '%.png' OR value LIKE '%.webp' OR value LIKE '%.gif' OR value LIKE '%.svg' OR value LIKE '%/uploads/%')"
    );

    let inserted = 0;
    const allUrls = [];

    for (const src of sources) {
      const rows = await conn.query(src.query);
      for (const row of rows) {
        allUrls.push({ url: row.url, name: row.name || '', category: src.category });
      }
    }

    for (const row of cmsRows) {
      allUrls.push({ url: row.url, name: row.name || '', category: 'fondos' });
    }

    for (const item of allUrls) {
      // Check if already exists in media table
      const existing = await conn.query('SELECT id FROM media WHERE url = ?', [item.url]);
      if (existing.length === 0) {
        // Extract original filename from URL
        const originalName = item.name || item.url.split('/').pop() || '';
        await conn.query(
          'INSERT INTO media (url, original_name, category, alt_text) VALUES (?, ?, ?, ?)',
          [item.url, originalName, item.category, item.name]
        );
        inserted++;
      }
    }

    res.json({ message: `Sincronización completada: ${inserted} imagen(es) añadida(s)`, inserted, total: allUrls.length });
  } catch (err) {
    console.error('Error syncing media:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
