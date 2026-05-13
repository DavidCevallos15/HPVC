const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza y carga de médicos...');

  // 1. LIMPIEZA DE GARBAGE (HORARIOS MATRIX MISTAKES)
  const garbageKeywords = [
    'CALAMIDAD DOMESTICA', 'EXTRAMURAL', 'FERIADO', 'JEFES DE AREAS',
    'MEDICO RURAL', 'PERMISO DE MATERNIDAD', 'SUBDIRECCIONES',
    'TURNO DE MEDICO', 'VACACIONES', 'DE 08 HORAS', 'DE 12 HORAS', 'DE 24 HORAS'
  ];

  const garbageWhere = {
    OR: garbageKeywords.map(k => ({ nombre: { contains: k, mode: 'insensitive' } }))
  };

  const toDelete = await prisma.medico.findMany({ where: garbageWhere });
  console.log(`Borrando ${toDelete.length} médicos basura...`);
  
  if (toDelete.length > 0) {
      await prisma.horario.deleteMany({
          where: { medicoId: { in: toDelete.map(m => m.id) } }
      });
      const deleted = await prisma.medico.deleteMany({ where: garbageWhere });
      console.log(`Borrados ${deleted.count} registros.`);
  }

  // 2. LECTURA Y CARGA DE NUEVOS MÉDICOS
  const txtPath = '/home/david/.gemini/antigravity/brain/68f3974a-3b66-4663-83b4-a8692675d823/scratch/medicos_list.txt';
  if (!fs.existsSync(txtPath)) {
      console.error('No se encontró el archivo medicos_list.txt');
      process.exit(1);
  }

  const text = fs.readFileSync(txtPath, 'utf-8');
  const blocks = text.split('\n\n');

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    
    // El formato es:
    // ESPECIALIDAD
    // Dr. Nombre 1
    // Dr. Nombre 2
    let especialidadName = lines[0].trim();
    // Capitalize Title Case
    especialidadName = especialidadName.charAt(0).toUpperCase() + especialidadName.slice(1).toLowerCase();

    const medicos = lines.slice(1).map(l => l.trim()).filter(l => l && !l.startsWith('('));

    if (medicos.length === 0) continue;

    // Buscar o crear la especialidad
    // Mapearemos un icono por defecto a todo para que la UI no falle
    const esp = await prisma.especialidad.upsert({
       where: { nombre: especialidadName },
       update: {},
       create: { nombre: especialidadName, icono: 'user' }
    });

    console.log(`\nProcesando especialidad: ${esp.nombre}`);

    for (const mName of medicos) {
        // Limpiar el nombre (ej. quitar "(Jefe De Guardia)" si queremos, o dejarlo). 
        // Dejémoslo porque el usuario lo mandó así o limpiemos un poco los posts " (Jefe...)"
        const cleanName = mName.replace(/\s*\(.*?\)\s*/g, '').trim();

        // Check if exists
        const exists = await prisma.medico.findFirst({
            where: { nombre: cleanName, especialidadId: esp.id }
        });

        if (!exists) {
            await prisma.medico.create({
                data: {
                   nombre: cleanName,
                   especialidadId: esp.id
                }
            });
            console.log(`  + Añadido: ${cleanName}`);
        } else {
            console.log(`  - Ya existe: ${cleanName}`);
        }
    }
  }

  // 3. AÑADIR ÁREAS ADMINISTRATIVAS COMO ESPECIALIDADES (O ÁREAS)
  // El usuario pasó una lista separada por "  \n\n" o parecida en la descripción
  const areasExtras = [
    "Administración", "Admisiones", "Anatomía Patológica", "Archivo Pasivo", "Área de Procedimiento Cardiología", 
    "Asesoría Jurídica", "Audiometría", "BA-P1-Recuperación Nuevo", "Banco de Leche", "Banco de Sangre", 
    "Bodega", "CE Ginecología", "CE Preconsulta 2 y 3", "Central Esterilización", "Cirugía de Mujeres", 
    "Cirugía Varones", "Compras Públicas", "Comunicación", "Consultorios", "Coordinación Laboratorio Clínico", 
    "COVID 19", "Dirección Médica", "Director Adminfinanciero", "Enfermería", "Epidemiología", 
    "Estación y Subestación de Enfermería Centro Obstétrico", "Farmacia", "Financiero", "Gerencia General", 
    "Gestión al Usuario", "Hospitalización", "Información", "Laboratorio Clínico", "Mantenimiento", 
    "Planificación Estratégica", "Preparación", "Quirófano", "Recaudación", "Sala de Parto", "Sala de Primera Acogida", 
    "Sala de Quemados", "Laboratorio de Tuberculosis", "Sala Situacional", "Salud Ocupacional", "Secretaría General", 
    "Subdirección", "Talento Humano", "TICS", "Trabajo Social", "Triage", "Unidad de Cuidados Intensivos (UCI)", 
    "Vacunación Neonatal", "Ventanilla Única", "Vigilancia Epidemiológica"
  ];

  console.log('\nProcesando áreas administrativas/hospitalarias...');
  for (const area of areasExtras) {
      await prisma.especialidad.upsert({
         where: { nombre: area },
         update: {},
         create: { nombre: area, icono: 'building' }
      });
  }

  console.log('\n¡Proceso finalizado!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
