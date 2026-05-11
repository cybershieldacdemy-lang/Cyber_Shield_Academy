const fs = require('fs');
const files = [
    'src/app/api/documents/[id]/route.ts',
    'src/app/api/documents/route.ts',
    'src/app/api/documents/templates/route.ts'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/import { db } from '@\/lib\/db';/g, "import db from '@/lib/db';");
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
});
