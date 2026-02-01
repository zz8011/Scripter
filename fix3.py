import re

with open('app/scenes/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 删除多余的 </div>
content = content.replace(
    '''                  />
                </div>
                </div>
              ))}''',
    '''                  />
                </div>
              ))}'''
)

with open('app/scenes/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed extra closing div!')
