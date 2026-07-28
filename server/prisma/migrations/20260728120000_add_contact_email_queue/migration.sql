-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "mensajes_contacto"
ADD COLUMN "autoRespuestaEnviada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "autoRespuestaEnviadaEn" TIMESTAMP(3),
ADD COLUMN "autoRespuestaError" TEXT;

-- CreateTable
CREATE TABLE "email_queue" (
    "id" SERIAL NOT NULL,
    "mensajeContactoId" INTEGER NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_queue_mensajeContactoId_key" ON "email_queue"("mensajeContactoId");

-- CreateIndex
CREATE INDEX "email_queue_status_availableAt_idx" ON "email_queue"("status", "availableAt");

-- CreateIndex
CREATE INDEX "email_queue_createdAt_idx" ON "email_queue"("createdAt");

-- AddForeignKey
ALTER TABLE "email_queue"
ADD CONSTRAINT "email_queue_mensajeContactoId_fkey"
FOREIGN KEY ("mensajeContactoId") REFERENCES "mensajes_contacto"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
