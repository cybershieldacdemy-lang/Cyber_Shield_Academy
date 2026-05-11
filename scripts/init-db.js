const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
  const termsPath = path.join(__dirname, '../src/data/terms-data.ts');
  const termsFile = fs.readFileSync(termsPath, 'utf-8');

  // Find start of array
  const startMarker = 'export const terms';
  const startIndex = termsFile.indexOf(startMarker);

  if (startIndex !== -1) {
    const arrayStartIndex = termsFile.indexOf('[', startIndex);
    const arrayEndIndex = termsFile.lastIndexOf(']');

    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
      const arrayContent = termsFile.substring(arrayStartIndex, arrayEndIndex + 1);

      console.log(`Extracted array content length: ${arrayContent.length}`);

      const sandbox = {};
      const script = new vm.Script(`const terms = ${arrayContent};`);
      const context = new vm.createContext(sandbox);
      script.runInContext(context);

      const terms = sandbox.terms;
      console.log(`Found ${terms.length} terms to seed.`);

      const insert = db.prepare(`
        INSERT OR REPLACE INTO terms (id, term_en, term_ar, definition_ar, definition_en, example, level, category_id)
        VALUES (@id, @termEn, @termAr, @definitionAr, @definitionEn, @example, @level, @categoryId)
      `);

      const insertMany = db.transaction((terms) => {
        for (const term of terms) insert.run(term);
      });

      insertMany(terms);
      console.log(`Successfully seeded ${terms.length} terms.`);
    } else {
      console.error('Could not find array brackets [...] in terms-data.ts');
    }
  } else {
    console.error('Could not find "export const terms" in terms-data.ts');
  }
} catch (err) {
  console.error('Seeding error:', err);
}

db.close();
