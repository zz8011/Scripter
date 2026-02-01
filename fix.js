const fs = require('fs');
let content = fs.readFileSync('app/scenes/page.tsx', 'utf-8');

// 修复看板视图 - className 属性后面缺少 >
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\s+renderItem/,
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\n                  renderItem'
);

// 修复列表视图 - 将 children 改为 renderItem prop
content = content.replace(
  /className="space-y-3"\s*>\s*\(\(scene\)/,
  'className="space-y-3"\n              renderItem={(scene)'
);

fs.writeFileSync('app/scenes/page.tsx', content);
console.log('Fixed!');
