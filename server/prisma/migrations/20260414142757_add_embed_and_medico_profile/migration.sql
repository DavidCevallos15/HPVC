-- AlterTable
ALTER TABLE "medicos" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "telefono" TEXT;

-- AlterTable
ALTER TABLE "noticias" ADD COLUMN     "embedUrl" TEXT;
