const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── PUBLIC ─────────────────────────────────────────────────────────
const getDisponibles = async (req, res, next) => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      where: { disponible: true },
      orderBy: { orden: 'asc' },
      include: { _count: { select: { medicos: { where: { activo: true } } } } },
    });
    res.json({ success: true, data: especialidades });
  } catch (err) { next(err); }
};

// ── ADMIN ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const especialidades = await prisma.especialidad.findMany({ orderBy: { orden: 'asc' } });
    res.json({ success: true, data: especialidades });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { nombre, icono, descripcion, orden } = req.body;
    const esp = await prisma.especialidad.create({
      data: { nombre, icono, descripcion, orden: parseInt(orden) || 0 },
    });
    res.status(201).json({ success: true, data: esp });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { nombre, icono, descripcion, disponible, orden } = req.body;
    const esp = await prisma.especialidad.update({
      where: { id: parseInt(req.params.id) },
      data: { nombre, icono, descripcion, disponible: disponible === 'true' || disponible === true, orden: parseInt(orden) || 0 },
    });
    res.json({ success: true, data: esp });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.especialidad.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Especialidad eliminada.' });
  } catch (err) { next(err); }
};

module.exports = { getDisponibles, getAll, create, update, remove };
