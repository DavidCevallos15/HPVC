require('dotenv').config();
const app = require('./src/app');
const { startEmailQueueWorker, stopEmailQueueWorker } = require('./src/services/emailQueue.service');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Servidor HPVC escuchando en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV}`);
  startEmailQueueWorker();
});

const shutdown = async (signal) => {
  console.log(`${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await stopEmailQueueWorker();
    process.exit(0);
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
