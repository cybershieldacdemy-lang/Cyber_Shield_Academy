import Database from 'better-sqlite3';

const db = new Database('cyber.db');

try {
    db.exec('ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT "student"');
    console.log('✅ Added account_type');
} catch {
    console.log('⏭️ account_type already exists');
}

db.close();
