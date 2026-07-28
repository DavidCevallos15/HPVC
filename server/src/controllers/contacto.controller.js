const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const { contactoSchemas } = require('../validators/schemas');
const { validate } = require('../middlewares/validate');
const { createContactEmailJob } = require('../services/emailQueue.service');
const prisma = new PrismaClient();

// Rate limit específico para formulario de contacto
const contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { success: false, message: 'Demasiados mensajes enviados. Intente nuevamente en 1 hora.' },
});

// ── PUBLIC: Enviar mensaje ──────────────────────────────────────────
const enviar = [
  contactoLimiter,
  validate(contactoSchemas.enviar),
  async (req, res, next) => {
    try {
      const { nombre, email, telefono, asunto, mensaje } = req.body;

      const msg = await prisma.$transaction(async (tx) => {
        const savedMessage = await tx.mensajeContacto.create({
          data: { nombre, email, telefono: telefono || null, asunto, mensaje },
        });

        await createContactEmailJob(tx, savedMessage);
        return savedMessage;
      });

      res.status(201).json({ success: true, message: 'Mensaje enviado correctamente. Nos comunicaremos pronto.', data: { id: msg.id } });
    } catch (err) { next(err); }
  }
];

// ── ADMIN ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { leido } = req.query;
    const where = leido !== undefined ? { leido: leido === 'true' } : {};
    const mensajes = await prisma.mensajeContacto.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
    const totalNoLeidos = await prisma.mensajeContacto.count({ where: { leido: false } });
    res.json({ success: true, data: mensajes, meta: { totalNoLeidos } });
  } catch (err) { next(err); }
};

const getUnreadSummary = async (req, res, next) => {
  try {
    const [totalNoLeidos, recientes] = await Promise.all([
      prisma.mensajeContacto.count({ where: { leido: false } }),
      prisma.mensajeContacto.findMany({
        where: { leido: false },
        orderBy: { creadoEn: 'desc' },
        take: 3,
        select: {
          id: true,
          nombre: true,
          asunto: true,
          creadoEn: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: { totalNoLeidos, recientes },
    });
  } catch (err) { next(err); }
};

const marcarLeido = async (req, res, next) => {
  try {
    const msg = await prisma.mensajeContacto.update({
      where: { id: parseInt(req.params.id) },
      data: { leido: true },
    });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await prisma.mensajeContacto.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Mensaje eliminado.' });
  } catch (err) { next(err); }
};

module.exports = { enviar, getAll, getUnreadSummary, marcarLeido, eliminar, contactoLimiter };
