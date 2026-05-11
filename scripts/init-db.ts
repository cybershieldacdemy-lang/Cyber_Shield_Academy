import Database from 'better-sqlite3';
import { terms } from '../src/data/terms-data';

const db = new Database('cyber.db');

// Create Tables
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

  CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY,
    term_en TEXT NOT NULL,
    term_ar TEXT NOT NULL,
    definition_ar TEXT NOT NULL,
    definition_en TEXT NOT NULL,
    example TEXT NOT NULL,
    level TEXT NOT NULL,
    category_id INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    level TEXT NOT NULL,
    lessons INTEGER,
    duration TEXT
  );
`);

console.log('Tables created.');

try {
  console.log(`Found ${terms.length} terms to seed.`);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO terms (id, term_en, term_ar, definition_ar, definition_en, example, level, category_id)
    VALUES (@id, @termEn, @termAr, @definitionAr, @definitionEn, @example, @level, @categoryId)
  `);

  const insertMany = db.transaction((terms: any[]) => {
    for (const term of terms) insert.run(term);
  });

  insertMany(terms);
  console.log(`Successfully seeded ${terms.length} terms.`);
} catch (err) {
  console.error('Seeding error:', err);
}

db.close();
