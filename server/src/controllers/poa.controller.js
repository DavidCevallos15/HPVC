/**
 * poa.controller.js
 * Controlador para la gestión y descarga del Plan Operativo Anual (POA).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Carpeta base permitida para los archivos de POA
const BASE_POA_DIR = path.resolve(__dirname, '../../public/uploads/poa');

/**
 * Helper para resolver y validar rutas físicas de archivos de forma segura.
 */
const getSafePoaPath = (filename) => {
  const safeFilename = path.basename(filename);
  const resolvedPath = path.normalize(path.join(BASE_POA_DIR, safeFilename));
  
  // Validar que la ruta final esté dentro del directorio base permitido
  if (!resolvedPath.startsWith(BASE_POA_DIR)) {
    throw new Error('Intento de path traversal detectado.');
  }
  return resolvedPath;
};

/**
 * Obtener todos los POAs ordenados por año descendente.
 * GET /admin/poa
 */
const getAll = async (req, res, next) => {
  try {
    const poas = await prisma.poa.findMany({
      orderBy: { anio: 'desc' },
    });
    res.json({ success: true, data: poas });
  } catch (err) {
    next(err);
  }
};

/**
 * Crear o sobrescribir el POA de un año.
 * POST /admin/poa
 */
const create = async (req, res, next) => {
  try {
    const anio = parseInt(req.body.anio);
    if (!anio || isNaN(anio)) {
      return res.status(400).json({ success: false, message: 'El año es requerido y debe ser un número válido.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Se requiere subir un archivo Excel (.xlsx, .xls).' });
    }

    const archivoUrl = `/uploads/poa/${req.file.filename}`;
    const nombreOriginal = req.file.originalname;

    // Verificar si ya existe un POA para ese año
    const existing = await prisma.poa.findUnique({
      where: { anio },
    });

    let poa;
    if (existing) {
      // Borrar el archivo físico antiguo del servidor de forma segura
      try {
        const oldPath = getSafePoaPath(existing.archivoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.error(`Error al eliminar archivo viejo del POA:`, e.message);
      }

      // Actualizar registro en la base de datos
      poa = await prisma.poa.update({
        where: { anio },
        data: {
          archivoUrl,
          nombreOriginal,
          creadoEn: new Date(),
        },
      });
    } else {
      // Crear un nuevo registro
      poa = await prisma.poa.create({
        data: {
          anio,
          archivoUrl,
          nombreOriginal,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: poa,
      message: `El POA del año ${anio} se ha subido correctamente.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminar un POA por ID.
 * DELETE /admin/poa/:id
 */
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido.' });
    }

    const poa = await prisma.poa.findUnique({
      where: { id },
    });

    if (!poa) {
      return res.status(404).json({ success: false, message: 'El POA no existe.' });
    }

    // Borrar el archivo físico de forma segura
    try {
      const filePath = getSafePoaPath(poa.archivoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`Error al eliminar archivo del POA:`, e.message);
    }

    // Eliminar el registro en la base de datos
    await prisma.poa.delete({
      where: { id },
    });

    res.json({ success: true, message: 'POA eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Descargar el POA más reciente por año.
 * GET /public/poa/download
 */
const downloadLatest = async (req, res, next) => {
  try {
    const poa = await prisma.poa.findFirst({
      orderBy: { anio: 'desc' },
    });

    if (!poa) {
      return res.status(404).send('No se ha subido ningún POA todavía.');
    }

    // Servir archivo de forma segura
    let filePath;
    try {
      filePath = getSafePoaPath(poa.archivoUrl);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('El archivo del POA solicitado no existe en el servidor.');
      }
    } catch (e) {
      return res.status(400).send('Ruta de archivo no válida.');
    }

    // Servir como descarga directa adjunta
    res.download(filePath, poa.nombreOriginal || `POA_${poa.anio}.xlsx`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
  remove,
  downloadLatest,
};
