const fs = require('fs');
let content = fs.readFileSync('app/scenes/page.tsx', 'utf-8');

// 修复看板视图 - 在 className 后添加 > 来闭合 SceneSortable 开始标签
content = content.replace(
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\n                  renderItem',
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"\n                  renderItem'
);

// 真正的修复：在 gap-4" 后面添加 >
content = content.replace(
  'gap-4"\n                  renderItem={(scene: Scene)',
  'gap-4"\n                  renderItem={(scene: Scene)'
);

// 检查并修复
const oldStr = 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"';
const newStr = 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';

if (content.includes(oldStr + '\n                  renderItem')) {
  content = content.replace(oldStr + '\n                  renderItem', newStr + '\n                  renderItem');
  console.log('Fixed board view!');
}

fs.writeFileSync('app/scenes/page.tsx', content);
console.log('Done!');
