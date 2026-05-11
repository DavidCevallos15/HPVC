const { ZodError } = require('zod');

/**
 * Middleware de validación usando Zod
 * @param {Object} schema - Esquema de validación de Zod
 * @param {string} source - 'body', 'query', o 'params' (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Reemplazar los datos originales con los datos validados y limpios
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: errorMessages,
        });
      }
      
      next(error);
    }
  };
};

module.exports = { validate };
