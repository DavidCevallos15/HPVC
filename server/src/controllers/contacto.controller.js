const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const prisma = new PrismaClient();

// Rate limit específico para formulario de contacto
const contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { success: false, message: 'Demasiados mensajes enviados. Intente nuevamente en 1 hora.' },
});

// ── PUBLIC: Enviar mensaje ──────────────────────────────────────────
const enviar = async (req, res, next) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    if (!nombre || !email || !asunto || !mensaje)
      return res.status(400).json({ success: false, message: 'Nombre, email, asunto y mensaje son requeridos.' });

    const msg = await prisma.mensajeContacto.create({
      data: { nombre, email, telefono: telefono || null, asunto, mensaje },
    });
    res.status(201).json({ success: true, message: 'Mensaje enviado correctamente. Nos comunicaremos pronto.', data: { id: msg.id } });
  } catch (err) { next(err); }
};

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

module.exports = { enviar, getAll, marcarLeido, eliminar, contactoLimiter };
