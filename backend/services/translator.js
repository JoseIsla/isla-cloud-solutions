/**
 * Servicio de traducción automática ES → EN usando OpenAI.
 * Mantiene un buffer en memoria con diagnósticos para exponerlos en el panel.
 */

const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o-mini';
const MAX_RECENT_EVENTS = 50;
const skipPatterns = [
  '_logo_', '_bg_', '_image', '_url', '_icon', '_color',
  'social_links', 'recaptcha', 'site_logo', 'hero_bg',
];

const translatorState = {
  recentEvents: [],
  lastSuccess: null,
  lastError: null,
  lastBulkRequest: null,
};

function pushDiagnostic(event) {
  const normalized = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    status: 'info',
    stage: 'runtime',
    key: null,
    message: '',
    details: '',
    log: true,
    ...event,
  };

  translatorState.recentEvents.unshift(normalized);
  translatorState.recentEvents = translatorState.recentEvents.slice(0, MAX_RECENT_EVENTS);

  if (normalized.status === 'error') translatorState.lastError = normalized;
  if (normalized.status === 'success') translatorState.lastSuccess = normalized;

  if (normalized.log) {
    const prefix = `[Translator:${normalized.status}]`;
    const suffix = normalized.details ? ` | ${normalized.details}` : '';

    if (normalized.status === 'error') {
      console.error(`${prefix} ${normalized.message}${suffix}`);
    } else if (normalized.status === 'warning') {
      console.warn(`${prefix} ${normalized.message}${suffix}`);
    } else {
      console.log(`${prefix} ${normalized.message}${suffix}`);
    }
  }

  return normalized;
}

function getTranslatorRuntimeState() {
  const fetchAvailable = typeof fetch === 'function';

  return {
    openaiConfigured: Boolean(OPENAI_API_KEY),
    model: MODEL,
    transport: fetchAvailable ? 'fetch' : 'https',
    fetchAvailable,
  };
}

function shouldSkipTranslationKey(key = '') {
  return skipPatterns.some((pattern) => key.includes(pattern));
}

function canAutoTranslateKey(key = '', contentType = 'text') {
  if (!key || key.endsWith('__en')) return false;
  if (shouldSkipTranslationKey(key)) return false;
  if (contentType === 'json') return false;
  return true;
}

function shouldTranslateContent(rowOrKey, value, contentType) {
  if (typeof rowOrKey === 'string') {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';
    return canAutoTranslateKey(rowOrKey, contentType) && trimmedValue.length > 0;
  }

  const row = rowOrKey || {};
  const rowValue = typeof row.value === 'string' ? row.value.trim() : '';
  return canAutoTranslateKey(row.content_key, row.content_type) && rowValue.length > 0;
}

function noteBulkTranslationRequested(requestedCount, queuedKeys = []) {
  translatorState.lastBulkRequest = {
    timestamp: new Date().toISOString(),
    requestedCount,
    sampleKeys: queuedKeys.slice(0, 10),
  };

  pushDiagnostic({
    status: 'info',
    stage: 'bulk_request',
    message: `Traducción masiva solicitada para ${requestedCount} contenidos`,
    details: queuedKeys.length ? `Primeras claves: ${queuedKeys.slice(0, 5).join(', ')}` : '',
  });

  return translatorState.lastBulkRequest;
}

function summarizeTranslationRows(rows = []) {
  const baseRows = rows.filter((row) => !row.content_key.endsWith('__en'));
  const enRows = rows.filter((row) => row.content_key.endsWith('__en'));
  const enMap = new Map(enRows.map((row) => [row.content_key.replace(/__en$/, ''), row]));

  const translatableRows = baseRows.filter((row) => shouldTranslateContent(row));
  const skippedRows = baseRows.filter((row) => !shouldTranslateContent(row));

  const missingRows = translatableRows.filter((row) => {
    const translated = enMap.get(row.content_key);
    return !translated || !String(translated.value || '').trim();
  });

  const staleRows = translatableRows.filter((row) => {
    const translated = enMap.get(row.content_key);
    if (!translated || !translated.updated_at || !row.updated_at) return false;
    return new Date(translated.updated_at).getTime() < new Date(row.updated_at).getTime();
  });

  return {
    counts: {
      totalRows: rows.length,
      baseRows: baseRows.length,
      translatedRows: enRows.length,
      translatableRows: translatableRows.length,
      missingTranslations: missingRows.length,
      staleTranslations: staleRows.length,
      skippedRows: skippedRows.length,
    },
    sampleMissingKeys: missingRows.slice(0, 10).map((row) => row.content_key),
    sampleStaleKeys: staleRows.slice(0, 10).map((row) => row.content_key),
  };
}

async function getTranslationDiagnostics(pool) {
  const runtime = getTranslatorRuntimeState();
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT content_key, value, content_type, updated_at FROM contents');
    const summary = summarizeTranslationRows(rows);

    let status = 'healthy';
    if (!runtime.openaiConfigured) status = 'error';
    else if (translatorState.lastError) status = 'warning';
    else if (summary.counts.missingTranslations > 0 || summary.counts.staleTranslations > 0) status = 'warning';

    const issues = [];
    if (!runtime.openaiConfigured) issues.push('Falta OPENAI_API_KEY en el backend.');
    if (!runtime.fetchAvailable) issues.push('El runtime no expone fetch; el backend usará HTTPS nativo para llamar a OpenAI.');
    if (summary.counts.missingTranslations > 0) issues.push(`Hay ${summary.counts.missingTranslations} contenidos traducibles sin fila __en.`);
    if (summary.counts.staleTranslations > 0) issues.push(`Hay ${summary.counts.staleTranslations} traducciones EN desactualizadas respecto al contenido ES.`);
    if (translatorState.lastError?.message) issues.push(`Último error: ${translatorState.lastError.message}`);

    return {
      status,
      runtime,
      issues,
      ...summary,
      lastSuccess: translatorState.lastSuccess,
      lastError: translatorState.lastError,
      lastBulkRequest: translatorState.lastBulkRequest,
      recentEvents: translatorState.recentEvents.slice(0, 12),
    };
  } catch (err) {
    pushDiagnostic({
      status: 'error',
      stage: 'diagnostics',
      message: 'No se pudo calcular el diagnóstico de traducción',
      details: err.message,
    });

    return {
      status: 'error',
      runtime,
      issues: ['No se pudo consultar la base de datos para construir el diagnóstico.'],
      counts: {
        totalRows: 0,
        baseRows: 0,
        translatedRows: 0,
        translatableRows: 0,
        missingTranslations: 0,
        staleTranslations: 0,
        skippedRows: 0,
      },
      sampleMissingKeys: [],
      sampleStaleKeys: [],
      lastSuccess: translatorState.lastSuccess,
      lastError: translatorState.lastError,
      lastBulkRequest: translatorState.lastBulkRequest,
      recentEvents: translatorState.recentEvents.slice(0, 12),
      error: err.message,
    };
  } finally {
    if (conn) conn.release();
  }
}

function httpPostJson(url, headers, body) {
  if (typeof fetch === 'function') {
    return fetch(url, {
      method: 'POST',
      headers,
      body,
    });
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';

        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode || 500,
            text: async () => raw,
            json: async () => JSON.parse(raw || '{}'),
          });
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Tiempo de espera agotado al llamar a OpenAI')));
    req.write(body);
    req.end();
  });
}

/**
 * Traduce texto de español a inglés.
 * @param {string} text - Texto en español (puede contener HTML)
 * @param {'text'|'html'|'json'} contentType - Tipo de contenido
 * @param {string|null} key - Clave CMS para diagnóstico
 * @returns {Promise<string|null>} Texto traducido o null si falla
 */
async function translateToEnglish(text, contentType = 'text', key = null) {
  if (!OPENAI_API_KEY) {
    pushDiagnostic({
      status: 'error',
      stage: 'env',
      key,
      message: 'OPENAI_API_KEY no configurada; no se puede traducir automáticamente',
    });
    return null;
  }

  if (!text || text.trim().length === 0) return '';

  if (contentType === 'json') {
    try {
      return translateJsonValues(text);
    } catch (err) {
      pushDiagnostic({
        status: 'warning',
        stage: 'json_parse',
        key,
        message: 'No se pudo parsear el JSON; se omite la traducción',
        details: err.message,
      });
      return null;
    }
  }

  const systemPrompt = contentType === 'html'
    ? 'You are a professional translator. Translate the following HTML content from Spanish to English. Preserve ALL HTML tags, attributes, and structure exactly. Return ONLY the translated HTML, nothing else.'
    : 'You are a professional translator. Translate the following text from Spanish to English. Return ONLY the translated text, nothing else.';

  try {
    const response = await httpPostJson(
      'https://api.openai.com/v1/chat/completions',
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      })
    );

    if (!response.ok) {
      const err = await response.text();
      pushDiagnostic({
        status: 'error',
        stage: 'openai_api',
        key,
        message: `OpenAI respondió con ${response.status}`,
        details: err.slice(0, 280),
      });
      return null;
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim() || null;

    if (!translated) {
      pushDiagnostic({
        status: 'error',
        stage: 'openai_parse',
        key,
        message: 'OpenAI no devolvió texto traducido',
        details: JSON.stringify(data).slice(0, 280),
      });
      return null;
    }

    return translated;
  } catch (err) {
    pushDiagnostic({
      status: 'error',
      stage: 'openai_request',
      key,
      message: 'Error llamando a OpenAI',
      details: err.message,
    });
    return null;
  }
}

/**
 * Traduce los valores de texto dentro de un JSON string.
 * Útil para estructuras como nav links donde los labels deben traducirse.
 */
async function translateJsonValues(jsonString) {
  const parsed = JSON.parse(jsonString);

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
  if (!canAutoTranslateKey(key, contentType)) {
    pushDiagnostic({
      status: 'info',
      stage: 'skip',
      key,
      message: 'Contenido omitido de la auto-traducción',
      details: 'La clave es EN, está marcada como visual/configuración o el tipo es JSON.',
      log: false,
    });
    return { status: 'skipped', key };
  }

  if (!String(value || '').trim()) {
    pushDiagnostic({
      status: 'info',
      stage: 'empty_sync',
      key,
      message: 'Contenido vacío; se sincronizará la fila EN vacía',
      log: false,
    });
  }

  try {
    const translated = await translateToEnglish(value, contentType, key);
    if (translated === null) return { status: 'error', key };

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
          'UPDATE contents SET title = ?, value = ?, content_type = ?, updated_at = NOW() WHERE content_key = ?',
          [`${title || key} (EN)`, translated, contentType || 'text', enKey]
        );
      }

      pushDiagnostic({
        status: 'success',
        stage: 'db_save',
        key,
        message: `Traducción guardada correctamente en ${enKey}`,
      });

      return { status: 'success', key, enKey };
    } catch (err) {
      pushDiagnostic({
        status: 'error',
        stage: 'db_save',
        key,
        message: `No se pudo guardar la fila ${enKey}`,
        details: err.message,
      });
      return { status: 'error', key, enKey };
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    pushDiagnostic({
      status: 'error',
      stage: 'translate_and_save',
      key,
      message: `Error traduciendo ${key}`,
      details: err.message,
    });
    return { status: 'error', key };
  }
}

module.exports = {
  canAutoTranslateKey,
  getTranslationDiagnostics,
  getTranslatorRuntimeState,
  noteBulkTranslationRequested,
  shouldSkipTranslationKey,
  shouldTranslateContent,
  translateToEnglish,
  translateAndSave,
};
