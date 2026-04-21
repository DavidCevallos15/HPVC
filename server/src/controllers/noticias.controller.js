const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const slugify = (text) =>
  text.toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();

const extractFirstImageFromHtml = (html) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
};

// ── PUBLIC ─────────────────────────────────────────────────────────
const getPublicas = async (req, res, next) => {
  try {
    const { categoria, page = 1, limit = 9 } = req.query;
    const where = { publicado: true, ...(categoria && { categoria }) };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, noticias] = await Promise.all([
      prisma.noticia.count({ where }),
      prisma.noticia.findMany({
        where,
        orderBy: { publicadoEn: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          titulo: true,
          slug: true,
          extracto: true,
          contenido: true,
          imagenUrl: true,
          embedUrl: true,
          categoria: true,
          publicadoEn: true,
        },
      }),
    ]);

    const noticiasConPreview = noticias.map((n) => {
      const previewImageUrl = n.imagenUrl || extractFirstImageFromHtml(n.contenido);
      const previewMode = n.embedUrl && !previewImageUrl ? 'frame' : (previewImageUrl ? 'image' : 'placeholder');

      return {
        id: n.id,
        titulo: n.titulo,
        slug: n.slug,
        extracto: n.extracto,
        imagenUrl: n.imagenUrl,
        embedUrl: n.embedUrl,
        categoria: n.categoria,
        publicadoEn: n.publicadoEn,
        previewImageUrl,
        previewMode,
      };
    });

    res.json({
      success: true,
      data: noticiasConPreview,
      meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getBySlug = async (req, res, next) => {
  try {
    const noticia = await prisma.noticia.findFirst({
      where: { slug: req.params.slug, publicado: true },
    });
    if (!noticia) return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });
    res.json({ success: true, data: noticia });
  } catch (err) { next(err); }
};

// ── ADMIN ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const noticias = await prisma.noticia.findMany({ orderBy: { creadoEn: 'desc' } });
    res.json({ success: true, data: noticias });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { titulo, extracto, contenido, categoria, embedUrl } = req.body;
    const publicado = req.body.publicado === 'true' || req.body.publicado === true;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = titulo ? `${slugify(titulo)}-${Date.now()}` : `noticia-${Date.now()}`;

    const noticia = await prisma.noticia.create({
      data: {
        titulo: titulo || null, 
        slug, 
        extracto: extracto || null, 
        contenido: contenido || null, 
        categoria, 
        imagenUrl,
        embedUrl: embedUrl || null,
        publicado,
        publicadoEn: publicado ? new Date() : null,
      },
    });
    res.status(201).json({ success: true, data: noticia });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, extracto, contenido, categoria, embedUrl } = req.body;
    const publicado = req.body.publicado === 'true' || req.body.publicado === true;

    const data = { 
        titulo: titulo || null, 
        extracto: extracto || null, 
        contenido: contenido || null, 
        categoria, 
        publicado, 
        embedUrl: embedUrl || null 
    };
    if (req.file) data.imagenUrl = `/uploads/${req.file.filename}`;

    const existing = await prisma.noticia.findUnique({ where: { id } });
    if (!existing.publicado && publicado) data.publicadoEn = new Date();

    const noticia = await prisma.noticia.update({ where: { id }, data });
    res.json({ success: true, data: noticia });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.noticia.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Noticia eliminada correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { getPublicas, getBySlug, getAll, create, update, remove };
