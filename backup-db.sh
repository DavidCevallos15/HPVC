#!/bin/bash
# Script de copia de seguridad para la base de datos PostgreSQL de HPVC
echo "📦 Generando copia de seguridad de la base de datos HPVC..."

# Crear carpeta de backups si no existe
mkdir -p backups

# Nombre del archivo con la fecha actual
FILENAME="backups/backup_$(date +%Y-%m-%d_%H%M%S).sql"

# Ejecutar pg_dump dentro del contenedor Docker
docker exec -t hpvc_postgres pg_dump -U hpvc_user -d hpvc_db > "$FILENAME"

# También guardar una copia fija como backup_latest.sql para restauración rápida
cp "$FILENAME" backups/backup_latest.sql

echo "✅ ¡Copia de seguridad guardada con éxito!"
echo "   ↳ Archivo fechado: $FILENAME"
echo "   ↳ Archivo de restauración rápida: backups/backup_latest.sql"
