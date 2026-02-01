import re

with open('app/scenes/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复看板视图的 SceneSortable
old_text = '''                  <SceneSortable<Scene>
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
                  </SceneSortable>'''

new_text = '''                  <SceneSortable<Scene>
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
                  </SceneSortable>'''

if old_text in content:
    content = content.replace(old_text, new_text)
    with open('app/scenes/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed board view SceneSortable!')
else:
    print('Pattern not found')
