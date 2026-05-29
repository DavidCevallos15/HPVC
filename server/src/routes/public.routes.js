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

// Noticias públicas
router.get('/noticias',         getPublicas);
router.get('/noticias/:slug',   getBySlug);

// Especialidades y directorio médico
router.get('/especialidades',   getDisponibles);
router.get('/medicos',          getDirectorio);
router.get('/horarios/:mes',    getByMes);

// Guardias Matriz institucional
router.get('/guardias/:mes',       getGuardiasByMes);
router.get('/guardias-meses',      getMesesDisponibles);

// Documentos académicos + Asistente IA
router.get('/documentos',          getPublicos);
router.post('/documentos/preguntar', preguntar);

// Contacto (con rate limit y validación)
router.post('/contacto', enviar);

// Configuración pública (teléfono, dirección, horario, etc.)
router.get('/configuracion',    getConfiguracion);

// Descarga de POA
router.get('/poa',              poaCtrl.getAll);
router.get('/poa/download',     poaCtrl.downloadLatest);

module.exports = router;
