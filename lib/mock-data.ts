/* ==================================================
   Mock 数据 Mock Data
   Mock Data for Development
   ================================================== */

import type { Project } from './types';

/* ==================================================
   Mock 项目数据 Mock Projects
   ================================================== */

export const mockProjects: Project[] = [
  {
    id: 'proj_20241201_wsjgq',
    name: '我送君归去',
    description: '一个关于离别与归来的湘西秘事',
    coverImage: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date('2024-12-01T14:32:00'),
    updatedAt: new Date('2024-12-15T09:18:00'),
    wordCount: 48526,
    sceneCount: 82,
    characterCount: 12,
    progress: 0.605,
    type: '民国 / 悬疑 / 爱情',
    estimatedEpisodes: 80,
  },
  {
    id: 'proj_20241215_mnts',
    name: '明月天涯',
    description: '武侠江湖的恩怨情仇',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date('2024-12-15T10:00:00'),
    updatedAt: new Date('2024-12-20T16:45:00'),
    wordCount: 12580,
    sceneCount: 24,
    characterCount: 8,
    progress: 0.152,
    type: '武侠 / 动作',
    estimatedEpisodes: 60,
  },
];
