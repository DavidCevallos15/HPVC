const { Router } = require('express');
const router = Router();
const { obtenerHistorial, obtenerDetalleReceta } = require('../controllers/recetaController');

// Definimos el endpoint GET

router.get('/historial/:documento/:fecha_nacimiento', obtenerHistorial);
router.get('/receta/detalle/:idcomprobante', obtenerDetalleReceta);


module.exports = router;