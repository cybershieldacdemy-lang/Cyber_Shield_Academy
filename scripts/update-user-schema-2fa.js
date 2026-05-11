const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const db = new Database(dbPath);

console.log('Adding 2FA columns to users table...');

try {
    // Add twoFactorSecret
    try {
        db.exec(`ALTER TABLE users ADD COLUMN twoFactorSecret TEXT`);
        console.log('Added twoFactorSecret column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('twoFactorSecret already exists.');
        } else {
            throw e;
        }
    }

    // Add isTwoFactorEnabled
    try {
        db.exec(`ALTER TABLE users ADD COLUMN isTwoFactorEnabled BOOLEAN DEFAULT 0`);
        console.log('Added isTwoFactorEnabled column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('isTwoFactorEnabled already exists.');
        } else {
            throw e;
        }
    }

    console.log('User schema updated successfully.');
} catch (error) {
    console.error('Error updating schema:', error);
}

db.close();
