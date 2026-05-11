# 🏥 Sistema Web - Hospital Dr. Verdi Cevallos Balda (HPVC)

![Estado: En Desarrollo](https://img.shields.io/badge/Estado-En%20Desarrollo-success?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Bienvenido al repositorio oficial del **Sistema Web Institucional del Hospital Regional Dr. Verdi Cevallos Balda**. Esta plataforma integral está diseñada para digitalizar, gestionar y presentar la información hospitalaria, mejorando la comunicación tanto interna como externa, y ofreciendo una experiencia de usuario moderna, rápida y accesible.

---

## 📖 Descripción del Proyecto

El Sistema Web HPVC es una aplicación Full-Stack estructurada como un monorepositorio que consta de tres módulos principales:

1. **🏥 Cliente (Frontend Público):** Una interfaz web interactiva para pacientes y el público en general. Permite consultar información sobre especialidades médicas, noticias, accesos directos institucionales y vías de contacto del hospital, con un diseño moderno (Glassmorphism).
2. **🔐 Panel Administrativo (Frontend Privado):** Un panel de control seguro exclusivo para el personal autorizado. Facilita la gestión dinámica de contenidos: edición de noticias, carga de imágenes, integración con redes sociales e información general en tiempo real.
3. **⚙️ Servidor (Backend API):** El núcleo de procesamiento de datos que expone una API RESTful propia (Node.js/Express), encargada de la lógica de negocio, integración con la base de datos y la seguridad de los endpoints para ambos frontends.

---

## ✨ Características Principales

* **🚀 Rendimiento Optimizado:** Construido con tecnologías de vanguardia (React + Vite) para asegurar tiempos de carga ultrarrápidos.
* **🎨 Diseño Responsivo y "Pixel-Perfect":** Interfaz de usuario (UI) estéticamente atractiva, basada en Tailwind CSS, completamente adaptable a dispositivos móviles, tablets y ordenadores.
* **📰 Gestión de Contenidos Autónoma:** Panel administrativo robusto que permite al hospital mantener el sitio web actualizado sin necesidad de recurrir a desarrolladores para cambios de contenido.
* **⚡ Entorno "One-Click":** Configuración avanzada mediante `concurrently` para lanzar todo el ecosistema de desarrollo (Cliente, Admin y Servidor) ejecutando un solo comando.
* **🐳 Listo para Despliegue (Docker):** Incluye archivo de configuración `docker-compose.yml` optimizado para un despliegue ágil, independiente y seguro.

---

## 🛠️ Stack Tecnológico

La arquitectura del proyecto está diseñada para ser escalable, mantenible y libre de dependencias innecesarias de terceros:

* **Frontend Público & Admin:** React.js, Vite, Tailwind CSS, React Router DOM.
* **Backend:** Node.js, Express (API REST).
* **Base de Datos & ORM:** PostgreSQL gestionado a través de Prisma ORM.
* **Infraestructura:** Docker y Docker Compose.
* **Control de Versiones & Orquestación:** Git, GitHub, npm, concurrently.

---

## 🚀 Guía de Instalación y Uso

### Prerrequisitos

Asegúrate de tener instalados:
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Docker Desktop](https://www.docker.com/) o Docker Engine
- [Git](https://git-scm.com/)

### 1. Clonar el Repositorio
```bash
git clone [https://github.com/DavidCevallos15/HPVC.git](https://github.com/DavidCevallos15/HPVC.git)
cd HPVC
```

### 2. Instalar Dependencias
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
cd admin && npm install && cd ..
```

### 3. Configurar Variables de Entorno
Ver la sección **Variables de Entorno** más abajo.

### 4. Ejecutar el Entorno de Desarrollo
```bash
npm run dev
```

**Puertos por defecto:**
- **Cliente:** `http://localhost:5173`
- **Admin:** `http://localhost:5174`
- **Servidor:** `http://localhost:3001`

---

## 🛡️ Seguridad y Protección de Datos

El sistema HPVC implementa un enfoque de seguridad multicapa siguiendo las mejores prácticas de la industria DevSecOps:

### 🔐 **Autenticación y Autorización**
- **Contraseñas Hasheadas:** Todas las contraseñas se almacenan utilizando **bcryptjs** con salt rounds configurados para máxima seguridad.
- **JWT con HTTP-only Cookies:** Los tokens de autenticación se gestionan mediante cookies HTTP-only, preveniendo ataques XSS y evitando el almacenamiento en localStorage.
- **Middleware de Autenticación:** Sistema de verificación de tokens robusto con validación de estado del usuario y roles.
- **Control de Acceso Basado en Roles (RBAC):** Implementación de roles granulares (SUPERADMIN, EDITOR_NOTICIAS, EDITOR_HORARIOS, EDITOR_SERVICIOS).

### 🛡️ **Hardening del Servidor**
- **Helmet:** Configuración completa de cabeceras HTTP seguras con Content Security Policy (CSP) personalizado.
- **CORS Estricto:** Política de origen cruzado restringida a dominios autorizados en desarrollo y producción.
- **Rate Limiting:** Límites de solicitud globales y específicos por endpoint para prevenir ataques de fuerza bruta y DDoS.
- **Seguridad de Cookies:** Configuración `secure`, `httpOnly` y `sameSite: strict` en producción.

### ✅ **Validación y Sanitización de Datos**
- **Zod Integration:** Validación estricta de todos los inputs de usuario mediante esquemas tipados.
- **Prevención de Data Leaks:** Consultas Prisma optimizadas con `select` para evitar exposición de datos sensibles.
- **Sanitización Automática:** Limpieza y validación de datos en todos los formularios y endpoints.
- **Longitud Máxima Validada:** Límites estrictos en todos los campos para prevenir ataques de buffer overflow.

### 🔒 **Manejo de Secretos y Configuración**
- **Variables de Entorno:** Todas las credenciales sensibles gestionadas mediante `.env` debidamente protegido.
- **.gitignore Auditable:** Configuración completa para evitar commits accidentales de archivos sensibles.
- **JWT_SECRET Seguro:** Clave de firma de tokens con configuración de expiración optimizada.

### 🚨 **Protección Contra Ataques Comunes**
- **XSS Prevention:** HTTP-only cookies y CSP configurada.
- **CSRF Protection:** SameSite cookies y validación de origen.
- **SQL Injection Prevention:** Prisma ORM con consultas parametrizadas.
- **Brute Force Protection:** Rate limiting específico en endpoints críticos como `/login`.

---

## Variables de Entorno

Crear los siguientes archivos de configuración:

### server/.env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hpvc"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### client/.env
```env
VITE_API_URL="http://localhost:3001"
VITE_APP_NAME="HPVC - Hospital Dr. Verdi Cevallos Balda"
```

### admin/.env
```env
VITE_API_URL="http://localhost:3001"
VITE_APP_NAME="HPVC Admin Panel"
```

---

## Docker

### Levantar servicios
```bash
docker compose up -d
```

### Detener servicios
```bash
docker compose down
```

### Reconstruir y levantar
```bash
docker compose up -d --build
```

---

## Prisma

### Migraciones
```bash
cd server && npx prisma migrate dev
```

### Generar cliente Prisma
```bash
cd server && npx prisma generate
```

### Abrir Prisma Studio
```bash
cd server && npx prisma studio
```

### Resetear base de datos
```bash
cd server && npx prisma migrate reset
```

---

## Estado Actual del Proyecto

El proyecto presenta una arquitectura enterprise-lite con las siguientes características implementadas:

✅ **Monorepo** - Estructura organizada en un solo repositorio  
✅ **Cliente/Admin separados** - Frontends independientes para diferentes audiencias  
✅ **API REST** - Backend robusto con endpoints bien definidos  
✅ **PostgreSQL** - Base de datos relacional potente y escalable  
✅ **Prisma** - ORM moderno para gestión de base de datos  
✅ **Docker** - Contenerización para despliegue consistente  
✅ **Seguridad Enterprise** - Autenticación JWT, validación Zod, Helmet, CORS, Rate Limiting  
✅ **Concurrent Dev Orchestration** - Desarrollo simultáneo de todos los módulos  
✅ **Vite** - Build tool ultra-rápido para desarrollo  
✅ **Tailwind** - Framework CSS para diseño moderno  
✅ **Build Production-Ready** - Configuración optimizada para producción  

---

## 👨‍💻 Autor

Desarrollado y mantenido por **David Cevallos** - Estudiante de Ingeniería en Tecnologías de la Información.

---
*Hospital Dr. Verdi Cevallos Balda - Innovando por la salud.*