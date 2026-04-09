/**
 * Servicio de traducción automática ES → EN usando DeepL Free API.
 * Mantiene un buffer en memoria con diagnósticos para exponerlos en el panel.
 */

const https = require('https');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_BASE_URL = 'https://api-free.deepl.com/v2/translate';
const MAX_RECENT_EVENTS = 50;
const skipPatterns = [
  '_logo_', '_bg_', '_image', '_url', '_icon', '_color',
  'social_links', 'recaptcha', 'site_logo', 'hero_bg',
  '_order', '_link_url', '_href',
];

// Keys whose value is a route path (starts with /) — never translate
const skipExactKeys = [
  // Navigation link URLs are routes, not translatable text
];

// Brand terms that must never be altered by DeepL
const BRAND_GLOSSARY = [
  { term: 'Isla Cloud Solutions', replacement: 'Isla Cloud Solutions' },
  { term: 'Isla Cloud', replacement: 'Isla Cloud' },
  { term: 'IslaCloud', replacement: 'IslaCloud' },
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
  return {
    deeplConfigured: Boolean(DEEPL_API_KEY),
    // Keep openaiConfigured for backwards compat with frontend diagnostics
    openaiConfigured: Boolean(DEEPL_API_KEY),
    model: 'DeepL Free',
    transport: typeof fetch === 'function' ? 'fetch' : 'https',
    fetchAvailable: typeof fetch === 'function',
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

/**
 * Checks if a value is actually translatable text (not a route, number, etc.)
 */
function isTranslatableValue(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  // Skip route paths like /servicios, /contacto
  if (/^\/[a-z0-9\-\/]*$/i.test(trimmed)) return false;
  // Skip pure numbers or orders like "1", "2", "100"
  if (/^\d+$/.test(trimmed)) return false;
  // Skip URLs
  if (/^https?:\/\//i.test(trimmed)) return false;
  // Skip email addresses
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
  return true;
}

function shouldTranslateContent(rowOrKey, value, contentType) {
  if (typeof rowOrKey === 'string') {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';
    return canAutoTranslateKey(rowOrKey, contentType) && trimmedValue.length > 0 && isTranslatableValue(trimmedValue);
  }

  const row = rowOrKey || {};
  const rowValue = typeof row.value === 'string' ? row.value.trim() : '';
  return canAutoTranslateKey(row.content_key, row.content_type) && rowValue.length > 0 && isTranslatableValue(rowValue);
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
    if (!runtime.deeplConfigured) status = 'error';
    else if (translatorState.lastError) status = 'warning';
    else if (summary.counts.missingTranslations > 0 || summary.counts.staleTranslations > 0) status = 'warning';

    const issues = [];
    if (!runtime.deeplConfigured) issues.push('Falta DEEPL_API_KEY en el backend.');
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

/**
 * Llama a la API de DeepL Free para traducir texto.
 */
function httpPostForm(url, params) {
  const body = new URLSearchParams(params).toString();

  if (typeof fetch === 'function') {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
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
    req.setTimeout(30000, () => req.destroy(new Error('Tiempo de espera agotado al llamar a DeepL')));
    req.write(body);
    req.end();
  });
}

/**
 * Traduce texto de español a inglés usando DeepL.
 * @param {string} text - Texto en español (puede contener HTML)
 * @param {'text'|'html'|'json'} contentType - Tipo de contenido
 * @param {string|null} key - Clave CMS para diagnóstico
 * @returns {Promise<string|null>} Texto traducido o null si falla
 */
async function translateToEnglish(text, contentType = 'text', key = null) {
  if (!DEEPL_API_KEY) {
    pushDiagnostic({
      status: 'error',
      stage: 'env',
      key,
      message: 'DEEPL_API_KEY no configurada; no se puede traducir automáticamente',
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

  try {
    // Check if value is actually translatable
    if (!isTranslatableValue(text)) {
      pushDiagnostic({
        status: 'info',
        stage: 'skip_value',
        key,
        message: 'Valor no traducible (ruta, número o URL); se copia tal cual',
        log: false,
      });
      return text; // Return as-is (route, number, etc.)
    }

    // Protect brand names: replace with placeholders before sending to DeepL
    let processedText = text;
    const brandPlaceholders = [];
    BRAND_GLOSSARY.forEach((entry, i) => {
      const placeholder = `__BRAND${i}__`;
      const regex = new RegExp(entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(processedText)) {
        processedText = processedText.replace(regex, placeholder);
        brandPlaceholders.push({ placeholder, replacement: entry.replacement });
      }
    });

    const params = {
      text: processedText,
      source_lang: 'ES',
      target_lang: 'EN',
    };

    // DeepL soporta HTML nativamente con tag_handling
    if (contentType === 'html') {
      params.tag_handling = 'html';
    }

    const response = await httpPostForm(DEEPL_BASE_URL, params);

    if (!response.ok) {
      const err = await response.text();
      pushDiagnostic({
        status: 'error',
        stage: 'deepl_api',
        key,
        message: `DeepL respondió con ${response.status}`,
        details: err.slice(0, 280),
      });
      return null;
    }

    const data = await response.json();
    const translated = data.translations?.[0]?.text?.trim() || null;

    if (!translated) {
      pushDiagnostic({
        status: 'error',
        stage: 'deepl_parse',
        key,
        message: 'DeepL no devolvió texto traducido',
        details: JSON.stringify(data).slice(0, 280),
      });
      return null;
    }

    // Restore brand placeholders
    let finalText = translated;
    brandPlaceholders.forEach(({ placeholder, replacement }) => {
      finalText = finalText.split(placeholder).join(replacement);
    });

    return finalText;
  } catch (err) {
    pushDiagnostic({
      status: 'error',
      stage: 'deepl_request',
      key,
      message: 'Error llamando a DeepL',
      details: err.message,
    });
    return null;
  }
}

/**
 * Traduce los valores de texto dentro de un JSON string.
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

/**
 * Traduce campos de una entidad (servicio, noticia, caso) y guarda en columnas _en.
 * @param {object} pool - Pool de conexiones
 * @param {string} table - Nombre de la tabla (services, news, success_cases)
 * @param {number} id - ID del registro
 * @param {Array<{field: string, value: string, type: 'text'|'html'}>} fields - Campos a traducir
 */
async function translateEntityAndSave(pool, table, id, fields) {
  const label = `${table}#${id}`;
  let conn;

  try {
    const translations = {};
    for (const { field, value, type } of fields) {
      if (!value || !String(value).trim()) {
        translations[field + '_en'] = '';
        continue;
      }
      // Special handling for features (JSON array of strings)
      if (field === 'features' && type === 'json') {
        try {
          const arr = typeof value === 'string' ? JSON.parse(value) : value;
          if (Array.isArray(arr)) {
            const translated = [];
            for (const item of arr) {
              if (typeof item === 'string' && item.trim()) {
                const t = await translateToEnglish(item, 'text', `${label}.${field}`);
                translated.push(t || item);
              } else {
                translated.push(item);
              }
            }
            translations[field + '_en'] = JSON.stringify(translated);
          }
        } catch (e) {
          pushDiagnostic({ status: 'warning', stage: 'entity_json', key: label, message: `Error traduciendo features: ${e.message}` });
        }
        continue;
      }
      const translated = await translateToEnglish(value, type || 'text', `${label}.${field}`);
      translations[field + '_en'] = translated !== null ? translated : '';
    }

    const sets = Object.keys(translations).map(col => `\`${col}\` = ?`).join(', ');
    const values = Object.values(translations);
    values.push(id);

    conn = await pool.getConnection();
    await conn.query(`UPDATE \`${table}\` SET ${sets} WHERE id = ?`, values);

    pushDiagnostic({
      status: 'success',
      stage: 'entity_translate',
      key: label,
      message: `Traducción de ${table} #${id} guardada (${fields.length} campos)`,
    });

    return { status: 'success', table, id };
  } catch (err) {
    pushDiagnostic({
      status: 'error',
      stage: 'entity_translate',
      key: label,
      message: `Error traduciendo ${table} #${id}`,
      details: err.message,
    });
    return { status: 'error', table, id };
  } finally {
    if (conn) conn.release();
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
  translateEntityAndSave,
};
