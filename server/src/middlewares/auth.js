const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'No autorizado: token requerido.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });

    if (!usuario || !usuario.activo)
      return res.status(401).json({ success: false, message: 'Usuario inactivo o no encontrado.' });

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes.' });
  }
  next();
};

module.exports = { verifyToken, requireRole };
