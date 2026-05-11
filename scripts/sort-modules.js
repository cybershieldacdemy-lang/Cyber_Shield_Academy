const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'modules-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Extract the array content between the brackets
const startMarker = 'export const cybersecurityModules = [';
const startIdx = content.indexOf(startMarker);
const arrayStart = startIdx + startMarker.length;

// Find the matching closing bracket
let depth = 1;
let i = arrayStart;
while (depth > 0 && i < content.length) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') depth--;
    if (depth > 0) i++;
}
const arrayEnd = i;

const arrayContent = content.substring(arrayStart, arrayEnd);

// Parse individual module objects
const modules = [];
let braceDepth = 0;
let moduleStart = -1;

for (let j = 0; j < arrayContent.length; j++) {
    const ch = arrayContent[j];
    if (ch === '{') {
        if (braceDepth === 0) moduleStart = j;
        braceDepth++;
    } else if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0 && moduleStart !== -1) {
            modules.push(arrayContent.substring(moduleStart, j + 1).trim());
            moduleStart = -1;
        }
    }
}

// Extract difficulty from each module
function getDifficulty(moduleStr) {
    const match = moduleStr.match(/difficulty:\s*"([^"]+)"/);
    return match ? match[1] : 'متوسط';
}

function getTitle(moduleStr) {
    const match = moduleStr.match(/titleEn:\s*"([^"]+)"/);
    return match ? match[1] : '';
}

// Sort order
const diffOrder = { 'سهل': 0, 'متوسط': 1, 'صعب': 2 };

// Sort: by difficulty first, then alphabetically by titleEn within same difficulty
modules.sort((a, b) => {
    const da = diffOrder[getDifficulty(a)] ?? 1;
    const db = diffOrder[getDifficulty(b)] ?? 1;
    if (da !== db) return da - db;
    return getTitle(a).localeCompare(getTitle(b));
});

// Print summary
console.log("=== Sorted modules ===");
modules.forEach((m, idx) => {
    console.log(`${idx + 1}. [${getDifficulty(m)}] ${getTitle(m)}`);
});

// Rebuild the array
const easyModules = modules.filter(m => getDifficulty(m) === 'سهل');
const medModules = modules.filter(m => getDifficulty(m) === 'متوسط');
const hardModules = modules.filter(m => getDifficulty(m) === 'صعب');

let newArray = '\n';
newArray += '    // ═══ سهل (Easy) ═══\n';
easyModules.forEach((m, i) => {
    newArray += '    ' + m + ',\n';
});
newArray += '    // ═══ متوسط (Intermediate) ═══\n';
medModules.forEach((m, i) => {
    newArray += '    ' + m + ',\n';
});
newArray += '    // ═══ صعب (Advanced) ═══\n';
hardModules.forEach((m, i) => {
    newArray += '    ' + m + ',\n';
});

const newContent = content.substring(0, arrayStart) + newArray + content.substring(arrayEnd);
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`\nDone! Sorted ${modules.length} modules:`);
console.log(`  سهل (Easy): ${easyModules.length}`);
console.log(`  متوسط (Intermediate): ${medModules.length}`);
console.log(`  صعب (Advanced): ${hardModules.length}`);
