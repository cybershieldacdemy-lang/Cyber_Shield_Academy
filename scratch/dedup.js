const fs = require('fs');

const filePath = 'src/data/terms-data.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// The file exports `terms` array. We can use eval to get the array, or extract it via regex.
// Since it's a TS file with `export const terms: Term[] = [...]`, we can extract the JSON-like array.
// But it has unquoted keys or single quotes. Let's write a small parser or use a safer approach.
// We can strip the export part, compile it using tsc or just eval it after some replacements.
// Since we want to maintain the formatting, doing regex might be better or we just recreate the TS file.
// The file seems to just be an array of objects.

// Let's use a regex approach to extract each object.
const objectRegex = /{\s*(?:id|\"id\"):\s*(\d+).*?}/gs;
const matches = [...content.matchAll(objectRegex)];

let terms = [];
for (const match of matches) {
    const objStr = match[0];
    
    // Extract fields
    const getFieldStr = (fieldName) => {
        const regex = new RegExp(`(?:${fieldName}|\\"${fieldName}\\")\\s*:\\s*(?:\\"([^\\"]+)\\"|\\'([^\\']+)\\')`);
        const m = objStr.match(regex);
        return m ? (m[1] || m[2]) : null;
    };
    
    const getFieldNum = (fieldName) => {
        const regex = new RegExp(`(?:${fieldName}|\\"${fieldName}\\")\\s*:\\s*(\\d+)`);
        const m = objStr.match(regex);
        return m ? parseInt(m[1]) : null;
    };

    terms.push({
        id: getFieldNum('id'),
        termEn: getFieldStr('termEn'),
        termAr: getFieldStr('termAr'),
        definitionAr: getFieldStr('definitionAr'),
        definitionEn: getFieldStr('definitionEn'),
        example: getFieldStr('example'),
        level: getFieldStr('level'),
        categoryId: getFieldNum('categoryId'),
        _raw: objStr
    });
}

console.log(`Extracted ${terms.length} terms`);

function normalize(text) {
    if (!text) return '';
    let t = text.trim().toLowerCase();
    // remove special chars if not meaningful
    t = t.replace(/[^a-z0-9\s-]/g, '');
    t = t.replace(/\s+/g, ' ');
    return t;
}

// Semantic similarities can be added if needed
const semanticMap = {
    "login": "sign in",
    "sign in": "sign in",
    "log in": "sign in"
};

let uniqueTerms = new Map();
let duplicates = [];
let cleanedTerms = [];

for (const term of terms) {
    let normEn = normalize(term.termEn);
    if (semanticMap[normEn]) {
        normEn = semanticMap[normEn];
    }
    
    if (uniqueTerms.has(normEn)) {
        const existing = uniqueTerms.get(normEn);
        // keep the one with more complete info (longer definition)
        const currentScore = (term.definitionEn?.length || 0) + (term.example?.length || 0);
        const existingScore = (existing.definitionEn?.length || 0) + (existing.example?.length || 0);
        
        if (currentScore > existingScore) {
            duplicates.push({ removed: existing.termEn, kept: term.termEn });
            uniqueTerms.set(normEn, term);
        } else {
            duplicates.push({ removed: term.termEn, kept: existing.termEn });
        }
    } else {
        uniqueTerms.set(normEn, term);
    }
}

// Rebuild the array and save
const newArrayStrs = [];
for (const [normEn, term] of uniqueTerms.entries()) {
    newArrayStrs.push(term._raw);
}

const beforeLen = terms.length;
const afterLen = newArrayStrs.length;

// Save summary report
const summary = {
    totalBefore: beforeLen,
    totalAfter: afterLen,
    duplicatesRemoved: duplicates.length,
    removedList: duplicates
};

fs.writeFileSync('scratch/dedup_summary.json', JSON.stringify(summary, null, 2));

// Replace the array in the original content
// Find the bounds of the array
const arrayStart = content.indexOf('export const terms: Term[] = [');
if (arrayStart !== -1) {
    const arrayBracketStart = content.indexOf('[', arrayStart);
    const arrayBracketEnd = content.lastIndexOf('];');
    
    if (arrayBracketStart !== -1 && arrayBracketEnd !== -1) {
        const before = content.substring(0, arrayBracketStart + 1);
        const after = content.substring(arrayBracketEnd);
        
        const newArrayContent = '\n  ' + newArrayStrs.join(',\n  ') + '\n';
        const newContent = before + newArrayContent + after;
        
        fs.writeFileSync(filePath, newContent);
        console.log(`Successfully written cleaned file. Saved ${duplicates.length} duplicates.`);
    } else {
        console.error("Could not find array brackets");
    }
} else {
    console.error("Could not find export statement");
}
