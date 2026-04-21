# 🏥 Sistema Web - Hospital Dr. Verdi Cevallos Balda (HPVC)

Bienvenido al repositorio oficial del **Sistema Web Institucional del Hospital Dr. Verdi Cevallos Balda**. Esta plataforma integral está diseñada para digitalizar, gestionar y presentar la información hospitalaria, mejorando la comunicación tanto interna como externa, y ofreciendo una experiencia de usuario moderna, rápida y accesible.

---

## 📖 Descripción del Proyecto

El Sistema Web HPVC es una aplicación Full-Stack estructurada como un monorepositorio que consta de tres módulos principales:

1. **🏥 Cliente (Frontend Público):** Una interfaz web interactiva para pacientes y el público en general. Permite consultar información sobre especialidades médicas, noticias, accesos directos institucionales y vías de contacto del hospital, con un diseño moderno (Glassmorphism).
2. **🔐 Panel Administrativo (Frontend Privado):** Un panel de control seguro exclusivo para el personal autorizado. Facilita la gestión dinámica de contenidos: edición de noticias, carga de imágenes, integración con redes sociales (Facebook, Instagram, X) e información general en tiempo real.
3. **⚙️ Servidor (Backend API):** El núcleo de procesamiento de datos que expone una API RESTful, encargada de la lógica de negocio, integración con bases de datos y la seguridad de los endpoints para ambos frontends.

---

## ✨ Características Principales

* **🚀 Rendimiento Optimizado:** Construido con tecnologías de vanguardia (React + Vite) para asegurar tiempos de carga ultra rápidos.
* **🎨 Diseño Responsivo y "Pixel-Perfect":** Interfaz de usuario (UI) estéticamente atractiva, basada en Tailwind CSS, completamente adaptable a dispositivos móviles, tablets y ordenadores.
* **📰 Gestión de Contenidos Autónoma:** Panel administrativo robusto que permite al hospital mantener el sitio web actualizado sin necesidad de recurrir a desarrolladores para cambios de contenido.
* **📱 Social Media Ready:** Módulos especiales integrados para incrustar e importar publicaciones directamente de las redes sociales oficiales del hospital.
* **⚡ Entorno "One-Click":** Configuración avanzada mediante `concurrently` para lanzar todo el ecosistema de desarrollo (Cliente, Admin y Servidor) mediante la ejecución de un solo comando.
* **🐳 Listo para Despliegue (Docker):** Incluye archivo de configuración `docker-compose.yml` para un despliegue ágil, estandarizado y seguro.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza un conjunto moderno de herramientas de la industria:

* **Frontend:** React.js, Vite, Tailwind CSS, React Router DOM.
* **Backend:** Node.js, Express (API REST).
* **Base de Datos / Backend-as-a-Service:** Integración nativa con Supabase / PostgreSQL.
* **Control de Versiones & Gestión:** Git, GitHub, npm / concurrently.

---

## 🚀 Guía de Instalación y Uso

### Prerrequisitos

Asegúrate de tener instalados:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

### Paso a paso

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/DavidCevallos15/HPVC.git
   cd HPVC
   ```

2. **Instalar Dependencias de Raíz:**
   ```bash
   npm install
   ```
   *(Asegúrate también de ejecutar `npm install` dentro de las carpetas `/client`, `/admin` y `/server` dependiendo de cómo esté manejado tu package manager)*

3. **Ejecutar el Entorno de Desarrollo:**
   Arranca el ecosistema completo con un simple comando:
   ```bash
   npm run dev
   ```

   **Puertos por defecto:**
   - **Cliente:** `http://localhost:5173`
   - **Admin:** `http://localhost:5174`
   - **Servidor:** *Verificar logs de consola.*

### Comandos Útiles
- `npm run build` - Compila el código para producción en cliente y admin.
- `npm run start` - Inicia las versiones de producción (si están configuradas).

---

## 👨‍💻 Autor

Desarrollado y mantenido por **David Cevallos** - Estudiante de Ingeniería en Tecnologías de la Información.

---
*Hospital Dr. Verdi Cevallos Balda - Innovando por la salud.*
