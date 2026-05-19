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
# Primero terminamos cualquier sesión activa de otros servicios (API, Admin, etc.) para evitar el error de base de datos ocupada
echo "   Terminando conexiones activas a la base de datos para evitar bloqueos..."
docker exec -i hpvc_postgres psql -U hpvc_user -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'hpvc_db' AND pid <> pg_backend_pid();"

# Recreamos la base de datos limpia
docker exec -i hpvc_postgres psql -U hpvc_user -d postgres -c "DROP DATABASE IF EXISTS hpvc_db;"
docker exec -i hpvc_postgres psql -U hpvc_user -d postgres -c "CREATE DATABASE hpvc_db;"

# Cargar el dump SQL eliminando en caliente retornos de carro (\r) para evitar errores de psql
echo "   Importando el esquema y los datos (esta operación puede tomar unos segundos)..."
tr -d '\r' < "$BACKUP_FILE" | docker exec -i hpvc_postgres psql -U hpvc_user -d hpvc_db

echo "✅ ¡Base de datos restaurada con éxito desde '$BACKUP_FILE'!"
