
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  //Mantener la conexión viva en redes inestables
  keepAlive: true, 
  connectionTimeoutMillis: 5000, 
});

// Probar Conexión
pool.connect()
  .then(() => console.log('Conectado exitosamente a PostgreSQL'))
  .catch(err => console.error('Error de conexión a la DB', err.stack));

module.exports = pool;