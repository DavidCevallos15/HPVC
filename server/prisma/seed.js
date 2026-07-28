require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos HPVC...');

  // ── 1. SUPERADMIN ────────────────────────────────────────────────
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hpvc.gob.ec';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HpvcAdmin2026!';
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      password: passwordHash,
      nombre: 'Administrador HPVC',
      rol: 'SUPERADMIN',
    },
  });
  console.log(`✅ SUPERADMIN creado: ${admin.email}`);

  // ── 2. ESPECIALIDADES ────────────────────────────────────────────
  const especialidades = [
    { nombre: 'Medicina Interna',        icono: 'Stethoscope',  descripcion: 'Diagnóstico y tratamiento de enfermedades del adulto.',   orden: 1 },
    { nombre: 'Pediatría',               icono: 'Baby',         descripcion: 'Atención médica integral para niños y adolescentes.',      orden: 2 },
    { nombre: 'Cirugía General',         icono: 'Scissors',     descripcion: 'Procedimientos quirúrgicos del aparato digestivo y más.', orden: 3 },
    { nombre: 'Ginecología y Obstetricia',icono: 'Heart',       descripcion: 'Salud de la mujer y atención del parto.',                 orden: 4 },
    { nombre: 'Traumatología',           icono: 'Bone',         descripcion: 'Lesiones del sistema musculoesquelético.',                orden: 5 },
    { nombre: 'Cardiología',             icono: 'Activity',     descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón.',  orden: 6 },
    { nombre: 'Dermatología',            icono: 'Layers',       descripcion: 'Enfermedades de la piel, cabello y uñas.',               orden: 7 },
    { nombre: 'Neurología',              icono: 'Brain',        descripcion: 'Trastornos del sistema nervioso central y periférico.',   orden: 8 },
    { nombre: 'Oftalmología',            icono: 'Eye',          descripcion: 'Salud visual y enfermedades del ojo.',                   orden: 9 },
    { nombre: 'Odontología',             icono: 'Smile',        descripcion: 'Salud bucal y procedimientos dentales.',                 orden: 10 },
    { nombre: 'Psicología Clínica',      icono: 'Brain',        descripcion: 'Salud mental y bienestar emocional.',                    orden: 11 },
    { nombre: 'Laboratorio Clínico',     icono: 'FlaskConical', descripcion: 'Análisis clínicos y diagnóstico por laboratorio.',       orden: 12 },
  ];

  for (const esp of especialidades) {
    await prisma.especialidad.upsert({
      where: { nombre: esp.nombre },
      update: {},
      create: esp,
    });
  }
  console.log(`✅ ${especialidades.length} especialidades creadas.`);

  // ── 3. MÉDICOS DE MUESTRA ────────────────────────────────────────
  const espMedInterna = await prisma.especialidad.findFirst({ where: { nombre: 'Medicina Interna' } });
  const espPediatria  = await prisma.especialidad.findFirst({ where: { nombre: 'Pediatría' } });
  const espCirugia    = await prisma.especialidad.findFirst({ where: { nombre: 'Cirugía General' } });

  const medicos = [
    { nombre: 'Dr. Carlos Mendoza Vera',   especialidadId: espMedInterna.id },
    { nombre: 'Dra. Patricia Suárez León', especialidadId: espMedInterna.id },
    { nombre: 'Dr. Andrés Toapanta Cruz',  especialidadId: espPediatria.id },
    { nombre: 'Dra. Isabel Chávez Mora',   especialidadId: espPediatria.id },
    { nombre: 'Dr. Roberto Palacios Días', especialidadId: espCirugia.id },
  ];

  for (const m of medicos) {
    await prisma.medico.upsert({
      where: { id: (await prisma.medico.findFirst({ where: { nombre: m.nombre } }))?.id ?? -1 },
      update: {},
      create: m,
    }).catch(() => prisma.medico.create({ data: m }));
  }
  console.log(`✅ ${medicos.length} médicos creados.`);

  // ── 4. CONFIGURACIÓN BASE ────────────────────────────────────────
  const configs = [
    { clave: 'hospital_nombre',    valor: 'Hospital Provincial Dr. Verdi Cevallos Balda' },
    { clave: 'hospital_telefono',  valor: '(05) 259-0140' },
    { clave: 'hospital_email',     valor: 'hospital.portoviejo@mspz4.gob.ec' },
    { clave: 'hospital_direccion', valor: 'Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105' },
    { clave: 'hospital_horario',   valor: 'Emergencias: 24/7 | Consulta Externa: Lunes a Viernes 08h00 - 17h00' },
  ];

  for (const c of configs) {
    await prisma.configuracion.upsert({ where: { clave: c.clave }, update: { valor: c.valor }, create: c });
  }
  console.log(`✅ ${configs.length} configuraciones base creadas.`);

  // ── 5. SECCIONES PÚBLICAS ─────────────────────────────────────────
  const seccionesPublicas = [
    { clave: 'inicio', rutaBase: '/', nombre: 'Inicio', protegida: true, descripcion: 'Página principal del portal institucional.' },
    { clave: 'servicios', rutaBase: '/servicios', nombre: 'Servicios', descripcion: 'Información general de los servicios hospitalarios.' },
    { clave: 'servicios_paciente', rutaBase: '/servicios-paciente', nombre: 'Servicios al paciente', descripcion: 'Servicios y orientación disponibles para pacientes.' },
    { clave: 'especialidades', rutaBase: '/especialidades', nombre: 'Especialidades médicas', descripcion: 'Catálogo público de especialidades.' },
    { clave: 'directorio', rutaBase: '/directorio', nombre: 'Directorio médico', descripcion: 'Directorio público de profesionales.' },
    { clave: 'horarios', rutaBase: '/horarios', nombre: 'Horarios de atención', descripcion: 'Horarios y matriz de guardias.' },
    { clave: 'institucion', rutaBase: '/institucion', nombre: 'Institución', descripcion: 'Información institucional del hospital.' },
    { clave: 'acerca', rutaBase: '/acerca', nombre: 'Acerca del hospital', descripcion: 'Reseña e información del hospital.' },
    { clave: 'recorrido_virtual', rutaBase: '/recorrido-virtual', nombre: 'Recorrido virtual', descripcion: 'Recorrido virtual por las instalaciones.' },
    { clave: 'noticias', rutaBase: '/noticias', nombre: 'Noticias y actualidad', descripcion: 'Noticias institucionales y sus detalles.' },
    { clave: 'documentos', rutaBase: '/documentos', nombre: 'Documentos y transparencia', descripcion: 'Documentos académicos, POA y consultas documentales.' },
    { clave: 'asistente_clinico', rutaBase: '/asistente-clinico', nombre: 'Asistente clínico', descripcion: 'Herramientas de consulta clínica.' },
    { clave: 'subcentros', rutaBase: '/subcentros', nombre: 'GeoSalud MSP', descripcion: 'Acceso a información geográfica de salud.' },
    { clave: 'accesos', rutaBase: '/accesos', nombre: 'Accesos directos', descripcion: 'Accesos a sistemas y servicios externos.' },
    { clave: 'contacto', rutaBase: '/contacto', nombre: 'Contacto', protegida: true, descripcion: 'Canal oficial de contacto ciudadano.' },
    { clave: 'configuracion', rutaBase: '/api/public/configuracion', nombre: 'Configuración pública', protegida: true, descripcion: 'Datos institucionales básicos utilizados por el portal.' },
  ];

  for (const seccion of seccionesPublicas) {
    const { clave, ...datos } = seccion;
    await prisma.seccionPublica.upsert({
      where: { clave },
      update: datos,
      create: { clave, ...datos },
    });
  }
  console.log(`✅ ${seccionesPublicas.length} secciones públicas configuradas.`);

  // ── 6. NOTICIAS DE MUESTRA ───────────────────────────────────────
  const noticias = [
    {
      titulo: 'HPVC inaugura nueva unidad de Cuidados Intensivos Neonatales',
      slug: 'hpvc-inaugura-uci-neonatal-2026',
      extracto: 'El hospital amplía su capacidad con 10 nuevas cunas de cuidados intensivos para recién nacidos de alto riesgo.',
      contenido: '<p>El Hospital Provincial Verdi Cevallos anuncia la inauguración de su nueva Unidad de Cuidados Intensivos Neonatales (UCIN), equipada con tecnología de última generación. Esta nueva infraestructura permitirá atender a recién nacidos con condiciones críticas, mejorando significativamente las tasas de supervivencia en la provincia de Manabí.</p><p>La unidad cuenta con 10 cunas de cuidados intensivos, monitores cardiorrespiratorios, ventiladores neonatales y un equipo de neonatólogos y enfermeras especializadas disponibles las 24 horas.</p>',
      imagenUrl: null,
      categoria: 'Infraestructura',
      publicado: true,
      publicadoEn: new Date('2026-03-15'),
    },
    {
      titulo: 'Campaña de vacunación gratuita contra la influenza para adultos mayores',
      slug: 'campana-vacunacion-influenza-adultos-mayores-2026',
      extracto: 'El HPVC ofrece vacunación gratuita contra la influenza para personas mayores de 65 años durante el mes de abril.',
      contenido: '<p>En el marco de las acciones preventivas de salud pública, el Hospital Provincial Verdi Cevallos en coordinación con el Ministerio de Salud Pública del Ecuador llevará a cabo una campaña de vacunación gratuita contra la influenza.</p><p>La campaña está dirigida a personas mayores de 65 años, mujeres embarazadas y personal de salud. La vacunación se llevará a cabo en el hall de admisiones del hospital, de lunes a viernes de 8h00 a 15h00.</p>',
      imagenUrl: null,
      categoria: 'Salud Pública',
      publicado: true,
      publicadoEn: new Date('2026-03-20'),
    },
    {
      titulo: 'Nuevo sistema de gestión de turnos reduce tiempos de espera en 40%',
      slug: 'nuevo-sistema-turnos-reduce-espera-2026',
      extracto: 'La modernización tecnológica del HPVC incorpora un sistema digital de gestión de turnos que agiliza la atención a los pacientes.',
      contenido: '<p>El Hospital Provincial Verdi Cevallos ha implementado un nuevo sistema de gestión digital de turnos médicos, logrando reducir los tiempos de espera en un 40% en las primeras semanas de funcionamiento.</p><p>El sistema permite que los pacientes agenden sus citas de manera anticipada a través del portal web institucional, reciban confirmaciones por correo electrónico y consulten el estado de su turno en tiempo real.</p>',
      imagenUrl: null,
      categoria: 'Tecnología',
      publicado: true,
      publicadoEn: new Date('2026-03-25'),
    },
  ];

  for (const n of noticias) {
    await prisma.noticia.upsert({
      where: { slug: n.slug },
      update: {},
      create: n,
    });
  }
  console.log(`✅ ${noticias.length} noticias de muestra creadas.`);

  console.log('\n🎉 Seed completado exitosamente.');
  console.log(`   👤 SUPERADMIN: ${ADMIN_EMAIL} | ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
