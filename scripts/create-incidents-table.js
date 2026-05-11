const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

try {
    console.log('Creating incidents table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            severity TEXT NOT NULL,
            status TEXT DEFAULT 'OPEN',
            type TEXT NOT NULL,
            actionsTaken TEXT,
            reportedBy TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Incidents table created successfully.');
} catch (error) {
    console.error('Error creating table:', error);
}
