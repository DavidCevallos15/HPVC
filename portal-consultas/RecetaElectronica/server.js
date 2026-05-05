const express = require('express');
//const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const recetaRoutes = require('./src/routes/recetaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//SEGURIDAD
// Oculta y protege cabeceras HTTP
app.use(helmet({
  contentSecurityPolicy: false, 
}));

//Cors
//const corsOptions = {
  // Solo permite peticiones desde frontend
//  origin: '*', //  CAMBIAR POR DOMINIO 
//  optionsSuccessStatus: 200
//};
//app.use(cors(corsOptions));

//Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 peticiones por IP cada 15 min (como se solicitó)
  message: { error: "Demasiadas peticiones, por favor intenta de nuevo en 15 minutos." },
  standardHeaders: true, // Devuelve info del límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras `X-RateLimit-*`
});

// Aplicamos limitador a TODAS las rutas que empiecen con /api
app.use('/api', limiter);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public'))); //frontend

// Rutas
app.use('/api', recetaRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en Puerto ${PORT}`);
});