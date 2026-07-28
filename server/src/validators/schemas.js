const { z } = require('zod');

// Esquemas de validación con Zod
const authSchemas = {
  login: z.object({
    email: z.string().email('Email inválido').max(255),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  }),
};

const noticiasSchemas = {
  create: z.object({
    titulo: z.string().max(200, 'El título no puede exceder 200 caracteres').optional().nullable().or(z.literal('')),
    extracto: z.string().max(200, 'El extracto no puede exceder 200 caracteres').optional(),
    contenido: z.string().max(50000, 'El contenido es demasiado largo').optional(),
    categoria: z.string().min(1, 'La categoría es requerida').max(50),
    // embedUrl acepta tanto URL directa como código HTML de iframe completo (Facebook, Instagram, X)
    embedUrl: z.string().max(50000, 'El embed es demasiado largo').optional().nullable().or(z.literal('')),
    publicado: z.coerce.boolean().optional(),
  }),
  
  update: z.object({
    titulo: z.string().max(200, 'El título no puede exceder 200 caracteres').optional().nullable().or(z.literal('')),
    extracto: z.string().max(200, 'El extracto no puede exceder 200 caracteres').optional(),
    contenido: z.string().max(50000, 'El contenido es demasiado largo').optional(),
    categoria: z.string().min(1, 'La categoría es requerida').max(50).optional(),
    // embedUrl acepta tanto URL directa como código HTML de iframe completo (Facebook, Instagram, X)
    embedUrl: z.string().max(50000, 'El embed es demasiado largo').optional().nullable().or(z.literal('')),
    publicado: z.coerce.boolean().optional(),
  }),
};

const contactoSchemas = {
  enviar: z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z.string().email('Email inválido').max(255),
    telefono: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
    asunto: z.string().min(1, 'El asunto es requerido').max(200, 'El asunto no puede exceder 200 caracteres'),
    mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000, 'El mensaje no puede exceder 2000 caracteres'),
  }),
};

const analyticsSchemas = {
  visita: z.object({
    ruta: z.string()
      .min(1, 'La ruta es requerida')
      .max(180, 'La ruta no puede exceder 180 caracteres')
      .regex(/^\/[^\s]*$/, 'La ruta no es válida'),
    titulo: z.string().max(180, 'El título no puede exceder 180 caracteres').optional().nullable(),
    visitanteId: z.string().uuid('Identificador de visitante inválido'),
    sesionId: z.string().uuid('Identificador de sesión inválido'),
  }),
};

const medicosSchemas = {
  create: z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(150),
    especialidadId: z.number().int().positive('ID de especialidad inválido'),
    foto: z.string().url('URL de foto inválida').optional().nullable(),
    cvUrl: z.string().url('URL del CV inválida').optional().nullable(),
    bio: z.string().max(2000, 'La biografía no puede exceder 2000 caracteres').optional(),
    telefono: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
    email: z.string().email('Email inválido').max(255).optional(),
    activo: z.coerce.boolean().optional(),
  }),
  
  update: z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(150).optional(),
    especialidadId: z.number().int().positive('ID de especialidad inválido').optional(),
    foto: z.string().url('URL de foto inválida').optional().nullable(),
    cvUrl: z.string().url('URL del CV inválida').optional().nullable(),
    bio: z.string().max(2000, 'La biografía no puede exceder 2000 caracteres').optional(),
    telefono: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
    email: z.string().email('Email inválido').max(255).optional(),
    activo: z.coerce.boolean().optional(),
  }),
};

const especialidadesSchemas = {
  create: z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    icono: z.string().min(1, 'El icono es requerido').max(50),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    disponible: z.coerce.boolean().optional(),
    orden: z.number().int().min(0, 'El orden debe ser un número positivo').optional(),
  }),
  
  update: z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100).optional(),
    icono: z.string().min(1, 'El icono es requerido').max(50).optional(),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    disponible: z.coerce.boolean().optional(),
    orden: z.number().int().min(0, 'El orden debe ser un número positivo').optional(),
  }),
};

const usuariosSchemas = {
  create: z.object({
    email: z.string().email('Email inválido').max(255),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100),
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    rol: z.enum(['SUPERADMIN', 'EDITOR_NOTICIAS', 'EDITOR_HORARIOS', 'EDITOR_SERVICIOS']),
    activo: z.coerce.boolean().optional(),
  }),
  
  update: z.object({
    email: z.string().email('Email inválido').max(255).optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100).optional(),
    nombre: z.string().min(1, 'El nombre es requerido').max(100).optional(),
    rol: z.enum(['SUPERADMIN', 'EDITOR_NOTICIAS', 'EDITOR_HORARIOS', 'EDITOR_SERVICIOS']).optional(),
    activo: z.coerce.boolean().optional(),
  }),
};

module.exports = {
  authSchemas,
  noticiasSchemas,
  contactoSchemas,
  analyticsSchemas,
  medicosSchemas,
  especialidadesSchemas,
  usuariosSchemas,
};
