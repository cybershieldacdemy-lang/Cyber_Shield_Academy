const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/video?path=' + encodeURIComponent('15كتاب حول الهكر الاخلاقي/001.pdf'),
  method: 'GET',
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', chunk => {
    body += chunk.toString();
  });
  res.on('end', () => {
    console.log(`BODY: ${body.substring(0, 100)}...`);
  })
});

req.on('error', error => {
  console.error(error);
});

req.end();
