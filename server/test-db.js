const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  console.log("Connecting...");
  const docs = await prisma.documentoAcademico.findMany({ take: 1 });
  console.log("Docs:", docs.length);
}
test().finally(() => prisma.$disconnect());
