const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Intentar habilitar pgvector primero
    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('pgvector enabled successfully');
      await prisma.$executeRawUnsafe('ALTER TABLE documentos_chunks ADD COLUMN IF NOT EXISTS embedding vector(384);');
      console.log('Using pgvector');
    } catch (e) {
      console.log('pgvector not available, using fallback (float8[] + custom function)');
      
      // Fallback: usar un array de doubles
      await prisma.$executeRawUnsafe('ALTER TABLE documentos_chunks ADD COLUMN IF NOT EXISTS embedding_fallback float8[];');
      
      // Crear función de similitud de coseno manual
      await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION cosine_similarity(a float8[], b float8[]) RETURNS float8 AS $$
        DECLARE
          dot_product float8 := 0;
          mag_a float8 := 0;
          mag_b float8 := 0;
        BEGIN
          IF array_length(a, 1) IS NULL OR array_length(b, 1) IS NULL OR array_length(a, 1) != array_length(b, 1) THEN
            RETURN 0;
          END IF;
          FOR i IN 1..array_length(a, 1) LOOP
            dot_product := dot_product + (a[i] * b[i]);
            mag_a := mag_a + (a[i] * a[i]);
            mag_b := mag_b + (b[i] * b[i]);
          END LOOP;
          IF mag_a = 0 OR mag_b = 0 THEN RETURN 0; END IF;
          RETURN dot_product / (sqrt(mag_a) * sqrt(mag_b));
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('Cosine similarity function created');
    }
  } catch (error) {
    console.error('Error in init-vector-db:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
