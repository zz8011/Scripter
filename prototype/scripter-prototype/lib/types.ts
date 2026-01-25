/* ==================================================
   类型定义 Type Definitions
   ================================================== */

/**
 * 导航菜单项类型
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

/**
 * 项目信息类型
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  sceneCount: number;
  characterCount: number;
  progress: number;
  type: string;
  estimatedEpisodes: number;
}

/**
 * 人物信息类型
 */
export interface Character {
  id: string;
  name: string;
  portrait: string;
  description: string;
  personality: string[];
  speakingStyle: string;
  behaviorPattern: string;
  poemNumber?: string;
  relationships: Relationship[];
}

/**
 * 人物关系类型
 */
export interface Relationship {
  characterId: string;
  characterName: string;
  type: "friend" | "enemy" | "family" | "love" | "mentor" | "other";
  description: string;
}

/**
 * 场景信息类型
 */
export interface Scene {
  id: string;
  episodeNumber: number;
  sceneNumber: number;
  location: string;
  time: string;
  interiorExterior: "内" | "外" | "内外";
  content: string;
  duration?: number;
  characters: string[];
  tags: string[];
}

/**
 * 世界观设定类型
 */
export interface WorldviewItem {
  id: string;
  category: "时代" | "地理" | "阶层" | "组织" | "其他";
  title: string;
  content: string;
  relatedItems: string[];
}

/**
 * AI 消息类型
 */
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "suggestion" | "action";
}

/**
 * 侧边栏状态类型
 */
export interface SidebarState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  membership: "free" | "pro" | "premium";
  membershipLabel: string;
  isOnline: boolean;
}
