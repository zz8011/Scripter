const fs = require('fs');
let content = fs.readFileSync('app/scenes/page.tsx', 'utf-8');

// 检查文件末尾
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Last 5 lines:');
lines.slice(-5).forEach((line, i) => {
  console.log(`${lines.length - 5 + i + 1}: ${line}`);
});

// 计算大括号
let openBraces = 0;
let closeBraces = 0;
for (const char of content) {
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
}
console.log('Open braces:', openBraces);
console.log('Close braces:', closeBraces);
console.log('Difference:', openBraces - closeBraces);
