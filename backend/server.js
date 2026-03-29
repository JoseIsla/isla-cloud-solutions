require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Espera 15 minutos.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado demasiados mensajes. Inténtalo más tarde.' },
});

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const newsRoutes = require('./routes/news');
const contactsRoutes = require('./routes/contacts');
const contentsRoutes = require('./routes/contents');
const uploadRoutes = require('./routes/upload');
const clientsRoutes = require('./routes/clients');
const casesRoutes = require('./routes/cases');
const faqsRoutes = require('./routes/faqs');
const testimonialsRoutes = require('./routes/testimonials');
const mediaRoutes = require('./routes/media');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — must be BEFORE helmet so preflight OPTIONS work
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://www.islacloudsolutions.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const lovablePreviewHostSuffixes = ['.lovable.app', '.lovableproject.com'];

function getHostnameFromOrigin(origin) {
  if (!origin || typeof origin !== 'string') return '';

  return origin
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  const hostname = getHostnameFromOrigin(origin);
  if (!hostname) return false;

  return lovablePreviewHostSuffixes.some((suffix) => hostname.endsWith(suffix));
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Security — after CORS so preflight responses aren't blocked
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Compression — gzip/brotli for all responses > 1KB
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Global rate limiter
app.use('/api/', globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads — serve WebP variants automatically when browser supports it
const webpMiddleware = require('./middleware/webp');
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', webpMiddleware(uploadsDir), express.static(uploadsDir, {
  maxAge: '365d',
  immutable: true,
  setHeaders: (res) => {
    res.set('Vary', 'Accept');
  },
}));

// Cache middleware for public API routes
const cacheControl = require('./middleware/cache');

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/services', cacheControl({ maxAge: 300, swr: 600 }), servicesRoutes);
app.use('/api/news', cacheControl({ maxAge: 120, swr: 300 }), newsRoutes);
app.use('/api/contacts', contactLimiter, cacheControl({ isPrivate: true }), contactsRoutes);
app.use('/api/contents', cacheControl({ maxAge: 300, swr: 600 }), contentsRoutes);
app.use('/api/upload', cacheControl({ isPrivate: true }), uploadRoutes);
app.use('/api/clients', cacheControl({ maxAge: 600, swr: 1200 }), clientsRoutes);
app.use('/api/cases', cacheControl({ maxAge: 300, swr: 600 }), casesRoutes);
app.use('/api/testimonials', cacheControl({ maxAge: 600, swr: 1200 }), testimonialsRoutes);
app.use('/api/faqs', cacheControl({ maxAge: 600, swr: 1200 }), faqsRoutes);
app.use('/api/media', cacheControl({ maxAge: 300, swr: 600 }), mediaRoutes);
app.use('/api/users', cacheControl({ isPrivate: true }), usersRoutes);

// Health check — detailed diagnostics
app.get('/api/health', async (req, res) => {
  const checks = {
    server: { status: 'ok' },
    database: { status: 'unknown' },
    environment: { status: 'unknown', missing: [] },
  };

  // 1. Environment variables
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment.status = missing.length === 0 ? 'ok' : 'error';
  checks.environment.missing = missing;

  // 2. Database connectivity
  try {
    const pool = require('./config/db');
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT 1 AS ping');
    conn.release();
    checks.database.status = rows && rows[0] && rows[0].ping === 1 ? 'ok' : 'error';
  } catch (err) {
    checks.database.status = 'error';
    checks.database.error = err.message;
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    node: process.version,
    uptime: Math.round(process.uptime()) + 's',
    checks,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Isla Cloud API running on port ${PORT}`);
});
