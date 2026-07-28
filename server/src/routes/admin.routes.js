const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const { uploadImage, uploadDocumento, uploadMedico, uploadExcel, uploadPOA } = require('../middlewares/upload');

const noticiaCtrl      = require('../controllers/noticias.controller');
const especialidadCtrl = require('../controllers/especialidades.controller');
const medicoCtrl       = require('../controllers/medicos.controller');
const horarioCtrl      = require('../controllers/horarios.controller');
const contactoCtrl     = require('../controllers/contacto.controller');
const documentoCtrl    = require('../controllers/documentos.controller');
const configCtrl       = require('../controllers/configuracion.controller');
const guardiasCtrl     = require('../controllers/guardias.controller');
const aiCtrl           = require('../controllers/ai.controller');
const poaCtrl          = require('../controllers/poa.controller');
const seccionesCtrl    = require('../controllers/secciones.controller');
const analyticsCtrl    = require('../controllers/analytics.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ── Dashboard Stats ──────────────────────────────────────────────────
router.get('/stats', analyticsCtrl.getDashboardStats);

// ── Disponibilidad de secciones públicas ─────────────────────────────
router.get('/secciones-publicas', seccionesCtrl.getAdmin);
router.put('/secciones-publicas/:clave', requireRole('SUPERADMIN'), seccionesCtrl.updateEstado);

// ── Noticias CRUD ────────────────────────────────────────────────────
router.post('/noticias/generate-metadata', requireRole('SUPERADMIN','EDITOR_NOTICIAS'), aiCtrl.generateMetadata);
router.get('/noticias',         requireRole('SUPERADMIN','EDITOR_NOTICIAS'), noticiaCtrl.getAll);
router.post('/noticias',        requireRole('SUPERADMIN','EDITOR_NOTICIAS'), uploadImage.single('imagen'), noticiaCtrl.create);
router.put('/noticias/:id',     requireRole('SUPERADMIN','EDITOR_NOTICIAS'), uploadImage.single('imagen'), noticiaCtrl.update);
router.delete('/noticias/:id',  requireRole('SUPERADMIN','EDITOR_NOTICIAS'), noticiaCtrl.remove);

// ── Especialidades CRUD ──────────────────────────────────────────────
router.get('/especialidades',        requireRole('SUPERADMIN'), especialidadCtrl.getAll);
router.post('/especialidades',       requireRole('SUPERADMIN'), especialidadCtrl.create);
router.put('/especialidades/:id',    requireRole('SUPERADMIN'), especialidadCtrl.update);
router.delete('/especialidades/:id', requireRole('SUPERADMIN'), especialidadCtrl.remove);

// ── Médicos CRUD ─────────────────────────────────────────────────────
router.get('/medicos',        requireRole('SUPERADMIN','EDITOR_HORARIOS'), medicoCtrl.getAll);
router.post('/medicos',       requireRole('SUPERADMIN'), uploadMedico.fields([{ name: 'foto', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), medicoCtrl.create);
router.put('/medicos/:id',    requireRole('SUPERADMIN'), uploadMedico.fields([{ name: 'foto', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), medicoCtrl.update);
router.delete('/medicos/:id', requireRole('SUPERADMIN'), medicoCtrl.remove);
router.put('/medicos/:medicoId/horario', requireRole('SUPERADMIN', 'EDITOR_HORARIOS'), horarioCtrl.updateHorarioManual);

// ── Horarios (Excel) ─────────────────────────────────────────────────
router.get('/horarios',               requireRole('SUPERADMIN','EDITOR_HORARIOS'), horarioCtrl.getAll);
router.post('/horarios/upload',       requireRole('SUPERADMIN','EDITOR_HORARIOS'), uploadExcel.single('archivo'), horarioCtrl.uploadExcel);

// ── Guardias Matriz (Excel institucional real) ────────────────────────
router.get('/guardias',               requireRole('SUPERADMIN','EDITOR_HORARIOS'), guardiasCtrl.getAll);
router.post('/guardias/upload',       requireRole('SUPERADMIN','EDITOR_HORARIOS'), uploadExcel.single('archivo'), guardiasCtrl.uploadGuardias);
router.delete('/guardias/:mes',       requireRole('SUPERADMIN'), guardiasCtrl.deleteByMes);

// ── Mensajes de Contacto ─────────────────────────────────────────────
router.get('/contacto',           requireRole('SUPERADMIN'), contactoCtrl.getAll);
router.get('/contacto-resumen',   requireRole('SUPERADMIN'), contactoCtrl.getUnreadSummary);
router.put('/contacto/:id/leer',  requireRole('SUPERADMIN'), contactoCtrl.marcarLeido);
router.delete('/contacto/:id',    requireRole('SUPERADMIN'), contactoCtrl.eliminar);

// ── Configuración del Sistema ────────────────────────────────────────
router.get('/configuracion',      requireRole('SUPERADMIN'), configCtrl.getAll);
router.put('/configuracion',      requireRole('SUPERADMIN'), configCtrl.update);
router.post('/configuracion/imagen', requireRole('SUPERADMIN'), uploadImage.single('imagen'), configCtrl.updateImage);
router.delete('/configuracion/:clave', requireRole('SUPERADMIN'), configCtrl.deleteConfig);

// ── Documentos Académicos CRUD + IA ─────────────────────────────────
router.get('/documentos',                 requireRole('SUPERADMIN'), documentoCtrl.getAll);
router.post('/documentos',                requireRole('SUPERADMIN'), uploadDocumento.single('archivo'), documentoCtrl.create);
router.put('/documentos/:id',             requireRole('SUPERADMIN'), uploadDocumento.single('archivo'), documentoCtrl.update);
router.delete('/documentos/:id',          requireRole('SUPERADMIN'), documentoCtrl.remove);
router.post('/documentos/:id/re-indexar', requireRole('SUPERADMIN'), documentoCtrl.reIndexar);

// ── POA CRUD ────────────────────────────────────────────────────────
router.get('/poa',                        requireRole('SUPERADMIN'), poaCtrl.getAll);
router.post('/poa',                       requireRole('SUPERADMIN'), uploadPOA.single('archivo'), poaCtrl.create);
router.delete('/poa/:id',                 requireRole('SUPERADMIN'), poaCtrl.remove);

module.exports = router;
