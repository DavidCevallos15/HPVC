/**
 * documentos.controller.js
 * CRUD de documentos académicos + endpoint de preguntas IA (RAG).
 */

const path   = require('path');
const fs     = require('fs');
const { PrismaClient } = require('@prisma/client');
const { indexarDocumento } = require('../services/documentos.service');
const { preguntarProtocolo } = require('../services/ai.service');

const prisma = new PrismaClient();

// ── PUBLIC ─────────────────────────────────────────────────────────────────

/** GET /public/documentos?tipo=guia&q=diabetes */
const getPublicos = async (req, res, next) => {
  try {
    const { tipo, q } = req.query;
    const where = {};
    if (tipo && tipo !== 'Todos') where.tipo = tipo;
    if (q) {
      where.titulo = { contains: q, mode: 'insensitive' };
    }

    const docs = await prisma.documentoAcademico.findMany({
      where,
      orderBy: { titulo: 'asc' },
      select: { id: true, titulo: true, tipo: true, archivoUrl: true, publicadoEn: true },
    });

    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

/** POST /public/documentos/preguntar  { pregunta: "..." } */
const preguntar = async (req, res, next) => {
  try {
    const { pregunta, documentoId } = req.body;
    if (!pregunta || pregunta.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'La pregunta es demasiado corta.' });
    }

    const resultado = await preguntarProtocolo(pregunta.trim(), documentoId);
    res.json({ success: true, ...resultado });
  } catch (err) { next(err); }
};

// ── ADMIN ──────────────────────────────────────────────────────────────────

/** GET /admin/documentos */
const getAll = async (req, res, next) => {
  try {
    const { tipo, q, page = 1, limit = 20 } = req.query;
    const where = {};
    if (tipo && tipo !== 'Todos') where.tipo = tipo;
    if (q) where.titulo = { contains: q, mode: 'insensitive' };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const [docs, total] = await Promise.all([
      prisma.documentoAcademico.findMany({
        where,
        orderBy: { titulo: 'asc' },
        skip,
        take: parseInt(limit),
        include: { _count: { select: { chunks: true } } },
      }),
      prisma.documentoAcademico.count({ where }),
    ]);

    res.json({ success: true, data: docs, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

/** POST /admin/documentos  (multipart: archivo PDF + body) */
const create = async (req, res, next) => {
  try {
    const { titulo, tipo } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Se requiere un archivo PDF.' });
    }
    if (!titulo || !tipo) {
      return res.status(400).json({ success: false, message: 'Título y tipo son requeridos.' });
    }

    const archivoUrl = `/uploads/documentos/${req.file.filename}`;

    const doc = await prisma.documentoAcademico.create({
      data: { titulo, tipo, archivoUrl },
    });

    // Indexar en segundo plano (no bloqueamos la respuesta)
    indexarDocumento(doc.id, archivoUrl).catch(e =>
      console.error(`[Indexación] Error en doc ${doc.id}:`, e.message)
    );

    res.status(201).json({ success: true, data: doc, message: 'Documento creado. La indexación IA continúa en segundo plano.' });
  } catch (err) { next(err); }
};

/** PUT /admin/documentos/:id */
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, tipo } = req.body;
    const data = {};
    if (titulo) data.titulo = titulo;
    if (tipo)   data.tipo   = tipo;

    // Si se sube un nuevo archivo, reemplazar y re-indexar
    if (req.file) {
      // Borrar archivo anterior
      const old = await prisma.documentoAcademico.findUnique({ where: { id } });
      if (old?.archivoUrl) {
        const oldPath = path.join(__dirname, '../../public', old.archivoUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.archivoUrl = `/uploads/documentos/${req.file.filename}`;
    }

    const doc = await prisma.documentoAcademico.update({ where: { id }, data });

    if (req.file) {
      indexarDocumento(doc.id, doc.archivoUrl).catch(e =>
        console.error(`[Re-indexación] Error en doc ${doc.id}:`, e.message)
      );
    }

    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

/** DELETE /admin/documentos/:id */
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.documentoAcademico.findUnique({ where: { id } });

    // Eliminar chunks (cascade ya lo hace por FK, pero lo forzamos)
    await prisma.documentoChunk.deleteMany({ where: { documentoId: id } });

    // Eliminar archivo físico
    if (doc?.archivoUrl) {
      const filePath = path.join(__dirname, '../../public', doc.archivoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.documentoAcademico.delete({ where: { id } });
    res.json({ success: true, message: 'Documento eliminado correctamente.' });
  } catch (err) { next(err); }
};

/** POST /admin/documentos/:id/re-indexar */
const reIndexar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.documentoAcademico.findUnique({ where: { id } });
    if (!doc || !doc.archivoUrl) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado o sin archivo.' });
    }
    const nChunks = await indexarDocumento(id, doc.archivoUrl);
    res.json({ success: true, message: `Re-indexado con ${nChunks} fragmentos.` });
  } catch (err) { next(err); }
};

module.exports = { getPublicos, preguntar, getAll, create, update, remove, reIndexar };
