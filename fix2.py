import re

with open('app/scenes/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复列表视图的 SceneSortable - 改为自闭合标签
old_text = '''            <SceneSortable<Scene>
              items={filteredScenes}
              onChange={handleReorderScenes}
              className="space-y-3"
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

new_text = '''            <SceneSortable<Scene>
              items={filteredScenes}
              onChange={handleReorderScenes}
              className="space-y-3"
              renderItem={(scene: Scene) => (
                <div key={scene.id} className="group pl-8">
                  <SceneCard
                    scene={scene}
                    onEdit={handleEditScene}
                    onDelete={handleDeleteScene}
                  />
                </div>
              )}
            />'''

if old_text in content:
    content = content.replace(old_text, new_text)
    with open('app/scenes/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed list view SceneSortable!')
else:
    print('Pattern not found for list view')
