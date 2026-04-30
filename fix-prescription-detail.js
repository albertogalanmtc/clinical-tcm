const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(process.cwd(), 'src/app/pages/PrescriptionDetail.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

// Split into lines
const lines = content.split('\n');

// Remove lines 999-1874 (0-indexed: 998-1873)
const fixedLines = [
  ...lines.slice(0, 999),  // Lines 1-999
  ...lines.slice(1875)      // Lines 1876 onwards
];

// Join back
const fixedContent = fixedLines.join('\n');

// Write back
fs.writeFileSync(filePath, fixedContent, 'utf-8');

console.log('File fixed successfully!');
console.log(`Removed lines 999-1875 (${1875 - 999 + 1} lines total)`);
console.log(`Original line count: ${lines.length}`);
console.log(`New line count: ${fixedLines.length}`);
