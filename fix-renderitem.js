const fs = require('fs');

const filePath = 'app/scenes/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修复看板视图的 SceneSortable
// 原代码: className="...">\n                  renderItem={
// 新代码: className="..."\n//                    renderItem={...}\n//                  >

const oldPattern = `                  <SceneSortable<Scene>
                    items={episodeScenes}
                    onChange={handleReorderScenes}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  renderItem={(scene: Scene) => (
                      <div key={scene.id} className="group pl-8">
                        <SceneCard
                          scene={scene}
                          onEdit={handleEditScene}
                          onDelete={handleDeleteScene}
                        />
                      </div>
                    )}
                  </SceneSortable>`;

const newPattern = `                  <SceneSortable<Scene>
                    items={episodeScenes}
                    onChange={handleReorderScenes}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    renderItem={(scene: Scene) => (
                      <div key={scene.id} className="group pl-8">
                        <SceneCard
                          scene={scene}
                          onEdit={handleEditScene}
                          onDelete={handleDeleteScene}
                        />
                      </div>
                    )}
                  >
                  </SceneSortable>`;

if (content.includes(oldPattern)) {
  content = content.replace(oldPattern, newPattern);
  fs.writeFileSync(filePath, content);
  console.log('Fixed board view SceneSortable!');
} else {
  console.log('Pattern not found, checking file...');
}
