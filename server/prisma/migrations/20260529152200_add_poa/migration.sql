-- CreateTable
CREATE TABLE "poas" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "poas_anio_key" ON "poas"("anio");
