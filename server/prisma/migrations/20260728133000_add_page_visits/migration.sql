-- CreateTable
CREATE TABLE "visitas_paginas" (
    "id" SERIAL NOT NULL,
    "ruta" VARCHAR(180) NOT NULL,
    "titulo" VARCHAR(180),
    "visitanteId" VARCHAR(64) NOT NULL,
    "sesionId" VARCHAR(64) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitas_paginas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitas_paginas_creadoEn_idx" ON "visitas_paginas"("creadoEn");

-- CreateIndex
CREATE INDEX "visitas_paginas_ruta_creadoEn_idx" ON "visitas_paginas"("ruta", "creadoEn");

-- CreateIndex
CREATE INDEX "visitas_paginas_visitanteId_creadoEn_idx" ON "visitas_paginas"("visitanteId", "creadoEn");

-- CreateIndex
CREATE INDEX "visitas_paginas_sesionId_creadoEn_idx" ON "visitas_paginas"("sesionId", "creadoEn");
