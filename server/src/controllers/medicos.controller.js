const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── PUBLIC ─────────────────────────────────────────────────────────
const getDirectorio = async (req, res, next) => {
  try {
    const { especialidadId } = req.query;
    const where = { activo: true, ...(especialidadId && { especialidadId: parseInt(especialidadId) }) };

    const medicos = await prisma.medico.findMany({
      where,
      include: { especialidad: { select: { id: true, nombre: true, icono: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: medicos });
  } catch (err) { next(err); }
};

// ── ADMIN ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const medicos = await prisma.medico.findMany({
      include: { especialidad: { select: { nombre: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: medicos });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { nombre, especialidadId, bio, telefono, email } = req.body;
    const files = req.files || {};
    const foto  = files.foto?.[0] ? `/uploads/${files.foto[0].filename}` : null;
    const cvUrl = files.cv?.[0]   ? `/uploads/cv/${files.cv[0].filename}` : null;

    const medico = await prisma.medico.create({
      data: { nombre, especialidadId: parseInt(especialidadId), foto, cvUrl, bio: bio || null, telefono: telefono || null, email: email || null },
      include: { especialidad: { select: { nombre: true } } },
    });
    res.status(201).json({ success: true, data: medico });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, especialidadId, activo, bio, telefono, email } = req.body;
    const files = req.files || {};

    const data = {
      nombre,
      especialidadId: parseInt(especialidadId),
      activo: activo === 'true' || activo === true,
      bio: bio || null,
      telefono: telefono || null,
      email: email || null,
    };

    if (files.foto?.[0]) data.foto  = `/uploads/${files.foto[0].filename}`;
    if (files.cv?.[0])   data.cvUrl = `/uploads/cv/${files.cv[0].filename}`;

    const medico = await prisma.medico.update({
      where: { id },
      data,
      include: { especialidad: { select: { nombre: true } } },
    });
    res.json({ success: true, data: medico });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.medico.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Médico eliminado.' });
  } catch (err) { next(err); }
};

module.exports = { getDirectorio, getAll, create, update, remove };
