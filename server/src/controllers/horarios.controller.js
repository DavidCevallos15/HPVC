const { PrismaClient } = require('@prisma/client');
const { parseHorariosExcel } = require('../services/excel.service');
const prisma = new PrismaClient();

// ── PUBLIC ─────────────────────────────────────────────────────────
const getByMes = async (req, res, next) => {
  try {
    const { mes } = req.params; // formato: "2026-04"
    const horarios = await prisma.horarioMedico.findMany({
      where: { mes },
      include: {
        medico: {
          select: { id: true, nombre: true, foto: true, bio: true, cvUrl: true, especialidad: { select: { nombre: true, icono: true } } },
        },
      },
      orderBy: { medico: { nombre: 'asc' } },
    });
    res.json({ success: true, data: horarios });
  } catch (err) { next(err); }
};

// ── ADMIN: Upload Excel ─────────────────────────────────────────────
const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo Excel requerido.' });

    const { mes } = req.body;
    if (!mes || !/^\d{4}-\d{2}$/.test(mes))
      return res.status(400).json({ success: false, message: 'El campo "mes" es requerido (formato: YYYY-MM).' });

    const filas = parseHorariosExcel(req.file.buffer);
    if (!filas.length)
      return res.status(400).json({ success: false, message: 'El Excel no tiene datos válidos.' });

    const estadosValidos = ['DISPONIBLE', 'VACACIONES', 'SIN_ATENCION'];

    let creados = 0, actualizados = 0, errores = [];

    for (const fila of filas) {
      const estado = estadosValidos.includes(fila.estado) ? fila.estado : 'DISPONIBLE';
      const medico = await prisma.medico.findUnique({ where: { id: fila.medicoId } });

      if (!medico) { errores.push(`Médico ID ${fila.medicoId} no encontrado.`); continue; }

      const existing = await prisma.horarioMedico.findUnique({
        where: { medicoId_mes: { medicoId: fila.medicoId, mes } },
      });

      if (existing) {
        await prisma.horarioMedico.update({
          where: { medicoId_mes: { medicoId: fila.medicoId, mes } },
          data: { lunes: fila.lunes, martes: fila.martes, miercoles: fila.miercoles, jueves: fila.jueves, viernes: fila.viernes, estado },
        });
        actualizados++;
      } else {
        await prisma.horarioMedico.create({
          data: { medicoId: fila.medicoId, mes, lunes: fila.lunes, martes: fila.martes, miercoles: fila.miercoles, jueves: fila.jueves, viernes: fila.viernes, estado },
        });
        creados++;
      }
    }

    res.json({ success: true, message: `Horarios importados: ${creados} creados, ${actualizados} actualizados.`, errores });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { mes } = req.query;
    const where = mes ? { mes } : {};
    const horarios = await prisma.horarioMedico.findMany({
      where,
      include: { medico: { select: { nombre: true, especialidad: { select: { nombre: true } } } } },
      orderBy: [{ mes: 'desc' }, { medico: { nombre: 'asc' } }],
    });
    res.json({ success: true, data: horarios });
  } catch (err) { next(err); }
};

// ── ADMIN: Edición manual de un horario ──────────────────────────────
const updateHorarioManual = async (req, res, next) => {
  try {
    const medicoId = parseInt(req.params.medicoId);
    const { mes, lunes, martes, miercoles, jueves, viernes, estado } = req.body;

    if (!mes) return res.status(400).json({ success: false, message: 'El campo mes es requerido.' });

    const horario = await prisma.horarioMedico.upsert({
      where: { medicoId_mes: { medicoId, mes } },
      update: { lunes, martes, miercoles, jueves, viernes, estado },
      create: { medicoId, mes, lunes, martes, miercoles, jueves, viernes, estado },
    });

    res.json({ success: true, data: horario });
  } catch (err) { next(err); }
};

module.exports = { getByMes, uploadExcel, getAll, updateHorarioManual };
