#!/bin/bash
# Script de restauración para la base de datos PostgreSQL de HPVC
echo "🔄 Restaurando la base de datos HPVC..."

# Archivo por defecto para restaurar
BACKUP_FILE="backups/backup_latest.sql"

# Verificar si se pasó un archivo específico como argumento
if [ ! -z "$1" ]; then
    BACKUP_FILE="$1"
fi

# Verificar si el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: No se encontró el archivo de copia de seguridad en '$BACKUP_FILE'."
    echo "   Asegúrate de haber corrido './backup-db.sh' previamente."
    exit 1
fi

echo "   Restaurando desde: $BACKUP_FILE..."

# Ejecutar la restauración en el contenedor Docker
# Primero recreamos la base de datos limpia para evitar conflictos de claves duplicadas
docker exec -i hpvc_postgres psql -U hpvc_user -d postgres -c "DROP DATABASE IF EXISTS hpvc_db;"
docker exec -i hpvc_postgres psql -U hpvc_user -d postgres -c "CREATE DATABASE hpvc_db;"

# Cargar el dump SQL
docker exec -i hpvc_postgres psql -U hpvc_user -d hpvc_db < "$BACKUP_FILE"

echo "✅ ¡Base de datos restaurada con éxito desde '$BACKUP_FILE'!"
