import Database from 'better-sqlite3';

const db = new Database('cyber.db');

const columns = [
    'phone TEXT DEFAULT ""',
    'country TEXT DEFAULT ""',
    'bio TEXT DEFAULT ""',
    'experience_level TEXT DEFAULT "beginner"',
    'security_question TEXT DEFAULT ""',
    'security_answer TEXT DEFAULT ""',
    'email_verified INTEGER DEFAULT 0',
    'verification_code TEXT DEFAULT ""',
];

for (const col of columns) {
    try {
        db.exec(`ALTER TABLE users ADD COLUMN ${col}`);
        console.log('✅ Added:', col.split(' ')[0]);
    } catch {
        console.log('⏭️ Exists:', col.split(' ')[0]);
    }
}

console.log('\n🎉 Migration complete!');
db.close();
