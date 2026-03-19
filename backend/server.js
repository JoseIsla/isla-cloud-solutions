require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const newsRoutes = require('./routes/news');
const contactsRoutes = require('./routes/contacts');
const contentsRoutes = require('./routes/contents');
const uploadRoutes = require('./routes/upload');
const clientsRoutes = require('./routes/clients');
const casesRoutes = require('./routes/cases');

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://www.islacloudsolutions.com')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/clients', clientsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Isla Cloud API running on port ${PORT}`);
});
