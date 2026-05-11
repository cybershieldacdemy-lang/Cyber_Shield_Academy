const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const db = new Database(dbPath);

console.log('Creating firewall_rules table...');

try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS firewall_rules (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL,
        action TEXT NOT NULL DEFAULT 'BLOCK', -- 'BLOCK' or 'ALLOW'
        reason TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ip)
    )
  `);

    console.log('firewall_rules table created successfully.');
} catch (error) {
    console.error('Error creating table:', error);
}

db.close();
