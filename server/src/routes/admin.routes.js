const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const { uploadImage, uploadPDF, uploadMedico, uploadExcel } = require('../middlewares/upload');

const noticiaCtrl      = require('../controllers/noticias.controller');
const especialidadCtrl = require('../controllers/especialidades.controller');
const medicoCtrl       = require('../controllers/medicos.controller');
const horarioCtrl      = require('../controllers/horarios.controller');
const contactoCtrl     = require('../controllers/contacto.controller');
const documentoCtrl    = require('../controllers/documentos.controller');
const configCtrl       = require('../controllers/configuracion.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ── Dashboard Stats ──────────────────────────────────────────────────
router.get('/stats', configCtrl.getStats);

// ── Noticias CRUD ────────────────────────────────────────────────────
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

// ── Mensajes de Contacto ─────────────────────────────────────────────
router.get('/contacto',           requireRole('SUPERADMIN'), contactoCtrl.getAll);
router.put('/contacto/:id/leer',  requireRole('SUPERADMIN'), contactoCtrl.marcarLeido);
router.delete('/contacto/:id',    requireRole('SUPERADMIN'), contactoCtrl.eliminar);

// ── Configuración del Sistema ────────────────────────────────────────
router.get('/configuracion',      requireRole('SUPERADMIN'), configCtrl.getAll);
router.put('/configuracion',      requireRole('SUPERADMIN'), configCtrl.update);

// ── Documentos Académicos CRUD ───────────────────────────────────────
router.get('/documentos',         requireRole('SUPERADMIN'), documentoCtrl.getAll);
router.post('/documentos',        requireRole('SUPERADMIN'), uploadPDF.single('archivo'), documentoCtrl.create); // Asumiendo que usa PDF
router.put('/documentos/:id',     requireRole('SUPERADMIN'), uploadPDF.single('archivo'), documentoCtrl.update);
router.delete('/documentos/:id',  requireRole('SUPERADMIN'), documentoCtrl.remove);

module.exports = router;
