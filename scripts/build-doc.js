// Script to generate CyberShield Academy graduation project document
const fs = require('fs');

const css = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Tajawal',sans-serif; direction:rtl; background:#fff; color:#1a1a2e; line-height:1.8; }
@page { size:A4; margin:20mm 18mm; }
@media print { .no-print{display:none!important;} .page-break{page-break-before:always;} body{background:#fff;} }
.cover { min-height:100vh; background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); display:flex; align-items:center; justify-content:center; text-align:center; color:#fff; padding:40px; }
.cover h1 { font-size:42px; font-weight:800; margin:20px 0; background:linear-gradient(90deg,#00d2ff,#3a7bd5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.cover h2 { font-size:20px; font-weight:400; color:#94a3b8; margin-bottom:8px; }
.cover .badge { display:inline-block; padding:6px 20px; border:2px solid #00d2ff; border-radius:30px; color:#00d2ff; font-size:14px; margin-top:20px; }
.toc { padding:60px 40px; }
.toc h2 { font-size:28px; color:#1e3a5f; border-bottom:3px solid #0891b2; padding-bottom:10px; margin-bottom:30px; }
.toc-item { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e2e8f0; font-size:15px; }
.toc-item span:first-child { color:#1e3a5f; font-weight:600; }
.toc-item span:last-child { color:#0891b2; }
.chapter { padding:50px 40px; }
.chapter-title { font-size:28px; font-weight:800; color:#1e3a5f; border-right:5px solid #0891b2; padding-right:16px; margin-bottom:24px; }
.section-title { font-size:20px; font-weight:700; color:#302b63; margin:24px 0 12px; padding-right:12px; border-right:3px solid #6366f1; }
.sub-title { font-size:16px; font-weight:700; color:#475569; margin:16px 0 8px; }
p { margin-bottom:14px; text-align:justify; font-size:14px; }
table { width:100%; border-collapse:collapse; margin:16px 0 24px; font-size:13px; }
th { background:#1e3a5f; color:#fff; padding:10px 12px; text-align:right; }
td { padding:8px 12px; border:1px solid #e2e8f0; }
tr:nth-child(even) { background:#f8fafc; }
ul,ol { margin:10px 30px 16px; font-size:14px; }
li { margin-bottom:6px; }
.highlight { background:#f0f9ff; border-right:4px solid #0891b2; padding:14px 18px; border-radius:0 8px 8px 0; margin:16px 0; font-size:14px; }
.risk-high { color:#ef4444; font-weight:700; }
.risk-med { color:#f59e0b; font-weight:700; }
.risk-low { color:#22c55e; font-weight:700; }
.diagram-box { background:#f8fafc; border:2px solid #e2e8f0; border-radius:12px; padding:20px; margin:16px 0; text-align:center; }
.diagram-box pre { direction:ltr; text-align:left; font-size:12px; line-height:1.5; overflow-x:auto; }
.footer { text-align:center; padding:30px; color:#94a3b8; font-size:12px; border-top:1px solid #e2e8f0; }
`;

const parts = [];
parts.push(fs.readFileSync('scripts/doc-parts/cover.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/toc.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch1.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch2.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch3.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch4.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch5.html','utf8'));
parts.push(fs.readFileSync('scripts/doc-parts/ch6.html','utf8'));

const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CyberShield Academy - مشروع التخرج</title><style>${css}</style></head><body>${parts.join('\n')}<div class="footer"><p>CyberShield Academy &copy; 2026 — وثيقة مشروع التخرج — جميع الحقوق محفوظة</p></div></body></html>`;

fs.writeFileSync('CyberShield_Academy_Project.html', html, 'utf8');
console.log('Done! File: CyberShield_Academy_Project.html (' + html.length + ' chars)');
