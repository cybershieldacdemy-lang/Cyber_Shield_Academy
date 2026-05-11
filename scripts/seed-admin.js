const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'cyber.db'));

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create users table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const email = 'admin@cyber-shield.com';
const password = 'Admin@123';
const name = 'المسؤول';

// Check if admin already exists
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

if (existing) {
    console.log('⚠️ Admin user already exists:', email);
} else {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = require('crypto').randomUUID();

    db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
        id, name, email, hash, 'admin'
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role: admin');
}

db.close();
