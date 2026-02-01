/* ==================================================
   类型定义 Type Definitions
   ================================================== */

// AI 消息类型
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'file';
}

// 用户信息类型
export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  sceneCount: number;
  characterCount: number;
  progress: number;
  type: string;
  estimatedEpisodes: number;
}

// 人物类型
export interface Character {
  id: string;
  projectId: string;
  name: string;
  avatar?: string;
  nickname?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  personality?: string[];
  speechStyle?: string;
  behaviorPattern?: string;
  backstory?: string;
  poem?: string; // 诗号
  relationships?: Relationship[];
}

export interface Relationship {
  characterId: string;
  type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'other';
  description: string;
}

// 场景类型
export interface Scene {
  id: string;
  projectId: string;
  episodeNumber: number;
  sceneNumber: number;
  title?: string;
  location?: string;
  time?: 'day' | 'night' | 'dawn' | 'dusk';
  environment?: 'interior' | 'exterior' | 'both';
  status: 'draft' | 'in_progress' | 'completed';
  content?: string; // TipTap JSON
  duration?: number; // 时长（秒）
}

// 世界观设定类型
export interface WorldviewItem {
  id: string;
  projectId: string;
  category: string; // 支持自定义分类
  title: string;
  description: string;
  tags?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// 世界观分类类型
export interface WorldviewCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isDefault: boolean;
  order: number;
}

// 分镜类型
export interface Storyboard {
  id: string;
  sceneId: string;
  shotNumber: number;
  shotType: 'long' | 'medium' | 'close' | 'extreme_close';
  cameraMovement?: string;
  visual: string;
  audio?: string;
  duration?: number;
}

// 导航项类型
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}



