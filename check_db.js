const Database = require('better-sqlite3');
const db = new Database('d:/new/cyber-chell/out/database.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

try {
    const lesson = db.prepare('SELECT * FROM course_lessons WHERE id = 1341').get();
    console.log('Lesson:', lesson);
} catch (e) {
    console.error('Error fetching lesson:', e.message);
}
