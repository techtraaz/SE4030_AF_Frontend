
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('title', 'test');
  form.append('description', 'test');
  form.append('category', 'General');
  form.append('contentType', 'image');
  
  // Send 2 files
  fs.writeFileSync('test1.txt', '1');
  fs.writeFileSync('test2.txt', '2');
  
  form.append('file', fs.createReadStream('test1.txt'));
  form.append('file', fs.createReadStream('test2.txt'));
  
  try {
    const res = await axios.post('http://localhost:5000/api/digital-library/upload', form, {
      headers: form.getHeaders(),
    });
    console.log('Success:', res.status, res.data);
  } catch (err) {
    console.log('Error 1 (file):', err.response ? err.response.data : err.message);
  }

  const form2 = new FormData();
  form2.append('title', 'test');
  form2.append('description', 'test');
  form2.append('category', 'General');
  form2.append('contentType', 'image');
  form2.append('files', fs.createReadStream('test1.txt'));
  form2.append('files', fs.createReadStream('test2.txt'));
  
  try {
    const res2 = await axios.post('http://localhost:5000/api/digital-library/upload', form2, {
      headers: form2.getHeaders(),
    });
    console.log('Success 2 (files):', res2.status, res2.data);
  } catch (err) {
    console.log('Error 2 (files):', err.response ? err.response.data : err.message);
  }
}
test();
