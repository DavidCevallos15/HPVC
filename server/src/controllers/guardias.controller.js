const { PrismaClient } = require('@prisma/client');
const { parseMatrizGuardias } = require('../services/excel.service');

const prisma = new PrismaClient();

// ── Helpers de normalización ─────────────────────────────────────
/**
 * Normaliza el nombre de un área/especialidad al formato institucional.
 * Capitaliza, elimina ruido y unifica variantes comunes del HPVC.
 */
function normalizarNombreArea(areaRaw) {
  if (!areaRaw || !String(areaRaw).trim()) return 'Medicina General';
  let area = String(areaRaw).trim()
    .toLowerCase()
    .replace(/\b(de|y|la|el)\b/g, (m) => m)
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Mapeos para unificar variantes comunes del Hospital Verdi Cevallos
  const mapeos = {
    'Gineco Obstetricia':        'Ginecología y Obstetricia',
    'Gineco-Obstetricia':        'Ginecología y Obstetricia',
    'Ginecologia':               'Ginecología y Obstetricia',
    'Ginecología':               'Ginecología y Obstetricia',
    'Cirugia General':           'Cirugía General',
    'Cirugía General':           'Cirugía General',
    'Cirugia':                   'Cirugía General',
    'Pediatria':                 'Pediatría',
    'Medicina Interna':          'Medicina Interna',
    'Med. Interna':              'Medicina Interna',
    'Cardiologia':               'Cardiología',
    'Traumatologia':             'Traumatología',
    'Traumatología Y Ortopedia': 'Traumatología y Ortopedia',
    'Uci':                       'UCI (Unidad de Cuidados Intensivos)',
    'Uci Neonatal':              'UCI Neonatal',
    'Emergencia':                'Emergencias',
    'Urgencias':                 'Emergencias',
  };
  return mapeos[area] || area;
}

/**
 * Limpia un nombre de médico: quita textos entre paréntesis, cargos
 * y normaliza espacios y capitalización.
 */
function normalizarNombreMedico(nombreRaw) {
  if (!nombreRaw || !String(nombreRaw).trim()) return '';
  return String(nombreRaw).trim()
    .replace(/\s+/g, ' ')                             // Quitar espacios múltiples
    .replace(/\(.*?\)/g, '')                          // Quitar texto entre paréntesis
    .replace(/\[.*?\]/g, '')                          // Quitar texto entre corchetes
    .replace(/\b(JEFE|PLANTA|GUARDIA|DR\.?|DRA\.?)\b/gi, '') // Quitar cargos
    .replace(/\s+/g, ' ')                             // Limpiar espacios resultantes
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());        // Capitalizar cada palabra
}

// ── PUBLIC: Obtener guardias por mes ─────────────────────────────
const getGuardiasByMes = async (req, res, next) => {
  try {
    const { mes } = req.params; // "2026-05"
    const { area, nombre } = req.query;

    const where = { mes };
    if (area)   where.area   = { contains: area,   mode: 'insensitive' };
    if (nombre) where.nombreMedico = { contains: nombre, mode: 'insensitive' };

    const guardias = await prisma.guardiaMatriz.findMany({
      where,
      orderBy: [{ area: 'asc' }, { nombreMedico: 'asc' }],
    });

    // Obtener lista de áreas únicas para filtros
    const areas = [...new Set(
      guardias.map(g => g.area).filter(Boolean)
    )].sort();

    res.json({ success: true, data: guardias, areas, total: guardias.length });
  } catch (err) { next(err); }
};

// ── PUBLIC: Listar meses disponibles ─────────────────────────────
const getMesesDisponibles = async (req, res, next) => {
  try {
    const meses = await prisma.guardiaMatriz.findMany({
      select: { mes: true },
      distinct: ['mes'],
      orderBy: { mes: 'desc' },
    });
    res.json({ success: true, data: meses.map(m => m.mes) });
  } catch (err) { next(err); }
};

// ── ADMIN: Subir Excel de guardias ───────────────────────────────
const uploadGuardias = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo Excel requerido.' });
    }

    // El mes puede venir en el body O se detecta automáticamente del Excel
    const mesBody = req.body.mes; // opcional: "2026-05"

    const { medicos, mes: mesDetectado, diasMap } = parseMatrizGuardias(req.file.buffer);

    const mes = mesBody || mesDetectado;
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo determinar el mes del archivo. Proporciona el mes manualmente (YYYY-MM).',
      });
    }

    if (!medicos || medicos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El Excel no contiene datos de médicos válidos. Verifica el formato del archivo.',
        hint: 'El archivo debe tener el formato institucional de guardias del Hospital Verdi Cevallos.',
      });
    }

    // Borrar guardias del mes anterior y reemplazar (upsert por mes completo)
    await prisma.guardiaMatriz.deleteMany({ where: { mes } });

    const creados = await prisma.guardiaMatriz.createMany({
      data: medicos.map(m => ({ mes, ...m })),
      skipDuplicates: false,
    });

    // ── Sincronización automática: Especialidades y Médicos ──────────
    // Extrae y registra en el directorio a todos los médicos del Excel
    // que no existan previamente, sin duplicar ni sobreescribir datos.
    let nuevasEspecialidades = 0;
    let nuevosMedicos = 0;

    for (const m of medicos) {
      if (!m.nombreMedico) continue;

      const areaLimpia   = normalizarNombreArea(m.area);
      const nombreLimpio = normalizarNombreMedico(m.nombreMedico);

      if (!nombreLimpio) continue;

      // A. Obtener o crear la Especialidad
      const esEspecialidadNueva = !(await prisma.especialidad.findUnique({ where: { nombre: areaLimpia } }));
      const especialidad = await prisma.especialidad.upsert({
        where:  { nombre: areaLimpia },
        update: {},
        create: {
          nombre:      areaLimpia,
          icono:       'Stethoscope',
          descripcion: `Departamento y consulta externa de ${areaLimpia}`,
        },
      });
      if (esEspecialidadNueva) nuevasEspecialidades++;

      // B. Obtener o crear el Médico (búsqueda insensible a mayúsculas)
      const medicoExistente = await prisma.medico.findFirst({
        where: { nombre: { equals: nombreLimpio, mode: 'insensitive' } },
      });

      if (!medicoExistente) {
        await prisma.medico.create({
          data: {
            nombre:         nombreLimpio,
            especialidadId: especialidad.id,
            activo:         true,
          },
        });
        nuevosMedicos++;
      }
    }

    res.json({
      success: true,
      message: `Guardias de ${mes} importadas correctamente.`,
      total: creados.count,
      mesDetectado,
      diasEncontrados:    Object.keys(diasMap).length,
      nuevasEspecialidades,
      nuevosMedicos,
    });
  } catch (err) { next(err); }
};

// ── ADMIN: Listar todas las guardias ────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { mes } = req.query;
    const where = mes ? { mes } : {};

    const [guardias, total] = await prisma.$transaction([
      prisma.guardiaMatriz.findMany({
        where,
        orderBy: [{ mes: 'desc' }, { area: 'asc' }, { nombreMedico: 'asc' }],
        take: 500,
      }),
      prisma.guardiaMatriz.count({ where }),
    ]);

    res.json({ success: true, data: guardias, total });
  } catch (err) { next(err); }
};

// ── ADMIN: Eliminar guardias de un mes ───────────────────────────
const deleteByMes = async (req, res, next) => {
  try {
    const { mes } = req.params;
    const deleted = await prisma.guardiaMatriz.deleteMany({ where: { mes } });
    res.json({ success: true, message: `${deleted.count} registros eliminados.` });
  } catch (err) { next(err); }
};

module.exports = { getGuardiasByMes, getMesesDisponibles, uploadGuardias, getAll, deleteByMes };
