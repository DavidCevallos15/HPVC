require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixConfig() {
  const correctData = [
    { clave: 'hospital_nombre',    valor: 'Hospital Provincial Dr. Verdi Cevallos Balda' },
    { clave: 'hospital_telefono',  valor: '(05) 259-0140' },
    { clave: 'hospital_email',     valor: 'hospital.portoviejo@mspz4.gob.ec' },
    { clave: 'hospital_direccion', valor: 'Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105' },
    { clave: 'hospital_horario',   valor: 'Emergencias: 24/7 | Consulta Externa: Lunes a Viernes 08h00 - 17h00' },
  ];

  console.log('🔧 Corrigiendo configuración del hospital...\n');

  for (const item of correctData) {
    const result = await prisma.configuracion.upsert({
      where: { clave: item.clave },
      update: { valor: item.valor },
      create: item,
    });
    console.log(`✅ ${result.clave} = "${result.valor}"`);
  }

  console.log('\n🎉 Configuración corregida exitosamente.');
  console.log('   Recarga la página web para ver los cambios.');
}

fixConfig()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
