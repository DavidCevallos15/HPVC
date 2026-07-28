const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const selectSeccion = {
  id: true,
  clave: true,
  nombre: true,
  rutaBase: true,
  habilitada: true,
  protegida: true,
  descripcion: true,
  actualizadoEn: true,
};

const getPublicas = async (req, res, next) => {
  try {
    const secciones = await prisma.seccionPublica.findMany({
      select: selectSeccion,
      orderBy: { nombre: 'asc' },
    });

    res.json({ success: true, data: secciones });
  } catch (err) {
    next(err);
  }
};

const getAdmin = async (req, res, next) => {
  try {
    const secciones = await prisma.seccionPublica.findMany({
      select: {
        ...selectSeccion,
        creadoEn: true,
        _count: { select: { cambios: true } },
      },
      orderBy: [{ protegida: 'desc' }, { nombre: 'asc' }],
    });

    res.json({ success: true, data: secciones });
  } catch (err) {
    next(err);
  }
};

const updateEstado = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { habilitada } = req.body;

    if (typeof habilitada !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo habilitada debe ser un valor booleano.',
      });
    }

    const actual = await prisma.seccionPublica.findUnique({ where: { clave } });

    if (!actual) {
      return res.status(404).json({
        success: false,
        message: 'La sección pública indicada no existe.',
      });
    }

    if (actual.protegida && habilitada === false) {
      return res.status(409).json({
        success: false,
        code: 'PROTECTED_SECTION',
        message: 'Esta sección es esencial y no puede inhabilitarse.',
      });
    }

    if (actual.habilitada === habilitada) {
      return res.json({
        success: true,
        message: 'La sección ya tenía el estado solicitado.',
        data: actual,
      });
    }

    const actualizada = await prisma.$transaction(async (tx) => {
      const seccion = await tx.seccionPublica.update({
        where: { clave },
        data: { habilitada },
      });

      await tx.seccionPublicaCambio.create({
        data: {
          seccionId: actual.id,
          usuarioId: req.usuario?.id ?? null,
          valorAnterior: actual.habilitada,
          valorNuevo: habilitada,
        },
      });

      return seccion;
    });

    res.json({
      success: true,
      message: habilitada
        ? 'Sección pública habilitada correctamente.'
        : 'Sección pública inhabilitada temporalmente.',
      data: actualizada,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicas, getAdmin, updateEstado };
