import Database from 'better-sqlite3';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dbPath = path.join(process.cwd(), 'cyber.db');
const db = new Database(dbPath);

async function main() {
    const dir = 'd:/new/cyber-chell/defintions';
    const files = ['cybersecurity_terms_1000.xlsx', 'professional_cybersecurity_terms.xlsx'];

    let totalInserted = 0;
    let totalDuplicates = 0;

    // Load existing terms into a set for quick lookup
    const existingTerms = db.prepare('SELECT term_en FROM terms').all() as any[];
    const termSet = new Set(existingTerms.map(t => t.term_en.toLowerCase().trim()));

    const insertStmt = db.prepare(`
        INSERT INTO terms (term_en, term_ar, definition_ar, definition_en, example, level, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }

            console.log(`Processing file: ${file}`);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (const row of data as any[]) {
                const termEn = row['Term (English)']?.trim() || row['term (english)']?.trim() || row['Term']?.trim();
                const termAr = row['المصطلح بالعربي']?.trim() || row['المصطلح']?.trim();
                const definitionAr = row['التعريف بالعربي']?.trim() || row['التعريف']?.trim();
                const definitionEn = row['Definition (English)']?.trim() || row['definition (english)']?.trim() || row['Definition']?.trim() || "";
                const categoryStr = row['المجال']?.trim() || "عام";

                if (!termEn || !termAr || !definitionAr) {
                    continue; // Skip invalid rows
                }

                const termKey = termEn.toLowerCase();
                if (termSet.has(termKey)) {
                    totalDuplicates++;
                    continue;
                }

                // Pseudo-hash for categoryId
                let categoryId = Array.from(categoryStr as string).reduce((acc: number, char: any) => acc + char.charCodeAt(0), 0) % 1000 + 1;

                insertStmt.run(termEn, termAr, definitionAr, definitionEn, "", "متوسط", categoryId);

                termSet.add(termKey);
                totalInserted++;
            }
        }
    })();

    console.log(`✅ Done! Inserted ${totalInserted} terms. Skipped ${totalDuplicates} duplicates.`);
}

main().catch(console.error);
