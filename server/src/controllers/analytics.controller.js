const { PrismaClient, Prisma } = require('@prisma/client');
const { analyticsSchemas } = require('../validators/schemas');
const { validate } = require('../middlewares/validate');

const prisma = new PrismaClient();
const ECUADOR_TIME_ZONE = 'America/Guayaquil';
const DASHBOARD_CACHE_TTL_MS = Number(process.env.DASHBOARD_CACHE_TTL_MS) || 45_000;
const dashboardCache = new Map();

const startOfEcuadorDay = (daysAgo = 0) => {
  const ecuadorNow = new Date(Date.now() - (5 * 60 * 60 * 1000));
  return new Date(Date.UTC(
    ecuadorNow.getUTCFullYear(),
    ecuadorNow.getUTCMonth(),
    ecuadorNow.getUTCDate() - daysAgo,
    5,
  ));
};

const getPercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const dayKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const buildDailySeries = (visits, days = 14) => {
  const totals = new Map();
  const visitors = new Map();

  visits.forEach((visit) => {
    const key = dayKey(visit.creadoEn);
    totals.set(key, (totals.get(key) || 0) + 1);
    if (!visitors.has(key)) visitors.set(key, new Set());
    visitors.get(key).add(visit.visitanteId);
  });

  return Array.from({ length: days }, (_, index) => {
    const date = startOfEcuadorDay(days - 1 - index);
    const key = dayKey(date);
    return {
      fecha: key,
      visitas: totals.get(key) || 0,
      visitantes: visitors.get(key)?.size || 0,
    };
  });
};

const registrarVisita = [
  validate(analyticsSchemas.visita),
  async (req, res, next) => {
    try {
      const { ruta, titulo, visitanteId, sesionId } = req.body;
      const duplicateWindow = new Date(Date.now() - 10_000);

      const duplicate = await prisma.visitaPagina.findFirst({
        where: {
          ruta,
          sesionId,
          creadoEn: { gte: duplicateWindow },
        },
        select: { id: true },
      });

      if (duplicate) {
        return res.status(200).json({ success: true, data: { registrada: false } });
      }

      await prisma.visitaPagina.create({
        data: {
          ruta,
          titulo: titulo || null,
          visitanteId,
          sesionId,
        },
      });

      res.status(201).json({ success: true, data: { registrada: true } });
    } catch (err) { next(err); }
  },
];

const buildDashboardStats = async (isSuperAdmin) => {
  const todayStart = startOfEcuadorDay();
  const yesterdayStart = startOfEcuadorDay(1);
  const currentPeriodStart = startOfEcuadorDay(29);
  const previousPeriodStart = startOfEcuadorDay(59);
  const chartStart = startOfEcuadorDay(13);

  const [
    totalNoticias,
    noticiasPub,
    totalMedicos,
    totalEspecialidades,
    currentVisits,
    previousVisits,
    todayVisits,
    yesterdayVisits,
    uniqueCountRows,
    chartVisits,
    topPages,
    mensajesNoLeidos,
    mensajesRecientes,
  ] = await Promise.all([
    prisma.noticia.count(),
    prisma.noticia.count({ where: { publicado: true } }),
    prisma.medico.count({ where: { activo: true } }),
    prisma.especialidad.count({ where: { disponible: true } }),
    prisma.visitaPagina.count({ where: { creadoEn: { gte: currentPeriodStart } } }),
    prisma.visitaPagina.count({
      where: { creadoEn: { gte: previousPeriodStart, lt: currentPeriodStart } },
    }),
    prisma.visitaPagina.count({ where: { creadoEn: { gte: todayStart } } }),
    prisma.visitaPagina.count({
      where: { creadoEn: { gte: yesterdayStart, lt: todayStart } },
    }),
    prisma.$queryRaw(Prisma.sql`
      SELECT
        COUNT(DISTINCT "visitanteId")::int AS "visitantes",
        COUNT(DISTINCT "sesionId")::int AS "sesiones"
      FROM "visitas_paginas"
      WHERE "creadoEn" >= ${currentPeriodStart}
    `),
    prisma.visitaPagina.findMany({
      where: { creadoEn: { gte: chartStart } },
      select: { creadoEn: true, visitanteId: true },
      orderBy: { creadoEn: 'asc' },
    }),
    prisma.visitaPagina.groupBy({
      by: ['ruta', 'titulo'],
      where: { creadoEn: { gte: currentPeriodStart } },
      _count: { _all: true },
      orderBy: { _count: { ruta: 'desc' } },
      take: 6,
    }),
    isSuperAdmin
      ? prisma.mensajeContacto.count({ where: { leido: false } })
      : Promise.resolve(null),
    isSuperAdmin
      ? prisma.mensajeContacto.findMany({
        orderBy: { creadoEn: 'desc' },
        take: 5,
        select: {
          id: true,
          nombre: true,
          asunto: true,
          leido: true,
          creadoEn: true,
        },
      })
      : Promise.resolve([]),
  ]);

  const uniqueCounts = uniqueCountRows[0] || { visitantes: 0, sesiones: 0 };
  const averagePagesPerSession = uniqueCounts.sesiones
    ? Math.round((currentVisits / uniqueCounts.sesiones) * 10) / 10
    : 0;

  return {
    totalNoticias,
    noticiasPub,
    totalMedicos,
    totalEspecialidades,
    mensajesNoLeidos,
    visitas: {
      total30Dias: currentVisits,
      visitantesUnicos30Dias: uniqueCounts.visitantes,
      sesiones30Dias: uniqueCounts.sesiones,
      paginasPorSesion: averagePagesPerSession,
      hoy: todayVisits,
      cambioHoy: getPercentageChange(todayVisits, yesterdayVisits),
      cambio30Dias: getPercentageChange(currentVisits, previousVisits),
      serieDiaria: buildDailySeries(chartVisits),
      paginasPrincipales: topPages.map((page) => ({
        ruta: page.ruta,
        titulo: page.titulo,
        visitas: page._count._all,
      })),
    },
    mensajesRecientes,
    actualizadoEn: new Date().toISOString(),
  };
};

const getDashboardStats = async (req, res, next) => {
  const cacheKey = req.usuario?.rol === 'SUPERADMIN' ? 'superadmin' : 'editor';
  const cached = dashboardCache.get(cacheKey);

  try {
    if (cached?.data && cached.expiresAt > Date.now()) {
      res.set('X-HPVC-Cache', 'HIT');
      return res.json({ success: true, data: cached.data });
    }

    let pending = cached?.pending;
    if (!pending) {
      pending = buildDashboardStats(cacheKey === 'superadmin');
      dashboardCache.set(cacheKey, { pending });
    }

    const data = await pending;
    dashboardCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    });

    res.set('X-HPVC-Cache', cached?.pending ? 'COALESCED' : 'MISS');
    return res.json({ success: true, data });
  } catch (err) {
    dashboardCache.delete(cacheKey);
    return next(err);
  }
};

module.exports = { registrarVisita, getDashboardStats };
