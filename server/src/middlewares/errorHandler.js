const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);
  
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor.';

  // Manejo de errores específicos de Multer (límites de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'El archivo es demasiado grande. El límite permitido es de 300 MB.';
  }

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
