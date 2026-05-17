-- AlterTable
ALTER TABLE "documentos_academicos" ADD COLUMN     "archivoUrl" TEXT,
ALTER COLUMN "driveUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "guardias_matriz" (
    "id" SERIAL NOT NULL,
    "mes" TEXT NOT NULL,
    "tipoContrato" TEXT,
    "nombreMedico" TEXT NOT NULL,
    "area" TEXT,
    "telefono" TEXT,
    "d01" VARCHAR(100),
    "d02" VARCHAR(100),
    "d03" VARCHAR(100),
    "d04" VARCHAR(100),
    "d05" VARCHAR(100),
    "d06" VARCHAR(100),
    "d07" VARCHAR(100),
    "d08" VARCHAR(100),
    "d09" VARCHAR(100),
    "d10" VARCHAR(100),
    "d11" VARCHAR(100),
    "d12" VARCHAR(100),
    "d13" VARCHAR(100),
    "d14" VARCHAR(100),
    "d15" VARCHAR(100),
    "d16" VARCHAR(100),
    "d17" VARCHAR(100),
    "d18" VARCHAR(100),
    "d19" VARCHAR(100),
    "d20" VARCHAR(100),
    "d21" VARCHAR(100),
    "d22" VARCHAR(100),
    "d23" VARCHAR(100),
    "d24" VARCHAR(100),
    "d25" VARCHAR(100),
    "d26" VARCHAR(100),
    "d27" VARCHAR(100),
    "d28" VARCHAR(100),
    "d29" VARCHAR(100),
    "d30" VARCHAR(100),
    "d31" VARCHAR(100),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardias_matriz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_chunks" (
    "id" SERIAL NOT NULL,
    "documentoId" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "pagina" INTEGER,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "documentos_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guardias_matriz_mes_idx" ON "guardias_matriz"("mes");

-- CreateIndex
CREATE INDEX "guardias_matriz_nombreMedico_idx" ON "guardias_matriz"("nombreMedico");

-- CreateIndex
CREATE INDEX "documentos_chunks_documentoId_idx" ON "documentos_chunks"("documentoId");

-- AddForeignKey
ALTER TABLE "documentos_chunks" ADD CONSTRAINT "documentos_chunks_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos_academicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
