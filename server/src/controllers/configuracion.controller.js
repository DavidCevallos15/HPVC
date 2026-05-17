const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const configs = await prisma.configuracion.findMany({ orderBy: { clave: 'asc' } });
    // Convertir array de {clave, valor} a objeto plano para facilidad de uso
    const data = configs.reduce((acc, c) => { acc[c.clave] = c.valor; return acc; }, {});
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    let pairs; // array de {clave, valor}

    // Acepta dos formatos:
    // 1. { configs: [{clave, valor}, ...] }  ← enviado por HeroCarouselAdminPage
    // 2. { clave1: valor1, clave2: valor2 }  ← enviado por ConfiguracionPage
    if (req.body.configs && Array.isArray(req.body.configs)) {
      pairs = req.body.configs.filter(c => c.clave !== undefined && c.valor !== undefined);
    } else if (typeof req.body === 'object' && !Array.isArray(req.body)) {
      pairs = Object.entries(req.body).map(([clave, valor]) => ({ clave, valor }));
    } else {
      return res.status(400).json({ success: false, message: 'Formato inválido. Se espera un objeto o {configs:[...]}.' });
    }

    if (pairs.length === 0)
      return res.status(400).json({ success: false, message: 'No se proporcionaron configuraciones.' });

    const results = await Promise.all(
      pairs.map(({ clave, valor }) =>
        prisma.configuracion.upsert({
          where:  { clave },
          update: { valor: String(valor ?? '') },
          create: { clave, valor: String(valor ?? '') },
        })
      )
    );
    res.json({ success: true, message: 'Configuración actualizada.', data: results.length });
  } catch (err) { next(err); }
};

// Estadísticas para el dashboard
const getStats = async (req, res, next) => {
  try {
    const [totalNoticias, noticiasPub, totalMedicos, totalEspecialidades, mensajesNoLeidos] = await Promise.all([
      prisma.noticia.count(),
      prisma.noticia.count({ where: { publicado: true } }),
      prisma.medico.count({ where: { activo: true } }),
      prisma.especialidad.count({ where: { disponible: true } }),
      prisma.mensajeContacto.count({ where: { leido: false } }),
    ]);
    res.json({
      success: true,
      data: { totalNoticias, noticiasPub, totalMedicos, totalEspecialidades, mensajesNoLeidos },
    });
  } catch (err) { next(err); }
};

const updateImage = async (req, res, next) => {
  try {
    const { clave } = req.body;
    if (!clave) return res.status(400).json({ success: false, message: 'Clave requerida' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Imagen requerida' });
    
    const imageUrl = `/uploads/${req.file.filename}`;
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor: imageUrl },
      create: { clave, valor: imageUrl }
    });
    
    res.json({ success: true, url: imageUrl });
  } catch (err) { next(err); }
};

const deleteConfig = async (req, res, next) => {
  try {
    const { clave } = req.params;
    if (!clave) return res.status(400).json({ success: false, message: 'Clave requerida' });

    // deleteMany en lugar de delete: no lanza error si el registro no existe
    await prisma.configuracion.deleteMany({
      where: { clave }
    });

    res.json({ success: true, message: 'Configuración eliminada correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, update, getStats, updateImage, deleteConfig };
