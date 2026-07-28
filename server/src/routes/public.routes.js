const router = require('express').Router();

const { getPublicas, getBySlug }      = require('../controllers/noticias.controller');
const { getDisponibles }               = require('../controllers/especialidades.controller');
const { getDirectorio }                = require('../controllers/medicos.controller');
const { getByMes }                     = require('../controllers/horarios.controller');
const { getGuardiasByMes, getMesesDisponibles } = require('../controllers/guardias.controller');
const { enviar }      = require('../controllers/contacto.controller');
const { getPublicos, preguntar } = require('../controllers/documentos.controller');
const { getAll: getConfiguracion }     = require('../controllers/configuracion.controller');
const poaCtrl = require('../controllers/poa.controller');
const seccionesCtrl = require('../controllers/secciones.controller');
const analyticsCtrl = require('../controllers/analytics.controller');
const { requireSeccionHabilitada } = require('../middlewares/seccionPublica');

router.post('/analytics/visit', analyticsCtrl.registrarVisita);

// Noticias públicas
router.get('/noticias',         requireSeccionHabilitada('noticias'), getPublicas);
router.get('/noticias/:slug',   requireSeccionHabilitada('noticias'), getBySlug);

// Especialidades y directorio médico
router.get('/especialidades',   requireSeccionHabilitada('especialidades'), getDisponibles);
router.get('/medicos',          requireSeccionHabilitada('directorio'), getDirectorio);
router.get('/horarios/:mes',    requireSeccionHabilitada('horarios'), getByMes);

// Guardias Matriz institucional
router.get('/guardias/:mes',       requireSeccionHabilitada('horarios'), getGuardiasByMes);
router.get('/guardias-meses',      requireSeccionHabilitada('horarios'), getMesesDisponibles);

// Documentos académicos + Asistente IA
router.get('/documentos',          requireSeccionHabilitada('documentos'), getPublicos);
router.post('/documentos/preguntar', requireSeccionHabilitada('documentos'), preguntar);

// Contacto (con rate limit y validación)
router.post('/contacto', requireSeccionHabilitada('contacto'), enviar);

// Configuración pública (teléfono, dirección, horario, etc.)
router.get('/configuracion',    requireSeccionHabilitada('configuracion'), getConfiguracion);

// Estado de navegación y disponibilidad de las secciones
router.get('/secciones-publicas', seccionesCtrl.getPublicas);

// Descarga de POA
router.get('/poa',              requireSeccionHabilitada('documentos'), poaCtrl.getAll);
router.get('/poa/download',     requireSeccionHabilitada('documentos'), poaCtrl.downloadLatest);

module.exports = router;
