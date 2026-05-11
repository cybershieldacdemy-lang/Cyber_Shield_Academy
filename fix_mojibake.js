const fs = require('fs');
const path = require('path');

function decodeMojibake(content) {
    const buf = Buffer.alloc(content.length);
    for (let i = 0; i < content.length; i++) {
        let code = content.charCodeAt(i);
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
        }
        buf[i] = code & 0xFF;
    }
    
    // Check if the original file had a BOM. If it did, it would be EF BB BF.
    // In our double-encoded string, the BOM would look like \xEF \xBB \xBF.
    // However, Node's readFileSync('utf8') strips the BOM!
    // But wait! If PowerShell read the file, did it strip the BOM?
    // Let's just decode and see.
    let recovered = buf.toString('utf8');
    
    // Sometimes UTF-8 decoded text might still have a BOM at the start (\uFEFF)
    // We should keep it or let Node handle it, it's fine.
    return recovered;
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

let fixedCount = 0;

walkDir('d:/new/cyber-chell/out/src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // We look for common mojibake sequences.
        // Ø§ is 'ا' (Alef)
        // Ù  is 'م' (Meem)
        // Øª is 'ت' (Taa)
        if (content.includes('Ø§') || content.includes('Ù') || content.includes('Øª')) {
            let recovered = decodeMojibake(content);
            fs.writeFileSync(filePath, recovered, 'utf8');
            console.log('Fixed mojibake in:', filePath);
            fixedCount++;
        }
    }
});

console.log('Total files fixed:', fixedCount);
