const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── PUBLIC ─────────────────────────────────────────────────────────
const getPublicos = async (req, res, next) => {
  try {
    const { tipo } = req.query;
    const where = tipo ? { tipo } : {};
    const docs = await prisma.documentoAcademico.findMany({
      where,
      orderBy: { publicadoEn: 'desc' },
    });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

// ── ADMIN ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const docs = await prisma.documentoAcademico.findMany({ orderBy: { publicadoEn: 'desc' } });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { titulo, tipo, driveUrl } = req.body;
    if (!titulo || !tipo || !driveUrl)
      return res.status(400).json({ success: false, message: 'Título, tipo y URL de Drive son requeridos.' });

    const doc = await prisma.documentoAcademico.create({ data: { titulo, tipo, driveUrl } });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { titulo, tipo, driveUrl } = req.body;
    const doc = await prisma.documentoAcademico.update({
      where: { id: parseInt(req.params.id) },
      data: { titulo, tipo, driveUrl },
    });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.documentoAcademico.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Documento eliminado.' });
  } catch (err) { next(err); }
};

module.exports = { getPublicos, getAll, create, update, remove };
