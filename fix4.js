const fs = require('fs');
let content = fs.readFileSync('app/scenes/page.tsx', 'utf-8');

// 修复看板视图 - 移除 className 后面的 >，让 renderItem 成为 prop
content = content.replace(
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">\n                  renderItem',
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\n                  renderItem'
);

fs.writeFileSync('app/scenes/page.tsx', content);
console.log('Fixed!');
