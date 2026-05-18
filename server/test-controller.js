const { PrismaClient } = require('@prisma/client');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');

async function test() {
  try {
    const zipPath = path.join(__dirname, 'test.zip');
    // Ensure test.zip exists
    if (!fs.existsSync(zipPath)) {
      console.log('No test.zip');
      return;
    }
    const directory = await unzipper.Open.file(zipPath);
    console.log("Zip opened");
    for (const entry of directory.files) {
      if (entry.path.toLowerCase().endsWith('.pdf') && !entry.path.includes('__MACOSX')) {
        console.log(entry.path);
        const buffer = await entry.buffer();
        console.log("Buffer size:", buffer.length);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
