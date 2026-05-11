const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const db = new Database(dbPath);

console.log('Creating compliance_assessments table...');

try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS compliance_assessments (
        id TEXT PRIMARY KEY,
        standardId TEXT NOT NULL,
        controlId TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'NON_COMPLIANT',
        notes TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(standardId, controlId)
    )
  `);

    console.log('compliance_assessments table created successfully.');
} catch (error) {
    console.error('Error creating table:', error);
}

db.close();
