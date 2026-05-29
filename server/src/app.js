const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Confiar en el proxy inverso (Nginx) para leer la IP del cliente real
app.set('trust proxy', 1);

// ── Seguridad ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xFrameOptions: false,      // Controlado por frameAncestors en CSP
  permissionsPolicy: false,  // Evitar advertencias de features no reconocidas (web-share, bluetooth, etc.)
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://www.facebook.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https:", "blob:"],
      // scriptSrc: permite los SDK de redes sociales para renderizar embeds
      scriptSrc:   [
        "'self'",
        "'unsafe-inline'",          // Necesario para scripts inline de embeds FB/Instagram
        "https://connect.facebook.net",
        "https://www.instagram.com",
        "https://platform.twitter.com",
        "https://abs.twimg.com",
      ],
      // frame-src: dominios desde los que se pueden cargar iframes
      frameSrc:    [
        "'self'",
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://www.instagram.com",
        "https://platform.twitter.com",
        "https://twitter.com",
        "https://x.com",
        "https://www.youtube.com",
        "https://geoportal.salud.gob.ec",
      ],
      // media-src: videos de Facebook/Instagram
      mediaSrc:    ["'self'", "https://video.xx.fbcdn.net", "https:", "blob:"],
      connectSrc:  ["'self'", "http://localhost:3001", "http://192.168.5.134:3001", "https://api.hpvc.gob.ec", "http://hpvc.gob.ec", "https://hpvc.gob.ec", "http://186.47.77.39", "https://graph.facebook.com"],
      frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:5174", "http://192.168.5.134:5173", "http://192.168.5.134:5174", "http://hpvc.gob.ec", "https://hpvc.gob.ec", "http://186.47.77.39", "https://186.47.77.39"],
    },
  },
}));

// ── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://hpvc.gob.ec', 
        'https://www.hpvc.gob.ec', 
        'http://hpvc.gob.ec', 
        'http://www.hpvc.gob.ec', 
        'http://186.47.77.39', 
        'http://192.168.5.134:5173', 
        'http://192.168.5.134:5174', 
        'http://localhost:5173', 
        'http://localhost:5174'
      ]
    : function (origin, callback) { callback(null, true); }, // Permite cualquier IP/Puerto local en desarrollo
  credentials: true,
}));

// ── Rate Limiters ────────────────────────────────────────────────────
// Límite permisivo para el panel admin (operaciones legítimas intensivas)
const adminRateLimit = rateLimit({
  windowMs: 60_000, // 1 minuto
  max:      500,    // 500 req/min para admin (cargas de imágenes, etc.)
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.path.startsWith('/api/auth'), // auth tiene su propio límite
  message: { success: false, message: 'Demasiadas solicitudes al admin. Intente más tarde.' },
});

// Límite estricto para rutas públicas (anti-abuso)
const publicRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Demasiadas solicitudes. Intente más tarde.' },
});

// Límite muy estricto para autenticación (anti-brute-force)
const authRateLimit = rateLimit({
  windowMs: 15 * 60_000, // 15 minutos
  max:      20,          // solo 20 intentos de login por ventana
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Demasiados intentos. Espere 15 minutos.' },
});

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

app.use('/api/auth',    authRateLimit,   require('./routes/auth.routes'));
app.use('/api/public',  publicRateLimit, require('./routes/public.routes'));
app.use('/api/admin',   adminRateLimit,  require('./routes/admin.routes'));

// ── Error Handler Global ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
