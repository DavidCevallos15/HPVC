const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const requireSeccionHabilitada = (clave) => async (req, res, next) => {
  try {
    const seccion = await prisma.seccionPublica.findUnique({
      where: { clave },
      select: { habilitada: true },
    });

    if (seccion && !seccion.habilitada) {
      return res.status(503).json({
        success: false,
        code: 'SECTION_DISABLED',
        message: 'Esta sección se encuentra temporalmente no disponible.',
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireSeccionHabilitada };
