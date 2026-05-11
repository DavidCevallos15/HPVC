/**
 * documentos.service.js
 * Servicio de procesamiento y búsqueda de documentos clínicos.
 * Responsabilidades:
 *   - Extraer texto de PDFs usando pdf-parse
 *   - Generar embeddings locales (sin dependencia de API externa)
 *   - Almacenar chunks indexados en PostgreSQL
 *   - Búsqueda semántica mediante similitud de coseno (fallback nativo en PG)
 */

const path = require('path');
const fs   = require('fs');
const pdf  = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Dimensiones del modelo all-MiniLM-L6-v2
const EMBEDDING_DIMS = 384;
// Tamaño máx. de un chunk en caracteres para mantener contexto relevante
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

// ── Pipeline de embeddings (carga diferida para no bloquear el arranque) ──
let _pipeline = null;
async function getPipeline() {
  if (!_pipeline) {
    const { pipeline } = await import('@xenova/transformers');
    _pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return _pipeline;
}

/**
 * Genera un vector de 384 dimensiones para un texto.
 * @param {string} text
 * @returns {number[]}
 */
async function generateEmbedding(text) {
  const extractor = await getPipeline();
  const output = await extractor(text.slice(0, 1000), { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Divide texto en chunks con solapamiento para preservar contexto.
 * @param {string} text
 * @returns {string[]}
 */
function chunkText(text) {
  const chunks = [];
  let start = 0;
  const clean = text.replace(/\s+/g, ' ').trim();
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter(c => c.length > 80);
}

/**
 * Procesa un archivo PDF: extrae texto, genera chunks y los indexa.
 * Idempotente: si el documento ya existe con archivoUrl, lo omite.
 *
 * @param {number} documentoId - ID del DocumentoAcademico en BD
 * @param {string} archivoUrl  - URL pública relativa, ej: /uploads/documentos/foo.pdf
 */
async function indexarDocumento(documentoId, archivoUrl) {
  const filePath = path.join(__dirname, '../../public', archivoUrl);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado en disco: ${filePath}`);
  }

  // Eliminar chunks anteriores si se re-indexa
  await prisma.documentoChunk.deleteMany({ where: { documentoId } });

  const buffer = fs.readFileSync(filePath);
  let data;
  try {
    data = await pdf(buffer);
  } catch (e) {
    throw new Error(`Error extrayendo texto del PDF: ${e.message}`);
  }

  const chunks = chunkText(data.text);
  let orden = 0;

  for (const contenido of chunks) {
    const embedding = await generateEmbedding(contenido);
    const chunk = await prisma.documentoChunk.create({
      data: { documentoId, contenido, orden: orden++, pagina: null },
    });
    // Guardar en columna fallback float8[]
    await prisma.$executeRawUnsafe(
      `UPDATE documentos_chunks SET embedding_fallback = ARRAY[${embedding.join(',')}]::float8[] WHERE id = $1`,
      chunk.id,
    );
  }

  return orden; // Número de chunks indexados
}

/**
 * Busca los chunks más relevantes para una consulta.
 * @param {string} query
 * @param {number} limit
 * @param {number} documentoId - Opcional. ID del documento para filtrar la búsqueda.
 * @returns {Array}
 */
async function buscarChunks(query, limit = 6, documentoId = null) {
  const embedding = await generateEmbedding(query);
  const vectorLiteral = `ARRAY[${embedding.join(',')}]::float8[]`;
  
  let whereClause = `WHERE c.embedding_fallback IS NOT NULL`;
  if (documentoId) {
      whereClause += ` AND c."documentoId" = ${parseInt(documentoId)}`;
  }

  const rows = await prisma.$queryRawUnsafe(`
    SELECT
      c.id,
      c."documentoId",
      c.contenido,
      c.pagina,
      c.orden,
      d.titulo,
      d.tipo,
      d."archivoUrl",
      cosine_similarity(c.embedding_fallback, ${vectorLiteral}) AS similitud
    FROM documentos_chunks c
    JOIN documentos_academicos d ON d.id = c."documentoId"
    ${whereClause}
    ORDER BY similitud DESC
    LIMIT ${limit}
  `);

  return rows;
}

module.exports = { generateEmbedding, indexarDocumento, buscarChunks };
