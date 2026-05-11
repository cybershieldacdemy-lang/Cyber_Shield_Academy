const db = require('better-sqlite3')('prisma/data/cyber.db');
const fs = require('fs');
const path = require('path');

const courses = db.prepare('SELECT id, title_ar FROM courses').all();
const dirs = fs.readdirSync('courses').filter(f => fs.statSync(path.join('courses', f)).isDirectory());

console.log("DB Courses:");
courses.forEach(c => console.log(`${c.id}: ${c.title_ar}`));

console.log("\nDirectories:");
dirs.forEach(d => console.log(d));
