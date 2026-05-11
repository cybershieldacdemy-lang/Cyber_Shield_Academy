const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database('cyber.db');
const tsPath = path.join(__dirname, '../src/data/terms-data.ts');
const jsPath = path.join(__dirname, '../src/data/temp-terms.js');

try {
    console.log('Reading terms-data.ts...');
    let content = fs.readFileSync(tsPath, 'utf-8');

    // Remove interface definition
    content = content.replace(/export interface Term\s*\{[\s\S]*?\}/g, '');

    // Remove type annotation and export
    // export const terms: Term[] =
    content = content.replace(/export const terms\s*:\s*Term\[\]\s*=/g, 'const terms =');

    // Also handle case where there is no type annotation or different formatting
    content = content.replace(/export const terms\s*=/g, 'const terms =');

    // Add module.exports
    content += '\nmodule.exports = terms;';

    console.log('Writing temp-terms.js...');
    fs.writeFileSync(jsPath, content);

    console.log('Preview of generated JS (first 200 chars):');
    console.log(content.substring(0, 200));

    console.log('Requiring temp terms file...');
    const terms = require(jsPath);

    console.log(`Loaded ${terms.length} terms.`);

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
    // Don't delete on error for debugging
    if (fs.existsSync(jsPath)) {
        // fs.unlinkSync(jsPath); 
    }
    db.close();
}
