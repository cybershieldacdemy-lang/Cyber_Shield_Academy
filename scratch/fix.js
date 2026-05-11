const fs = require('fs');
const filePath = 'src/app/(public)/ctf/page.tsx';
let c = fs.readFileSync(filePath, 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(filePath, c);
console.log('Fixed syntax errors');
