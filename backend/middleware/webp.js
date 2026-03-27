const path = require('path');
const fs = require('fs');

/**
 * Middleware that serves WebP variants of images when:
 * 1. The browser sends Accept: image/webp
 * 2. A .webp variant exists alongside the original file
 *
 * Usage: app.use('/uploads', webpMiddleware(uploadsDir), express.static(uploadsDir))
 */
function webpMiddleware(staticDir) {
  return (req, res, next) => {
    // Only handle GET requests for image files
    if (req.method !== 'GET') return next();

    const ext = path.extname(req.path).toLowerCase();
    // Only convert known raster formats
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return next();

    // Check if browser accepts WebP
    const accept = req.headers.accept || '';
    if (!accept.includes('image/webp')) return next();

    // Check if WebP variant exists on disk
    const baseName = req.path.replace(/\.(jpe?g|png)$/i, '.webp');
    const webpPath = path.join(staticDir, baseName);

    if (!fs.existsSync(webpPath)) return next();

    // Serve the WebP variant with proper headers
    res.set('Content-Type', 'image/webp');
    res.set('Vary', 'Accept'); // Critical for CDN/proxy caching
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(webpPath);
  };
}

module.exports = webpMiddleware;
