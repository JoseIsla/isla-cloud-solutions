/**
 * Servicio de traducción automática ES → EN usando OpenAI
 * Se ejecuta en background (fire-and-forget) tras guardar contenido.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o-mini';

/**
 * Traduce texto de español a inglés.
 * @param {string} text - Texto en español (puede contener HTML)
 * @param {'text'|'html'|'json'} contentType - Tipo de contenido
 * @returns {Promise<string|null>} Texto traducido o null si falla
 */
async function translateToEnglish(text, contentType = 'text') {
  if (!OPENAI_API_KEY) {
    console.warn('[Translator] OPENAI_API_KEY no configurada, omitiendo traducción');
    return null;
  }

  if (!text || text.trim().length === 0) return '';

  // No traducir contenido JSON estructural (nav links, social config, etc.)
  if (contentType === 'json') {
    try {
      return translateJsonValues(text);
    } catch {
      console.warn('[Translator] No se pudo parsear JSON, omitiendo traducción');
      return null;
    }
  }

  const systemPrompt = contentType === 'html'
    ? 'You are a professional translator. Translate the following HTML content from Spanish to English. Preserve ALL HTML tags, attributes, and structure exactly. Return ONLY the translated HTML, nothing else.'
    : 'You are a professional translator. Translate the following text from Spanish to English. Return ONLY the translated text, nothing else.';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Translator] OpenAI API error:', response.status, err);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[Translator] Error llamando a OpenAI:', err.message);
    return null;
  }
}

/**
 * Traduce los valores de texto dentro de un JSON string.
 * Útil para estructuras como nav links donde los labels deben traducirse.
 */
async function translateJsonValues(jsonString) {
  const parsed = JSON.parse(jsonString);

  // Si es un array de objetos con 'label', traducir cada label
  if (Array.isArray(parsed)) {
    const translated = [];
    for (const item of parsed) {
      if (typeof item === 'object' && item !== null) {
        const newItem = { ...item };
        if (typeof newItem.label === 'string' && newItem.label.trim()) {
          const t = await translateToEnglish(newItem.label, 'text');
          if (t) newItem.label = t;
        }
        if (typeof newItem.text === 'string' && newItem.text.trim()) {
          const t = await translateToEnglish(newItem.text, 'text');
          if (t) newItem.text = t;
        }
        translated.push(newItem);
      } else {
        translated.push(item);
      }
    }
    return JSON.stringify(translated);
  }

  // Si es un objeto simple, traducir valores string
  if (typeof parsed === 'object' && parsed !== null) {
    const result = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) {
        const t = await translateToEnglish(value, 'text');
        result[key] = t || value;
      } else {
        result[key] = value;
      }
    }
    return JSON.stringify(result);
  }

  return null;
}

/**
 * Traduce y guarda la versión EN de un contenido en background.
 * @param {object} pool - Pool de conexión a la BD
 * @param {string} key - Clave original del contenido (sin sufijo)
 * @param {string} value - Valor en español
 * @param {string} contentType - Tipo de contenido
 * @param {string} [title] - Título descriptivo
 */
async function translateAndSave(pool, key, value, contentType, title) {
  // No traducir claves que ya son traducciones
  if (key.endsWith('__en')) return;

  // No traducir claves de configuración visual (imágenes, logos, URLs)
  const skipPatterns = [
    '_logo_', '_bg_', '_image', '_url', '_icon', '_color',
    'social_links', 'recaptcha', 'site_logo', 'hero_bg',
  ];
  if (skipPatterns.some(p => key.includes(p))) return;

  try {
    const translated = await translateToEnglish(value, contentType);
    if (translated === null) return;

    const enKey = `${key}__en`;
    let conn;
    try {
      conn = await pool.getConnection();
      const existing = await conn.query('SELECT id FROM contents WHERE content_key = ?', [enKey]);

      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)',
          [enKey, `${title || key} (EN)`, translated, contentType || 'text']
        );
      } else {
        await conn.query(
          'UPDATE contents SET value = ?, updated_at = NOW() WHERE content_key = ?',
          [translated, enKey]
        );
      }
      console.log(`[Translator] ✓ Traducido: ${key} → ${enKey}`);
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    console.error(`[Translator] Error traduciendo ${key}:`, err.message);
  }
}

module.exports = { translateToEnglish, translateAndSave };
