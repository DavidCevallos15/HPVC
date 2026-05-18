const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const jwt = require('jsonwebtoken');

// Let's create a valid token to bypass auth
// Wait, I need the JWT_SECRET from .env!
require('dotenv').config({ path: './.env' });
const token = jwt.sign({ id: 1, rol: 'SUPERADMIN' }, process.env.JWT_SECRET || 'hpvc_secret_key_2026', { expiresIn: '1h' });

async function test() {
  const form = new FormData();
  form.append('titulo', 'Test ZIP');
  form.append('tipo', 'guia');
  
  // Create a dummy zip file
  const { execSync } = require('child_process');
  execSync('echo "dummy" > test1.pdf');
  execSync('zip test.zip test1.pdf');
  
  form.append('archivo', fs.createReadStream('test.zip'));
  
  try {
    const res = await axios.post('http://localhost:3001/api/admin/documentos', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log("SUCCESS:");
    console.log(res.data);
  } catch (e) {
    console.log("ERROR:");
    console.log(e.response ? e.response.status : e.message);
    console.log(e.response ? e.response.data : '');
  }
}
test();
