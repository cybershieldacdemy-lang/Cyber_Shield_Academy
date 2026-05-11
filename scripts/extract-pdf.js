const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function main() {
  const buf = fs.readFileSync('Vulnera X.pdf');
  const uint8 = new Uint8Array(buf);
  const parser = new PDFParse(uint8);
  await parser.load();
  
  const text = await parser.getText();
  if (typeof text === 'string') {
    fs.writeFileSync('pdf_text.txt', text, 'utf8');
    console.log('Text chars:', text.length);
  } else {
    // getText may return something else, let's check
    const resolved = await text;
    const str = String(resolved);
    fs.writeFileSync('pdf_text.txt', str, 'utf8');
    console.log('Text chars:', str.length);
  }
  console.log('Done!');
  parser.destroy();
}

main().catch(e => console.error('Error:', e.message));
