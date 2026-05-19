#!/bin/bash
# Script de preparación automatizada para la Máquina Virtual de HPVC (Ubuntu/Debian)
# Autor: Antigravity AI
set -e

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${BLUE}🖥️  Iniciando preparación de la Máquina Virtual para HPVC...${NC}"

# 1. Actualizar el sistema
echo -e "${BLUE}🔄 Actualizando repositorios del sistema...${NC}"
sudo apt update

# 2. Instalar utilidades básicas
echo -e "${BLUE}🛠️  Instalando herramientas del sistema (curl, git, build-essential)...${NC}"
sudo apt install -y curl git build-essential

# 3. Instalar Docker de forma oficial
if ! command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 Instalando Docker de forma oficial...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker instalado correctamente.${NC}"
else
    echo -e "${GREEN}🐳 Docker ya está instalado en el sistema: $(docker --version)${NC}"
fi

# 4. Configurar grupo Docker para el usuario actual (evitar sudo en comandos docker)
echo -e "${BLUE}👥 Configurando permisos de Docker para el usuario actual ($USER)...${NC}"
if ! groups $USER | grep -q '\bdocker\b'; then
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Usuario agregado al grupo 'docker'.${NC}"
else
    echo -e "${GREEN}✅ El usuario ya pertenece al grupo 'docker'.${NC}"
fi

# 5. Asegurar e iniciar el servicio de Docker
echo -e "${BLUE}🚀 Iniciando y habilitando el servicio de Docker...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# 6. Instalar Node.js LTS (Versión 20)
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}🟢 Instalando Node.js v20 (LTS)...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js $(node -v) y npm $(npm -v) instalados correctamente.${NC}"
else
    echo -e "${GREEN}🟢 Node.js ya está instalado: $(node -v)${NC}"
fi

# 7. Instalar dependencias del proyecto en cascada
echo -e "${BLUE}📦 Instalando dependencias de Node.js en todos los módulos...${NC}"

echo -e "${YELLOW}📂 Instalando dependencias en la Raíz del Proyecto...${NC}"
npm install

echo -e "${YELLOW}📂 Instalando dependencias en el Servidor (Server)...${NC}"
cd server && npm install && cd ..

echo -e "${YELLOW}📂 Instalando dependencias en el Cliente (Client)...${NC}"
cd client && npm install && cd ..

echo -e "${YELLOW}📂 Instalando dependencias en el Administrador (Admin)...${NC}"
cd admin && npm install && cd ..

echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}🎉 ¡Felicidades! La Máquina Virtual está lista para HPVC.${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${YELLOW}⚠️  PASO IMPORTANTE EXTRA:${NC}"
echo -e "Para aplicar los permisos de Docker sin reiniciar la máquina virtual, ejecuta:"
echo -e "${BLUE}newgrp docker${NC}"
echo -e ""
echo -e "Una vez hecho esto, ya puedes levantar la base de datos e iniciar la web con:"
echo -e "${BLUE}docker compose up -d && ./restore-db.sh && npm run dev${NC}"
echo -e "${GREEN}================================================================${NC}"
