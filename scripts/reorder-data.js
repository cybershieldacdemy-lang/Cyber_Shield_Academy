const fs = require('fs');

const desiredOrder = [
  "pre-security",
  "cyber-fundamentals",
  "soc-level-1",
  "security-engineer",
  "comptia-pentest",
  "web-fundamentals",
  "intro-to-cyber-security",
  "pre-security-legacy",
  "jr-penetration-tester",
  "soc-level-2",
  "devsecops",
  "offensive-pentesting",
  "aws-security",
  "web-application-pentesting",
  "defending-azure",
  "red-team",
  "advanced-endpoint-investigations"
];

// 1. Reorder page.tsx learningPaths

let pageTsxPath = 'src/app/(public)/paths/page.tsx';
let pageTsx = fs.readFileSync(pageTsxPath, 'utf8');

// Use regex to locate the learningPaths array brackets.
let startMarker = 'const learningPaths = [';
let endMarkerSearchStr = '    },\n];\n\n// ════════════';
let startIndex = pageTsx.indexOf(startMarker) + startMarker.length;

let depthList = 0;
let endIndex = -1;
for (let i = startIndex; i < pageTsx.length; i++) {
    if (pageTsx[i] === '[') depthList++;
    if (pageTsx[i] === ']') {
        if (depthList === 0) {
            endIndex = i;
            break;
        }
        depthList--;
    }
}

if (endIndex !== -1) {
  let content = pageTsx.substring(startIndex, endIndex);
  let objects = [];
  let depth = 0;
  let currentObj = '';
  // parse objects
  for(let i=0; i<content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0) currentObj = '';
      depth++;
    }
    if (depth > 0) currentObj += content[i];
    if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        let idMatch = currentObj.match(/id:\s*"([^"]+)"/);
        if (idMatch) {
          objects.push({ id: idMatch[1], content: currentObj });
        }
      }
    }
  }

  let newArrayContents = '\n    // ═══ سهل (Easy) ═══\n';
  desiredOrder.forEach(id => {
    if (id === 'jr-penetration-tester') newArrayContents += '    // ═══ متوسط (Intermediate) ═══\n';
    if (id === 'red-team') newArrayContents += '    // ═══ صعب (Advanced) ═══\n';
    let obj = objects.find(o => o.id === id);
    if (obj) {
      // pad internal lines
      let padded = obj.content.split('\n').map(l => '    ' + l).join('\n');
      // Actually obj.content is already containing newlines correctly format wise if we just prefix 4 spaces or let it be (it already has formatting).
      // Let's just use it exactly but note that internal indentation is absolute in the string. Wait, currentObj has its original whitespace.
      // So no need to pad everything.
      newArrayContents += '    ' + obj.content + ',\n';
    } else {
      console.log('Missing from page.tsx: ', id);
    }
  });

  pageTsx = pageTsx.substring(0, startIndex) + newArrayContents + pageTsx.substring(endIndex);
  fs.writeFileSync(pageTsxPath, pageTsx);
  console.log('page.tsx learningPaths reordered.');
} else {
  console.log('Could not find learningPaths end in page.tsx');
}

// 2. Reorder paths-detail-data.ts

let pathsDetailPath = 'src/data/paths-detail-data.ts';
let pathsDetail = fs.readFileSync(pathsDetailPath, 'utf8');

let pdStartIndex = pathsDetail.indexOf('export const pathsDetailData: Record<string, PathDetail> = {') + 'export const pathsDetailData: Record<string, PathDetail> = {'.length;
let pdEndIndex = pathsDetail.indexOf('};\n\nexport const fallbackPathDetail');

if (pdStartIndex !== -1 && pdEndIndex !== -1) {
  let content = pathsDetail.substring(pdStartIndex, pdEndIndex);
  let objects = [];
  let depth = 0;
  let currentObj = '';
  let currentKey = '';
  
  for (let i = 0; i < content.length; i++) {
    let char = content[i];
    
    if (depth === 0 && char === '"') {
      let keyEnd = content.indexOf('"', i + 1);
      currentKey = content.substring(i + 1, keyEnd);
      i = keyEnd;
      continue;
    }
    
    if (char === '{') {
      depth++;
      if (depth === 1) {
         currentObj = '{';
         continue;
      }
    }
    
    if (depth > 0) {
      currentObj += char;
    }
    
    if (char === '}') {
      if (depth > 0) depth--;
      if (depth === 0 && currentKey) {
          objects.push({ key: currentKey, content: currentObj });
          currentKey = '';
          currentObj = '';
      }
    }
  }

  let newPathsDetailStr = '\n';
  desiredOrder.forEach(id => {
    let obj = objects.find(o => o.key === id);
    if (obj) {
      newPathsDetailStr += `    "${id}": ${obj.content},\n`;
    } else {
      console.log('Missing from paths-detail-data.ts: ', id);
    }
  });

  pathsDetail = pathsDetail.substring(0, pdStartIndex) + newPathsDetailStr + pathsDetail.substring(pdEndIndex);
  fs.writeFileSync(pathsDetailPath, pathsDetail);
  console.log('paths-detail-data.ts reordered.');
} else {
  console.log('Could not find pathsDetailData bounds in paths-detail-data.ts');
}
