const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ── Seguridad ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xFrameOptions: false, // Permitimos iframes (controlado por CSP)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      scriptSrc:  ["'self'"],
      connectSrc: ["'self'", "http://localhost:3001", "https://api.hpvc.gob.ec"],
      frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:5174"],
    },
  },
}));

// ── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://hpvc.gob.ec', 'https://www.hpvc.gob.ec']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ── Rate Limit Global ────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Demasiadas solicitudes. Intente más tarde.' },
}));

// ── Body Parsers ─────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Archivos estáticos ───────────────────────────────────────────────
// PDFs de documentos clínicos: servidos inline para el visor integrado
app.use('/uploads/documentos', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(__dirname, '../public/uploads/documentos')));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/assets',  express.static(path.join(__dirname, '../public/assets')));

// ── Rutas API ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Servidor HPVC Ok.', timestamp: new Date().toISOString() });
});

app.use('/api/auth',    require('./routes/auth.routes'));
app.use('/api/public',  require('./routes/public.routes'));
app.use('/api/admin',   require('./routes/admin.routes'));

// ── Error Handler Global ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
