# Analisis del Sistema Web HPVC

Fecha de revision: 10 de julio de 2026

## Estado local actual

El sistema quedo levantado localmente con sus servicios principales:

| Servicio | URL local | Estado |
| --- | --- | --- |
| Frontend publico | http://localhost:5173 | Activo |
| Panel administrativo | http://localhost:5174 | Activo |
| API backend | http://localhost:3001/api/health | Activo |
| PostgreSQL | localhost:5432 | Activo en Docker |
| Portal consultas estatico | http://localhost:8080 | Activo |
| RecetaElectronica | http://localhost:3002 | Activo |

Credenciales locales del panel administrativo:

- Definir `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `server/.env` para el entorno local.

Estas credenciales son solo para desarrollo local. No deben publicarse valores reales ni reutilizarse en produccion.

## Trabajo realizado

- Se extrajo el repositorio `DavidCevallos15/HPVC` desde GitHub. El clonado normal con Git se quedo colgado, por lo que se uso la descarga ZIP de la rama `main`.
- Se instalaron dependencias en:
  - raiz del monorepo
  - `server`
  - `client`
  - `admin`
  - `portal-consultas`
  - `portal-consultas/RecetaElectronica`
- Se creo configuracion local en `.env` para backend, frontend, admin y RecetaElectronica.
- Se levanto PostgreSQL con Docker.
- Se aplicaron migraciones de base de datos desde los SQL de Prisma.
- Se cargo el seed inicial del sistema.
- Se inicializo busqueda vectorial con fallback `float8[]`, porque la imagen PostgreSQL usada no trae `pgvector`.
- Se indexaron 61 documentos clinicos PDF en la base.
- Se corrigio el arranque cuando no existe `GROQ_API_KEY`, dejando modo local para la consulta documental.
- Se verificaron builds de `client` y `admin`.
- Se levantaron los servicios en segundo plano y se probaron endpoints principales.

## Datos cargados

Conteo actual en la base local:

| Entidad | Cantidad |
| --- | ---: |
| Usuarios | 1 |
| Noticias | 3 |
| Especialidades | 12 |
| Medicos | 5 |
| Configuraciones | 5 |
| Documentos academicos | 61 |
| Fragmentos indexados | 14.234 |

El asistente clinico funciona en modo local: recupera fragmentos relevantes desde los documentos indexados y devuelve fuentes. Para respuestas redactadas por modelo externo se debe configurar `GROQ_API_KEY` en `server/.env`.

## Arquitectura

El proyecto es un monorepo con tres partes principales y un portal adicional:

- `client`: frontend publico React + Vite + Tailwind. Consume la API para noticias, documentos, horarios, medicos, configuracion y contacto.
- `admin`: panel privado React + Vite. Permite gestion de noticias, configuracion, medicos, horarios, documentos y POA.
- `server`: API REST Node.js + Express + Prisma. Centraliza autenticacion, CRUD, uploads, documentos, busqueda semantica y datos publicos.
- `portal-consultas`: portal estatico y modulo `RecetaElectronica` con Express + PostgreSQL.
- `server/public/uploads`: almacenamiento local de imagenes, documentos PDF, POA y CV.
- PostgreSQL: base relacional local en Docker.

## Funcionalidades verificadas

- API de salud responde correctamente.
- Listado publico de documentos responde con datos reales.
- Preguntas sobre documentos responden en modo local con fragmentos y fuentes.
- Login del panel administrativo funciona.
- Frontend publico responde HTTP 200.
- Panel administrativo responde HTTP 200.
- Portal estatico responde HTTP 200.
- RecetaElectronica responde HTTP 200 y conecta con PostgreSQL.

## Limitaciones detectadas

- `RecetaElectronica` depende de tablas hospitalarias externas que no vienen en el repositorio. El servicio arranca, pero sus consultas reales requieren una base institucional con esquemas/datos de pacientes, recetas e inventario.
- Algunos PDF parecen escaneados o tienen texto dañado; fueron registrados como documentos, pero ciertos archivos produjeron pocos o cero fragmentos. Para mejorar esto se recomienda OCR.
- La CLI de `prisma migrate deploy` fallo con un error interno del schema engine. Se aplicaron los SQL de migracion manualmente.
- Docker Desktop se cayo durante el primer arranque de PostgreSQL, dejando una inicializacion minima. Se corrigio creando la base manualmente y ajustando `pg_hba.conf`.
- El repositorio contiene assets pesados: recorrido virtual, PDFs duplicados en `admin` y `server/public/uploads`, fuentes de mPDF y `repomix-output.xml`. Esto dificulta clonar, desplegar y mantener el proyecto.
- Hay caracteres mojibake en algunos textos/documentacion por problemas de encoding historicos.

## Riesgos tecnicos

- Seguridad: `npm audit` reporta vulnerabilidades en dependencias. Resumen de produccion:
  - Backend: 7 vulnerabilidades, 2 altas y 5 moderadas.
  - Frontend publico: 5 vulnerabilidades, 4 altas y 1 moderada.
  - Admin: 4 vulnerabilidades altas.
- `multer` 1.x esta deprecado y con advertencias de seguridad.
- `axios`, `react-router`, `dompurify`, `form-data`, `protobufjs` y dependencias de embeddings requieren actualizacion planificada.
- El almacenamiento local en `server/public/uploads` funciona para desarrollo, pero en produccion conviene moverlo a almacenamiento persistente con backup.
- El secreto JWT local es de desarrollo. Debe cambiarse antes de publicar.

## Recomendaciones prioritarias

1. Actualizar dependencias vulnerables y volver a correr `npm audit`.
2. Separar archivos pesados del repositorio principal: usar storage externo, Git LFS o una estrategia de carga por despliegue.
3. Agregar OCR para PDFs escaneados antes de indexarlos.
4. Crear un script de inicializacion local que automatice Docker, migraciones, permisos, seed e ingesta.
5. Definir `.env.example` real para todos los modulos.
6. Revisar encoding de README, comentarios y nombres de archivos para evitar caracteres corruptos.
7. Para produccion, usar PostgreSQL administrado o contenedor con volumen estable, backups y credenciales rotadas.
8. Configurar `GROQ_API_KEY` solo si se desea respuesta IA generativa; sin ella, el modo local de recuperacion documental ya queda operativo.

## Comandos utiles

Levantar PostgreSQL:

```bash
docker compose up -d
```

Levantar web publica, admin y API:

```bash
npm run dev
```

Levantar RecetaElectronica:

```bash
cd portal-consultas/RecetaElectronica
npm start
```

Levantar portal estatico:

```bash
cd portal-consultas
py -m http.server 8080
```

Verificar API:

```bash
curl http://localhost:3001/api/health
```
