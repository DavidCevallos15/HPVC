require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor HPVC escuchando en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV}`);
});
