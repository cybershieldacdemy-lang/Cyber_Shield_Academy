const xlsx = require('xlsx');
const path = require('path');

const dir = 'd:/new/cyber-chell/defintions';
const files = ['cybersecurity_terms_1000.xlsx', 'professional_cybersecurity_terms.xlsx'];

files.forEach(file => {
    try {
        const filePath = path.join(dir, file);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`--- ${file} ---`);
        console.log(data.slice(0, 3));
    } catch (e) {
        console.error(e);
    }
});
