const { PrismaClient } = require('@prisma/client');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');

async function test() {
  try {
    const zipPath = path.join(__dirname, 'temp_docs.zip');
    if (!fs.existsSync(zipPath)) {
      console.log('No temp_docs.zip');
      return;
    }
    console.log("Opening zip...");
    const directory = await unzipper.Open.file(zipPath);
    console.log("Zip opened. Files:", directory.files.length);

    let count = 0;
    for (const entry of directory.files) {
      if (entry.path.toLowerCase().endsWith('.pdf') && !entry.path.includes('__MACOSX')) {
        count++;
      }
    }
    console.log("Valid PDFs found:", count);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
