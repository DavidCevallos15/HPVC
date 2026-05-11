const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authSchemas } = require('../validators/schemas');
const { validate } = require('../middlewares/validate');
const prisma = new PrismaClient();

const login = [
  validate(authSchemas.login),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Buscar usuario sin incluir el hash de contraseña en la respuesta
      const usuario = await prisma.usuario.findUnique({ 
        where: { email },
        select: {
          id: true,
          email: true,
          password: true, // Solo para verificación
          nombre: true,
          rol: true,
          activo: true
        }
      });
      
      if (!usuario || !usuario.activo)
        return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });

      const valid = await bcrypt.compare(password, usuario.password);
      if (!valid)
        return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { id, nombre, rol } = usuario;
      res.json({ success: true, data: { id, nombre, email: usuario.email, rol } });
    } catch (err) {
      next(err);
    }
  }
];

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
};

const me = (req, res) => {
  const { id, nombre, email, rol } = req.usuario;
  res.json({ success: true, data: { id, nombre, email, rol } });
};

module.exports = { login, logout, me };
