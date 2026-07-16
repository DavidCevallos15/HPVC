/**
 * ingest-documentos.js
 * Script de ingestión masiva de PDFs.
 *
 * FLUJO:
 *  1. Lee todos los PDFs de /public/uploads/documentos
 *  2. Llama a Groq para clasificar y generar metadata (titulo, tipo, descripcion)
 *  3. Inserta el DocumentoAcademico en BD (idempotente por archivoUrl)
 *  4. Indexa los chunks con embeddings locales
 *
 * USO:
 *   GROQ_API_KEY=<key> node src/scripts/ingest-documentos.js
 *   GROQ_API_KEY=<key> node src/scripts/ingest-documentos.js --reset  (borra y re-indexa todo)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const path    = require('path');
const fs      = require('fs');
const Groq    = require('groq-sdk');
const { PrismaClient } = require('@prisma/client');
const { indexarDocumento } = require('../services/documentos.service');

const prisma = new PrismaClient();
const groq   = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const DOCS_DIR    = path.join(__dirname, '../../public/uploads/documentos');
const RESET_FLAG  = process.argv.includes('--reset');

// ── Clasificador inteligente via Groq ──────────────────────────────────────
const TIPOS_VALIDOS = ['guia', 'protocolo', 'manual', 'normativa', 'instructivo', 'estudio'];

async function clasificarConIA(nombreArchivo) {
  if (!groq) return clasificarPorNombre(nombreArchivo);

  const prompt = `Clasifica este documento médico del Ministerio de Salud Pública de Ecuador.
Nombre del archivo: "${nombreArchivo}"

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "titulo": "Título limpio y descriptivo en español (sin siglas raras)",
  "tipo": "uno de: guia | protocolo | manual | normativa | instructivo | estudio",
  "descripcion": "Una oración breve describiendo de qué trata el documento"
}`;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = res.choices[0].message.content.trim();
    // Extraer JSON del texto (puede tener texto extra)
    const match = content.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('No JSON in response');

    const parsed = JSON.parse(match[0]);
    if (!TIPOS_VALIDOS.includes(parsed.tipo)) parsed.tipo = 'guia';
    return parsed;
  } catch (e) {
    // Fallback: clasificación por palabras clave en el nombre
    return clasificarPorNombre(nombreArchivo);
  }
}

function clasificarPorNombre(nombre) {
  const n = nombre.toLowerCase();
  let tipo = 'guia';
  if (n.includes('manual'))       tipo = 'manual';
  else if (n.includes('norma') || n.includes('normativo')) tipo = 'normativa';
  else if (n.includes('instructivo')) tipo = 'instructivo';
  else if (n.includes('protocolo')) tipo = 'protocolo';
  else if (n.includes('estudio') || n.includes('investigacion')) tipo = 'estudio';

  const titulo = nombre
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { titulo, tipo, descripcion: null };
}

// ── Función principal ──────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  INGESTIÓN DE DOCUMENTOS CLÍNICOS - HPVC');
  console.log('═══════════════════════════════════════════════════════\n');

  if (RESET_FLAG) {
    console.log('⚠️  --reset: eliminando todos los documentos y chunks anteriores...');
    await prisma.documentoChunk.deleteMany({});
    await prisma.documentoAcademico.deleteMany({});
    console.log('   ✓ Base de datos limpiada.\n');
  }

  // Leer PDFs
  const archivos = fs.readdirSync(DOCS_DIR)
    .filter(f => /\.pdf$/i.test(f))
    .sort();

  console.log(`📂 Documentos encontrados: ${archivos.length}\n`);

  let exitosos = 0;
  let omitidos = 0;
  let errores  = 0;

  for (let i = 0; i < archivos.length; i++) {
    const nombre    = archivos[i];
    const archivoUrl = `/uploads/documentos/${nombre}`;
    const prefix    = `[${String(i + 1).padStart(2, '0')}/${archivos.length}]`;

    process.stdout.write(`${prefix} ${nombre.slice(0, 55)}... `);

    // Idempotencia: skip si ya existe
    const existente = await prisma.documentoAcademico.findFirst({ where: { archivoUrl } });
    if (existente && !RESET_FLAG) {
      console.log('⏭  (ya indexado)');
      omitidos++;
      continue;
    }

    try {
      // 1. Clasificar con IA
      const meta = await clasificarConIA(nombre);

      // 2. Crear o actualizar en BD
      const doc = existente
        ? await prisma.documentoAcademico.update({
            where: { id: existente.id },
            data: { titulo: meta.titulo, tipo: meta.tipo },
          })
        : await prisma.documentoAcademico.create({
            data: { titulo: meta.titulo, tipo: meta.tipo, archivoUrl },
          });

      // 3. Indexar chunks con embeddings
      const nChunks = await indexarDocumento(doc.id, archivoUrl);

      console.log(`✅ (${meta.tipo}) → ${nChunks} fragmentos`);
      exitosos++;
    } catch (e) {
      console.log(`❌ Error: ${e.message.slice(0, 80)}`);
      errores++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  RESULTADO: ✅ ${exitosos} | ⏭ ${omitidos} | ❌ ${errores}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
