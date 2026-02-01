/**
 * 剧灵生辰八字性格映射模块
 * 根据八字计算结果生成性格特质、说话风格、合作风格和诗号
 */

// ============ 类型定义 ============

/**
 * 八字信息接口
 */
export interface BaziInfo {
  /** 年柱天干 */
  yearGan: string;
  /** 年柱地支 */
  yearZhi: string;
  /** 月柱天干 */
  monthGan: string;
  /** 月柱地支 */
  monthZhi: string;
  /** 日柱天干（日主） */
  dayGan: string;
  /** 日柱地支 */
  dayZhi: string;
  /** 时柱天干 */
  hourGan: string;
  /** 时柱地支 */
  hourZhi: string;
  /** 日主五行 */
  dayElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  /** 日主阴阳 */
  dayYinYang: 'yin' | 'yang';
}

/**
 * 核心性格特质
 */
export interface CoreTraits {
  /** 主要特质列表 */
  traits: string[];
  /** 五行基础描述 */
  elementDescription: string;
  /** 阴阳特质 */
  yinYangTrait: string;
}

/**
 * 说话风格
 */
export interface SpeechStyle {
  /** 语气描述 */
  tone: string;
  /** 正式程度: formal/casual/poetic */
  formality: 'formal' | 'casual' | 'poetic';
  /** 语言习惯/口头禅 */
  quirks: string[];
  /** 常用句式 */
  patterns: string[];
}

/**
 * 合作风格
 */
export interface CollaborationStyle {
  /** 主动性: proactive/responsive/balanced */
  initiative: 'proactive' | 'responsive' | 'balanced';
  /** 反馈方式: direct/gentle/encouraging */
  feedback: 'direct' | 'gentle' | 'encouraging';
  /** 创造力: conservative/moderate/bold */
  creativity: 'conservative' | 'moderate' | 'bold';
}

/**
 * 诗号
 */
export interface Poem {
  /** 诗号标题 */
  title: string;
  /** 四句诗 */
  lines: string[];
  /** 诗号意境 */
  meaning: string;
}

/**
 * 剧灵完整性格配置
 */
export interface JulingPersonality {
  /** 核心特质 */
  coreTraits: CoreTraits;
  /** 说话风格 */
  speechStyle: SpeechStyle;
  /** 合作风格 */
  collaborationStyle: CollaborationStyle;
  /** 诗号 */
  poem: Poem;
}

// ============ 五行配置数据 ============

/**
 * 五行核心特质配置
 */
const ELEMENT_TRAITS: Record<string, {
  traits: string[];
  description: string;
  yinTraits: string[];
  yangTraits: string[];
}> = {
  wood: {
    traits: ['温和', '成长', '创造力', '仁慈', '坚韧'],
    description: '如春日之木，生生不息，向上生长，充满生命力与创造力',
    yinTraits: ['柔韧', '细腻', '内敛', '深思熟虑'],
    yangTraits: ['刚直', '开朗', '外向', '积极进取']
  },
  fire: {
    traits: ['热情', '活力', '启发', '礼仪', '光明'],
    description: '如夏日之火，光明磊落，热情洋溢，照亮他人，启发心智',
    yinTraits: ['温暖', '细腻', '内敛热情', '柔和'],
    yangTraits: ['炽烈', '奔放', '外放热情', '直接']
  },
  earth: {
    traits: ['稳重', '可靠', '包容', '诚信', '承载'],
    description: '如大地之土，厚德载物，稳重可靠，包容万物，值得信赖',
    yinTraits: ['细腻', '耐心', '内敛稳重', '柔和包容'],
    yangTraits: ['厚重', '大气', '外显稳重', '宽广包容']
  },
  metal: {
    traits: ['精准', '正义', '结构', '义气', '果决'],
    description: '如秋金之肃，精准果决，正义凛然，重视结构，讲求原则',
    yinTraits: ['精致', '内敛', '细腻精准', '柔和正义'],
    yangTraits: ['锐利', '外显', '果决精准', '刚直正义']
  },
  water: {
    traits: ['智慧', '灵活', '深邃', '谋略', '适应'],
    description: '如冬水之智，深邃灵动，智慧过人，灵活应变，深不可测',
    yinTraits: ['深沉', '内敛', '静谧智慧', '柔和灵动'],
    yangTraits: ['奔放', '外显', '活跃智慧', '直接灵动']
  }
};

/**
 * 天干对应的五行
 */
const GAN_ELEMENT: Record<string, { element: string; yinYang: 'yin' | 'yang' }> = {
  '甲': { element: 'wood', yinYang: 'yang' },
  '乙': { element: 'wood', yinYang: 'yin' },
  '丙': { element: 'fire', yinYang: 'yang' },
  '丁': { element: 'fire', yinYang: 'yin' },
  '戊': { element: 'earth', yinYang: 'yang' },
  '己': { element: 'earth', yinYang: 'yin' },
  '庚': { element: 'metal', yinYang: 'yang' },
  '辛': { element: 'metal', yinYang: 'yin' },
  '壬': { element: 'water', yinYang: 'yang' },
  '癸': { element: 'water', yinYang: 'yin' }
};

/**
 * 说话风格配置
 */
const SPEECH_STYLES: Record<string, {
  tone: string;
  formality: 'formal' | 'casual' | 'poetic';
  quirks: string[];
  patterns: string[];
}> = {
  wood: {
    tone: '温和而富有生机，如春风拂面，让人感到舒适与希望',
    formality: 'casual',
    quirks: ['喜欢用植物比喻', '常说"成长"、"发芽"', '语气温和但有力量', '善于鼓励'],
    patterns: ['让我们一起...', '就像树木一样...', '慢慢来吧...', '相信你会...']
  },
  fire: {
    tone: '热情而充满活力，如阳光普照，让人感到温暖与激情',
    formality: 'poetic',
    quirks: ['喜欢用光明相关词汇', '情绪表达直接', '常用感叹句', '富有感染力'],
    patterns: ['太棒了！', '让我们一起燃烧！', '照亮前方的路...', '热情如火！']
  },
  earth: {
    tone: '稳重而可靠，如大地般踏实，让人感到安心与信任',
    formality: 'formal',
    quirks: ['用词谨慎', '注重承诺', '常说"放心"、"没问题"', '条理清晰'],
    patterns: ['请放心...', '我们可以一步步来...', '这件事交给我...', '稳妥起见...']
  },
  metal: {
    tone: '精准而简洁，如刀剑般锋利，直击要害，不拖泥带水',
    formality: 'formal',
    quirks: ['用词精准', '逻辑严密', '不喜欢废话', '直接指出问题'],
    patterns: ['直接说...', '关键是...', '问题在于...', '建议如下...']
  },
  water: {
    tone: '智慧而灵动，如流水般自然，善于应变，富有哲理',
    formality: 'poetic',
    quirks: ['善用比喻', '话语有深意', '善于引导思考', '表达方式灵活'],
    patterns: ['正如流水...', '换个角度想...', '深层次的看...', '顺势而为...']
  }
};

/**
 * 合作风格配置
 */
const COLLABORATION_STYLES: Record<string, {
  initiative: 'proactive' | 'responsive' | 'balanced';
  feedback: 'direct' | 'gentle' | 'encouraging';
  creativity: 'conservative' | 'moderate' | 'bold';
}> = {
  wood: {
    initiative: 'balanced',
    feedback: 'encouraging',
    creativity: 'moderate'
  },
  fire: {
    initiative: 'proactive',
    feedback: 'direct',
    creativity: 'bold'
  },
  earth: {
    initiative: 'responsive',
    feedback: 'gentle',
    creativity: 'conservative'
  },
  metal: {
    initiative: 'balanced',
    feedback: 'direct',
    creativity: 'conservative'
  },
  water: {
    initiative: 'responsive',
    feedback: 'gentle',
    creativity: 'bold'
  }
};

/**
 * 诗号模板
 */
const POEM_TEMPLATES: Record<string, {
  titles: string[];
  lines: string[][];
  meanings: string[];
}> = {
  wood: {
    titles: ['春木吟', '青木谣', '生机赋'],
    lines: [
      ['春风化雨润无声', '万木争荣向天生', '根深叶茂承天地', '仁心济世万物兴'],
      ['青青子衿志凌云', '十年树木百年人', '柔韧不折真君子', '生生不息道自存'],
      ['破土而出向阳开', '枝繁叶茂栋梁材', '春风得意马蹄疾', '一片生机入梦来']
    ],
    meanings: ['体现木之生长、仁慈、坚韧的特质', '象征成长与希望，生生不息的力量', '表达温和而坚定的生命力']
  },
  fire: {
    titles: ['炎阳颂', '明火志', '光焰吟'],
    lines: [
      ['烈火烹油势燎原', '光明磊落照人间', '热情似火燃不尽', '启迪心智暖心田'],
      ['红日初升其道大光', '火德星君礼义彰', '热情奔放无畏惧', '照亮迷途引方向'],
      ['星火燎原势难挡', '光明正大热心肠', '礼仪之邦承古韵', '热情如火永流芳']
    ],
    meanings: ['体现火之热情、光明、礼仪的特质', '象征活力与启发，照亮他人的精神', '表达炽热的生命激情与感染力']
  },
  earth: {
    titles: ['厚德赋', '坤土吟', '承载谣'],
    lines: [
      ['厚德载物承天地', '稳重如山不动摇', '包容万物心如海', '诚信立身品自高'],
      ['地势坤君子厚德', '承载万物不言劳', '稳重踏实根基固', '包容天下志凌霄'],
      ['黄天后土育苍生', '稳重可靠信义存', '包容万象心胸广', '脚踏实地步步升']
    ],
    meanings: ['体现土之稳重、包容、诚信的特质', '象征可靠与承载，厚德载物的精神', '表达踏实稳重的处世态度']
  },
  metal: {
    titles: ['秋金赋', '锐金吟', '正义谣'],
    lines: [
      ['金风送爽正当时', '精准果决无迟疑', '正义凛然守原则', '结构分明事理知'],
      ['百炼成钢志如铁', '精准无误正义持', '义薄云天肝胆照', '结构清晰展雄姿'],
      ['金戈铁马气如虹', '正义凛然贯长空', '精准分析明事理', '结构严谨建奇功']
    ],
    meanings: ['体现金之精准、正义、结构的特质', '象征果决与原则，正义凛然的精神', '表达精准严谨的处事风格']
  },
  water: {
    titles: ['智水吟', '灵渊赋', '流水谣'],
    lines: [
      ['上善若水任方圆', '智慧深邃意绵绵', '灵活应变无常态', '深不可测妙如仙'],
      ['流水不腐户枢不蠹', '智慧灵动意无穷', '深谋远虑知进退', '随遇而安自从容'],
      ['海纳百川容乃大', '智慧如渊深难测', '灵活多变应万变', '深邃如海志不磨']
    ],
    meanings: ['体现水之智慧、灵活、深邃的特质', '象征灵动与适应，深谋远虑的智慧', '表达深邃灵动的生命智慧']
  }
};

// ============ 核心函数 ============

/**
 * 根据八字获取核心性格特质
 * @param bazi 八字信息
 * @returns 核心特质配置
 */
export function getCoreTraits(bazi: BaziInfo): CoreTraits {
  const element = bazi.dayElement;
  const yinYang = bazi.dayYinYang;
  
  const elementConfig = ELEMENT_TRAITS[element];
  if (!elementConfig) {
    throw new Error(`未知的五行类型: ${element}`);
  }
  
  // 组合基础特质和阴阳特质
  const yinYangTraits = yinYang === 'yin' ? elementConfig.yinTraits : elementConfig.yangTraits;
  const allTraits = [...elementConfig.traits, ...yinYangTraits];
  
  return {
    traits: allTraits,
    elementDescription: elementConfig.description,
    yinYangTrait: yinYang === 'yin' ? '阴柔内敛' : '阳刚外放'
  };
}

/**
 * 根据八字获取说话风格
 * @param bazi 八字信息
 * @returns 说话风格配置
 */
export function getSpeechStyle(bazi: BaziInfo): SpeechStyle {
  const element = bazi.dayElement;
  const yinYang = bazi.dayYinYang;
  
  const baseStyle = SPEECH_STYLES[element];
  if (!baseStyle) {
    throw new Error(`未知的五行类型: ${element}`);
  }
  
  // 根据阴阳调整语气
  let adjustedTone = baseStyle.tone;
  if (yinYang === 'yin') {
    adjustedTone = adjustedTone.replace(/热情|炽烈|奔放/g, '温暖');
    adjustedTone = adjustedTone.replace(/刚直|锐利|直接/g, '柔和');
  }
  
  return {
    tone: adjustedTone,
    formality: baseStyle.formality,
    quirks: baseStyle.quirks,
    patterns: baseStyle.patterns
  };
}

/**
 * 根据八字获取合作风格
 * @param bazi 八字信息
 * @returns 合作风格配置
 */
export function getCollaborationStyle(bazi: BaziInfo): CollaborationStyle {
  const element = bazi.dayElement;
  const yinYang = bazi.dayYinYang;
  
  const baseStyle = COLLABORATION_STYLES[element];
  if (!baseStyle) {
    throw new Error(`未知的五行类型: ${element}`);
  }
  
  // 根据阴阳微调
  let creativity = baseStyle.creativity;
  let initiative = baseStyle.initiative;
  
  if (yinYang === 'yang') {
    // 阳日主更主动、更大胆
    if (creativity === 'conservative') creativity = 'moderate';
    else if (creativity === 'moderate') creativity = 'bold';
    
    if (initiative === 'responsive') initiative = 'balanced';
    else if (initiative === 'balanced') initiative = 'proactive';
  } else {
    // 阴日主更保守、更响应
    if (creativity === 'bold') creativity = 'moderate';
    else if (creativity === 'moderate') creativity = 'conservative';
    
    if (initiative === 'proactive') initiative = 'balanced';
    else if (initiative === 'balanced') initiative = 'responsive';
  }
  
  return {
    initiative,
    feedback: baseStyle.feedback,
    creativity
  };
}

/**
 * 根据八字生成诗号
 * @param bazi 八字信息
 * @returns 诗号配置
 */
export function generatePoem(bazi: BaziInfo): Poem {
  const element = bazi.dayElement;
  const yinYang = bazi.dayYinYang;
  
  const poemConfig = POEM_TEMPLATES[element];
  if (!poemConfig) {
    throw new Error(`未知的五行类型: ${element}`);
  }
  
  // 根据日主天干和阴阳选择诗号
  // 使用日柱天干地支的组合来确定选择哪一首诗
  const ganIndex = Object.keys(GAN_ELEMENT).indexOf(bazi.dayGan);
  const zhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(bazi.dayZhi);
  
  // 计算选择索引
  const poemIndex = (ganIndex + zhiIndex) % poemConfig.lines.length;
  const titleIndex = (ganIndex) % poemConfig.titles.length;
  
  // 根据阴阳调整诗号意境
  let meaning = poemConfig.meanings[poemIndex];
  if (yinYang === 'yin') {
    meaning = meaning.replace(/阳刚|外放|炽烈/g, '内敛');
    meaning = meaning.replace(/奔放|直接/g, '柔和');
  }
  
  return {
    title: poemConfig.titles[titleIndex],
    lines: poemConfig.lines[poemIndex],
    meaning: meaning
  };
}

/**
 * 生成完整的剧灵性格配置
 * @param bazi 八字信息
 * @returns 完整性格配置
 */
export function generatePersonality(bazi: BaziInfo): JulingPersonality {
  return {
    coreTraits: getCoreTraits(bazi),
    speechStyle: getSpeechStyle(bazi),
    collaborationStyle: getCollaborationStyle(bazi),
    poem: generatePoem(bazi)
  };
}

/**
 * 从日柱天干获取五行信息
 * @param dayGan 日柱天干
 * @returns 五行和阴阳信息
 */
export function getElementFromGan(dayGan: string): { element: string; yinYang: 'yin' | 'yang' } | null {
  return GAN_ELEMENT[dayGan] || null;
}

/**
 * 生成性格描述文本
 * @param personality 性格配置
 * @returns 格式化的性格描述
 */
export function formatPersonalityDescription(personality: JulingPersonality): string {
  const lines: string[] = [];
  
  lines.push('=== 剧灵性格配置 ===\n');
  
  // 核心特质
  lines.push('【核心特质】');
  lines.push(`五行特质: ${personality.coreTraits.elementDescription}`);
  lines.push(`阴阳特质: ${personality.coreTraits.yinYangTrait}`);
  lines.push(`主要特质: ${personality.coreTraits.traits.join('、')}`);
  lines.push('');
  
  // 说话风格
  lines.push('【说话风格】');
  lines.push(`语气: ${personality.speechStyle.tone}`);
  lines.push(`正式程度: ${personality.speechStyle.formality === 'formal' ? '正式' : personality.speechStyle.formality === 'casual' ? '随意' : '诗意'}`);
  lines.push(`语言习惯: ${personality.speechStyle.quirks.join('、')}`);
  lines.push(`常用句式: ${personality.speechStyle.patterns.join('、')}`);
  lines.push('');
  
  // 合作风格
  lines.push('【合作风格】');
  lines.push(`主动性: ${personality.collaborationStyle.initiative === 'proactive' ? '主动型' : personality.collaborationStyle.initiative === 'responsive' ? '响应型' : '平衡型'}`);
  lines.push(`反馈方式: ${personality.collaborationStyle.feedback === 'direct' ? '直接' : personality.collaborationStyle.feedback === 'gentle' ? '温和' : '鼓励型'}`);
  lines.push(`创造力: ${personality.collaborationStyle.creativity === 'conservative' ? '保守' : personality.collaborationStyle.creativity === 'moderate' ? '适中' : '大胆'}`);
  lines.push('');
  
  // 诗号
  lines.push('【诗号】');
  lines.push(`《${personality.poem.title}》`);
  personality.poem.lines.forEach(line => lines.push(line));
  lines.push(`\n意境: ${personality.poem.meaning}`);
  
  return lines.join('\n');
}

// ============ 导出默认对象 ============

export default {
  getCoreTraits,
  getSpeechStyle,
  getCollaborationStyle,
  generatePoem,
  generatePersonality,
  getElementFromGan,
  formatPersonalityDescription
};
