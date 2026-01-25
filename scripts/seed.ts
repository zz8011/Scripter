/**
 * 数据库种子脚本
 *
 * 用法:
 *   pnpm tsx scripts/seed.ts
 */

import { db } from '../src/db'
import { users, projects, characters, scenes } from '../src/db/schema'
import { createUser } from '../src/db/queries/users'

async function main() {
  console.log('🌱 Seeding database...\n')

  // Create test user
  const testUser = await createUser({
    email: 'test@scripter.art',
    name: '测试用户',
    plan: 'creator',
    aiQuota: {
      monthlyLimit: 2000000,
      used: 0,
      resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
  console.log(`✅ Created user: ${testUser.email}`)

  // Create test project
  const [testProject] = await db.insert(projects).values({
    userId: testUser.id,
    name: '我送君归去',
    genre: ['民国', '悬疑', '爱情'],
    scriptType: 'short-drama',
    orientation: 'portrait',
    targetEpisodes: 80,
    currentStage: 'script',
  }).returning()
  console.log(`✅ Created project: ${testProject.name}`)

  // Create test character
  const [testCharacter] = await db.insert(characters).values({
    projectId: testProject.id,
    name: '林青云',
    poem: '青云之志，送君千里',
    basicInfo: {
      age: 25,
      gender: '男',
      occupation: '教师',
      appearance: '清秀文雅，常穿青色长衫',
    },
    personality: ['聪慧', '坚毅', '深情'],
    speechStyle: '温和而坚定',
    behaviorPattern: '遇事冷静，善于观察',
    growthArc: '从书生到革命者的转变',
    relationships: [],
  }).returning()
  console.log(`✅ Created character: ${testCharacter.name}`)

  // Create test scene
  const [testScene] = await db.insert(scenes).values({
    projectId: testProject.id,
    episodeNumber: 1,
    sceneNumber: 1,
    location: '湘西古镇·茶馆',
    timeOfDay: '日',
    intExt: 'INT',
    content: {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: 'INT. 湘西古镇·茶馆 - 日',
        },
        {
          type: 'action',
          content: '阳光透过窗棂，茶馆内烟火缭绕。林青云（25岁）坐在角落，手中拿着一本书，时不时望向门外。',
        },
      ],
    },
    duration: 120,
    status: 'completed',
  }).returning()
  console.log(`✅ Created scene: 第1集·第1场`)

  console.log('\n✨ Seeding completed!')
  console.log('\n📧 Test user credentials:')
  console.log('   Email: test@scripter.art')
  console.log('   (Use Casdoor OAuth to login)')
}

main().catch(console.error)
