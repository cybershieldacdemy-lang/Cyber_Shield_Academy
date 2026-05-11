const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const util = require('util');

const db = new Database('cyber.db');

try {
    console.log('Reading terms-data.ts...');
    const termsPath = path.join(__dirname, '../src/data/terms-data.ts');
    const fileContent = fs.readFileSync(termsPath, 'utf-8');

    // Locate the start of the array
    const startMarker = 'export const terms';
    const startIndex = fileContent.indexOf(startMarker);

    if (startIndex === -1) {
        throw new Error('Could not find "export const terms" marker');
    }

    const arrayStartIndex = fileContent.indexOf('[', startIndex);
    const arrayEndIndex = fileContent.lastIndexOf(']');

    if (arrayStartIndex === -1 || arrayEndIndex === -1) {
        throw new Error('Could not find array brackets [ ]');
    }

    const arrayString = fileContent.substring(arrayStartIndex, arrayEndIndex + 1);

    console.log(`Extracted array string length: ${arrayString.length}`);
    console.log('Start snippet:', arrayString.substring(0, 100));
    console.log('End snippet:', arrayString.substring(arrayString.length - 100));

    // Evaluate the string to get the object
    let terms;
    try {
        terms = eval('(' + arrayString + ')'); // Wrap in parens just in case, though array literal is fine
    } catch (e) {
        console.error('Eval error:', e);
        throw e;
    }

    console.log(`Parsed ${terms.length} terms.`);

    const insert = db.prepare(`
    INSERT OR REPLACE INTO terms (id, term_en, term_ar, definition_en, definition_ar, example, level, category_id)
    VALUES (@id, @termEn, @termAr, @definitionEn, @definitionAr, @example, @level, @categoryId)
  `);

    const insertMany = db.transaction((terms) => {
        let count = 0;
        for (const term of terms) {
            insert.run(term);
            count++;
        }
        return count;
    });

    const count = insertMany(terms);
    console.log(`Successfully seeded ${count} terms.`);

} catch (error) {
    console.error('Seeding failed:', error);
} finally {
    db.close();
}
