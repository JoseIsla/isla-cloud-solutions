const crypto = require('crypto');

/**
 * API response caching middleware.
 *
 * - Public GET endpoints: Cache-Control with stale-while-revalidate + ETag
 * - Authenticated/mutating requests: no-store
 *
 * @param {object} opts
 * @param {number} opts.maxAge        - Cache max-age in seconds (default 60)
 * @param {number} opts.swr           - stale-while-revalidate window in seconds (default 120)
 * @param {boolean} opts.isPrivate    - Force private/no-store (for authenticated routes)
 */
function cacheControl({ maxAge = 60, swr = 120, isPrivate = false } = {}) {
  return (req, res, next) => {
    // Only cache safe methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.set('Cache-Control', 'no-store');
      return next();
    }

    // Private routes or requests with Authorization header → no cache
    if (isPrivate || req.headers.authorization) {
      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return next();
    }

    // Override res.json to inject ETag
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const payload = JSON.stringify(body);
      const etag = '"' + crypto.createHash('md5').update(payload).digest('hex').slice(0, 16) + '"';

      res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${swr}`);
      res.set('ETag', etag);
      res.set('Vary', 'Accept, Accept-Encoding');

      // If client sent If-None-Match and it matches → 304
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag && clientEtag === etag) {
        return res.status(304).end();
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = cacheControl;
