const fs = require('fs');

function decodeMojibake(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Convert to a buffer using character codes
    const buf = Buffer.alloc(content.length);
    for (let i = 0; i < content.length; i++) {
        let code = content.charCodeAt(i);
        // Windows-1252 to Unicode mapping check
        // If code > 255, it means Node parsed a byte sequence as Windows-1252 that maps to a high Unicode point.
        // For example, CP-1252 0x80 is \u20AC.
        // But wait, if Node read the file as UTF-8, it didn't do CP-1252 mapping!
        // It parsed it as UTF-8. So "Ù" is exactly \u00D9.
        if (code > 255) {
            // Some bytes like 0x81 are invalid in Windows-1252 but if it was read as UTF-8... wait!
            // If the original bytes were D9 81, and they were read as Windows-1252 by PowerShell,
            // PowerShell might have converted 0x81 to \u0081 or \uFFFD.
            // But wait! If PowerShell converted it, it's a code point.
            // Let's just do code & 0xFF.
            
            // Actually, let's reverse the Windows-1252 decoding
            // CP-1252 maps 0x80 to 0x20AC (Euro sign). So if we see 0x20AC, it should be byte 0x80.
            const win1252 = {
                0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
                0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
                0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
                0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
                0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
                0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
                0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
            };
            if (win1252[code] !== undefined) {
                code = win1252[code];
            } else if (code === 0xFFFD) {
                console.log("Found FFFD replacement character at index " + i + ". Unrecoverable.");
            }
        }
        buf[i] = code & 0xFF;
    }
    
    return buf.toString('utf8');
}

const recovered = decodeMojibake('d:/new/cyber-chell/out/src/app/(public)/tools/page.tsx');

const searchToken = 'name: "';
const start = recovered.indexOf(searchToken) + searchToken.length;
const end = recovered.indexOf('"', start);
const sample = recovered.substring(start, end);

console.log('Recovered sample:', sample);

// Check if it's completely fixed
// We will write the recovered text to a test file
fs.writeFileSync('d:/new/cyber-chell/out/recovered.tsx', recovered, 'utf8');
console.log('Wrote to recovered.tsx');
