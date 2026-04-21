-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'EDITOR_NOTICIAS', 'EDITOR_HORARIOS', 'EDITOR_SERVICIOS');

-- CreateEnum
CREATE TYPE "EstadoHorario" AS ENUM ('DISPONIBLE', 'VACACIONES', 'SIN_ATENCION');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'EDITOR_NOTICIAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noticias" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extracto" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "categoria" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "publicadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "descripcion" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "especialidadId" INTEGER NOT NULL,
    "foto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_medicos" (
    "id" SERIAL NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "mes" TEXT NOT NULL,
    "lunes" TEXT,
    "martes" TEXT,
    "miercoles" TEXT,
    "jueves" TEXT,
    "viernes" TEXT,
    "estado" "EstadoHorario" NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "horarios_medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_academicos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "driveUrl" TEXT NOT NULL,
    "publicadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes_contacto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "noticias_slug_key" ON "noticias"("slug");

-- CreateIndex
CREATE INDEX "noticias_categoria_idx" ON "noticias"("categoria");

-- CreateIndex
CREATE INDEX "noticias_publicado_idx" ON "noticias"("publicado");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "especialidades"("nombre");

-- CreateIndex
CREATE INDEX "medicos_especialidadId_idx" ON "medicos"("especialidadId");

-- CreateIndex
CREATE INDEX "horarios_medicos_mes_idx" ON "horarios_medicos"("mes");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_medicos_medicoId_mes_key" ON "horarios_medicos"("medicoId", "mes");

-- CreateIndex
CREATE INDEX "documentos_academicos_tipo_idx" ON "documentos_academicos"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- CreateIndex
CREATE INDEX "mensajes_contacto_leido_idx" ON "mensajes_contacto"("leido");

-- CreateIndex
CREATE INDEX "mensajes_contacto_creadoEn_idx" ON "mensajes_contacto"("creadoEn");

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_medicos" ADD CONSTRAINT "horarios_medicos_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
