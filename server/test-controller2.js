const { PrismaClient } = require('@prisma/client');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');

async function test() {
  try {
    const zipPath = path.join(__dirname, 'test.zip');
    const directory = await unzipper.Open.file(zipPath);
    const createdDocs = [];

    for (const entry of directory.files) {
      if (entry.path.toLowerCase().endsWith('.pdf') && !entry.path.includes('__MACOSX')) {
        const baseName = path.basename(entry.path)
          .replace(/[^a-zA-Z0-9ÁáÉéÍíÓóÚúÑñ._\- ]/g, '')
          .replace(/\s+/g, '_');
        
        const uniqueFilename = `${Date.now()}_${baseName}`;
        console.log("Saving", uniqueFilename);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
