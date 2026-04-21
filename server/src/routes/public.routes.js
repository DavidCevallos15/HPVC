const router = require('express').Router();

const { getPublicas, getBySlug }      = require('../controllers/noticias.controller');
const { getDisponibles }               = require('../controllers/especialidades.controller');
const { getDirectorio }                = require('../controllers/medicos.controller');
const { getByMes }                     = require('../controllers/horarios.controller');
const { enviar, contactoLimiter }      = require('../controllers/contacto.controller');
const { getPublicos }                  = require('../controllers/documentos.controller');
const { getAll: getConfiguracion }     = require('../controllers/configuracion.controller');

// Noticias públicas
router.get('/noticias',         getPublicas);
router.get('/noticias/:slug',   getBySlug);

// Especialidades y directorio médico
router.get('/especialidades',   getDisponibles);
router.get('/medicos',          getDirectorio);
router.get('/horarios/:mes',    getByMes);

// Documentos académicos
router.get('/documentos',       getPublicos);

// Contacto (con rate limit)
router.post('/contacto', contactoLimiter, enviar);

// Configuración pública (teléfono, dirección, horario, etc.)
router.get('/configuracion',    getConfiguracion);

module.exports = router;
