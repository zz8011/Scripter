const fs = require('fs');
let content = fs.readFileSync('app/scenes/page.tsx', 'utf-8');

// 修复看板视图 - className 属性后面缺少 >
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\s+renderItem/,
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\n                  renderItem'
);

// 更精确的修复：在 className 闭合引号后添加 >
content = content.replace(
  /(className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4")\s+(renderItem)/,
  '$1\n                  $2'
);

fs.writeFileSync('app/scenes/page.tsx', content);
console.log('Fixed!');
