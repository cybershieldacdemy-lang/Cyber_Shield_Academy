const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database('cyber.db');
const termsPath = path.join(__dirname, '../src/data/terms-data.ts');

try {
    console.log('Reading terms-data.ts...');
    const fileContent = fs.readFileSync(termsPath, 'utf-8');
    const lines = fileContent.split('\n');

    const terms = [];
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Check if line looks like an object
        if (line.startsWith('{') && (line.endsWith('},') || line.endsWith('}'))) {
            try {
                // Remove trailing comma
                if (line.endsWith(',')) {
                    line = line.slice(0, -1);
                }

                // Eval the line safely
                const term = eval('(' + line + ')');
                terms.push(term);
            } catch (err) {
                console.error(`Error parsing line ${i + 1}:`, err.message);
                console.error('Line content:', line.substring(0, 100) + '...');
                skipped++;
            }
        }
    }

    console.log(`Parsed ${terms.length} terms. Skipped ${skipped} lines.`);

    const insert = db.prepare(`
    INSERT OR REPLACE INTO terms (id, term_en, term_ar, definition_en, definition_ar, example, level, category_id)
    VALUES (@id, @termEn, @termAr, @definitionEn, @definitionAr, @example, @level, @categoryId)
  `);

    const insertMany = db.transaction((terms) => {
        let count = 0;
        for (const term of terms) {
            try {
                insert.run(term);
                count++;
            } catch (dbErr) {
                console.error(`DB Insert Error for ID ${term.id}:`, dbErr.message);
            }
        }
        return count;
    });

    const count = insertMany(terms);
    console.log(`Successfully seeded ${count} terms.`);

} catch (error) {
    console.error('Global script error:', error);
} finally {
    db.close();
}
