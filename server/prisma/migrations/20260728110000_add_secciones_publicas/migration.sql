CREATE TABLE "secciones_publicas" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rutaBase" TEXT NOT NULL,
    "habilitada" BOOLEAN NOT NULL DEFAULT true,
    "protegida" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secciones_publicas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "secciones_publicas_cambios" (
    "id" SERIAL NOT NULL,
    "seccionId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "valorAnterior" BOOLEAN NOT NULL,
    "valorNuevo" BOOLEAN NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secciones_publicas_cambios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "secciones_publicas_clave_key" ON "secciones_publicas"("clave");
CREATE INDEX "secciones_publicas_cambios_seccionId_idx" ON "secciones_publicas_cambios"("seccionId");
CREATE INDEX "secciones_publicas_cambios_creadoEn_idx" ON "secciones_publicas_cambios"("creadoEn");

ALTER TABLE "secciones_publicas_cambios"
ADD CONSTRAINT "secciones_publicas_cambios_seccionId_fkey"
FOREIGN KEY ("seccionId") REFERENCES "secciones_publicas"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "secciones_publicas"
    ("clave", "nombre", "rutaBase", "habilitada", "protegida", "descripcion", "actualizadoEn", "creadoEn")
VALUES
    ('inicio', 'Inicio', '/', true, true, 'Página principal del portal institucional.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('servicios', 'Servicios', '/servicios', true, false, 'Información general de los servicios hospitalarios.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('servicios_paciente', 'Servicios al paciente', '/servicios-paciente', true, false, 'Servicios y orientación disponibles para pacientes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('especialidades', 'Especialidades médicas', '/especialidades', true, false, 'Catálogo público de especialidades.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('directorio', 'Directorio médico', '/directorio', true, false, 'Directorio público de profesionales.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('horarios', 'Horarios de atención', '/horarios', true, false, 'Horarios y matriz de guardias.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('institucion', 'Institución', '/institucion', true, false, 'Información institucional del hospital.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('acerca', 'Acerca del hospital', '/acerca', true, false, 'Reseña e información del hospital.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('recorrido_virtual', 'Recorrido virtual', '/recorrido-virtual', true, false, 'Recorrido virtual por las instalaciones.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('noticias', 'Noticias y actualidad', '/noticias', true, false, 'Noticias institucionales y sus detalles.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('documentos', 'Documentos y transparencia', '/documentos', true, false, 'Documentos académicos, POA y consultas documentales.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('asistente_clinico', 'Asistente clínico', '/asistente-clinico', true, false, 'Herramientas de consulta clínica.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('subcentros', 'GeoSalud MSP', '/subcentros', true, false, 'Acceso a información geográfica de salud.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('accesos', 'Accesos directos', '/accesos', true, false, 'Accesos a sistemas y servicios externos.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('contacto', 'Contacto', '/contacto', true, true, 'Canal oficial de contacto ciudadano.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('configuracion', 'Configuración pública', '/api/public/configuracion', true, true, 'Datos institucionales básicos utilizados por el portal.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
