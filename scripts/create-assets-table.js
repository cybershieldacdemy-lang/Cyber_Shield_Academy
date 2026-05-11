const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

try {
    console.log('Creating assets table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            assetType TEXT NOT NULL,
            classification TEXT NOT NULL,
            owner TEXT NOT NULL,
            location TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Assets table created successfully.');
} catch (error) {
    console.error('Error creating table:', error);
}
