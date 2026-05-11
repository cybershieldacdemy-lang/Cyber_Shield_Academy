const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cyber.db');
const db = new Database(dbPath);

console.log('Running Live Sessions DB Migration...');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS live_sessions (
            id TEXT PRIMARY KEY,
            teacher_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            scheduled_at DATETIME NOT NULL,
            is_active INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    `);
    console.log('✅ Ensured live_sessions table exists.');

    console.log('🎉 Live Sessions Migration successful!');
} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    db.close();
}
