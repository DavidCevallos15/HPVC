const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: './.env' });
const token = jwt.sign({ id: 1, rol: 'SUPERADMIN' }, process.env.JWT_SECRET || 'hpvc_secret_key_2026', { expiresIn: '1h' });

async function test() {
  const form = new FormData();
  form.append('titulo', 'Link Document');
  form.append('tipo', 'guia');
  form.append('driveUrl', 'http://drive.hpvc.gob.ec/owncloud/index.php/s/JWuHuy0anmV9M93');
  
  try {
    const res = await axios.post('http://localhost:3001/api/admin/documentos', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });
    console.log("SUCCESS:", res.data);
  } catch (e) {
    console.log("ERROR MESSAGE:", e.message);
  }
}
test();
