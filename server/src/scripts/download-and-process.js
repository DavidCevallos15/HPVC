const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const unzipper = require('unzipper');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const aiService = require('../services/ai.service');

const prisma = new PrismaClient();

const OWNCLOUD_URL = 'http://drive.hpvc.gob.ec/owncloud/index.php/s/0JeQwDO036PsKkk/download';
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/documentos');
const TEMP_ZIP = path.join(__dirname, '../../temp_docs.zip');

async function downloadDocs() {
  console.log('Descargando documentos desde OwnCloud...');
  const response = await axios({
    url: OWNCLOUD_URL,
    method: 'GET',
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(TEMP_ZIP);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function extractDocs() {
  console.log('Extrayendo archivos...');
  await fs.ensureDir(UPLOADS_DIR);
  return fs.createReadStream(TEMP_ZIP)
    .pipe(unzipper.Extract({ path: UPLOADS_DIR }))
    .promise();
}

async function processFile(filePath) {
  const fileName = path.basename(filePath);
  if (!fileName.toLowerCase().endsWith('.pdf')) return;

  console.log(`Procesando: ${fileName}...`);
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdf(dataBuffer);
    
    // Crear registro del documento
    const documento = await prisma.documentoAcademico.create({
      data: {
        titulo: fileName.replace(/\.pdf$/i, '').replace(/_/g, ' '),
        tipo: fileName.toLowerCase().includes('guia') || fileName.toLowerCase().includes('gpc') ? 'guia' : 'protocolo',
        archivoUrl: `/uploads/documentos/${fileName}`,
      }
    });

    // Dividir en fragmentos (chunks) por párrafos o bloques de texto
    // Para simplificar, dividiremos por páginas si es posible o bloques de ~1000 caracteres
    const pages = data.text.split(/\n\s*\n/); // Intento de división por párrafos
    
    let chunkCount = 0;
    for (let i = 0; i < pages.length; i++) {
      const content = pages[i].trim();
      if (content.length < 100) continue; // Ignorar fragmentos muy cortos

      const embedding = await aiService.generateEmbedding(content);
      
      const chunk = await prisma.documentoChunk.create({
        data: {
          documentoId: documento.id,
          contenido: content,
          pagina: Math.floor(i / 2) + 1, // Estimación simple si no hay info de página real
          orden: chunkCount++
        }
      });

      // Guardar embedding en la columna de fallback (float8[])
      await prisma.$executeRawUnsafe(
        `UPDATE documentos_chunks SET embedding_fallback = ARRAY[${embedding.join(',')}]::float8[] WHERE id = $1`,
        chunk.id
      );
    }
    
    console.log(`  ✓ Completado: ${fileName} (${chunkCount} fragmentos)`);
  } catch (e) {
    console.error(`  ✗ Error procesando ${fileName}:`, e.message);
  }
}

async function getAllFiles(dirPath, arrayOfFiles) {
  const files = await fs.readdir(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if ((await fs.stat(filePath)).isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }
  return arrayOfFiles;
}

async function main() {
  try {
    if (!fs.existsSync(TEMP_ZIP)) {
      await downloadDocs();
    }
    await extractDocs();

    const allFiles = await getAllFiles(UPLOADS_DIR);
    console.log(`Encontrados ${allFiles.length} archivos para procesar.`);

    for (const filePath of allFiles) {
      await processFile(filePath);
    }

    console.log('¡Procesamiento completo!');
  } catch (error) {
    console.error('Error en el proceso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
