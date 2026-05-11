const fs = require('fs');
const path = require('path');

const termsPath = path.join(__dirname, '../src/data/terms-data.ts');
const termsFile = fs.readFileSync(termsPath, 'utf-8');

const startMarker = 'export const terms';
const startIndex = termsFile.indexOf(startMarker);

if (startIndex !== -1) {
    const arrayStartIndex = termsFile.indexOf('[', startIndex);
    const arrayEndIndex = termsFile.lastIndexOf(']');

    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
        const arrayContent = termsFile.substring(arrayStartIndex, arrayEndIndex + 1);
        console.log('--- START OF CONTENT ---');
        console.log(arrayContent.substring(0, 200));
        console.log('--- END OF CONTENT ---');
        console.log(arrayContent.substring(arrayContent.length - 200));
    } else {
        console.log('Could not find brackets');
    }
} else {
    console.log('Could not find export marker');
}
