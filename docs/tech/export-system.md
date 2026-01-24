# 剧灵 Scripter - 导出系统设计

> 二维导出选择、封面页集成、防盗版功能

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [技术设计文档](tech-design.md) | 整体技术架构 |
| [编辑器设计](editor-design.md) | TipTap 编辑器定制 |
| [API 规范](api-spec.md) | 导出 API 端点 |

---

## 一、导出系统架构

### 1.1 二维选择矩阵

```
┌─────────────────────────────────────────────────────────────┐
│                    导出二维选择矩阵                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        格式维度                              │
│              ┌─────────────┬─────────────┐                  │
│              │ 中文短剧    │  Fountain   │                  │
│              │  格式v2.0   │   国际格式  │                  │
│    ┌─────────┼─────────────┼─────────────┤                  │
│    │  PDF    │   ✓✓✓     │    ✓✓      │                  │
│ 文 │         │ △符号     │  标准格式  │                  │
│ 件 │---------│------------│------------│                  │
│ 类 │  Word   │   ✓✓✓     │    ✓✓      │                  │
│    │         │ 可编辑     │  可编辑    │                  │
│ 型 │---------│------------│------------│                  │
│    │  Text   │   ✓✓      │    ✓✓✓    │                  │
│    │         │ UTF-8      │  纯文本    │                  │
│    │---------│------------│------------│                  │
│    │纯图PDF  │   ✓✓✓     │    ───     │                  │
│    │(防盗版) │ 不可复制   │  不支持    │                  │
│    │---------│------------│------------│                  │
│    │只读Word │   ✓✓✓     │    ───     │                  │
│    │(防盗版) │  密码保护  │  不支持    │                  │
│    └─────────┴─────────────┴─────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心数据结构

```typescript
// lib/types/export.ts

/**
 * 剧本格式
 */
export enum ScriptFormat {
  CHINESE = 'chinese',      // 中文短剧剧本格式规范 v2.0
  FOUNTAIN = 'fountain'     // 国际 Fountain 格式
}

/**
 * 导出文件类型
 */
export enum FileType {
  PDF = 'pdf',
  WORD = 'docx',
  TEXT = 'txt',
  IMAGE_PDF = 'image_pdf',         // 纯图PDF（防盗版）
  WORD_READONLY = 'word_readonly'   // 只读Word（密码保护）
}

/**
 * 导出范围类型
 */
export enum ExportRangeType {
  ALL = 'all',                       // 全部内容
  PAGE_RANGE = 'page_range',         // 页数范围
  EPISODE_RANGE = 'episode_range',   // 集数范围
  SCENE_RANGE = 'scene_range',       // 场数范围
  FIRST_N_PAGES = 'first_n_pages',   // 前N页
  FIRST_N_SCENES = 'first_n_scenes'  // 前N场
}

/**
 * 导出范围配置
 */
export interface ExportRange {
  type: ExportRangeType

  // 范围参数（根据 type 不同使用不同字段）
  pageStart?: number
  pageEnd?: number
  episodeStart?: number
  episodeEnd?: number
  sceneStart?: number
  sceneEnd?: number
  firstN?: number
}

/**
 * 防盗版保护配置
 */
export interface ProtectionConfig {
  enableImagePDF: boolean        // 转换为纯图PDF
  enableWordPassword: boolean    // Word密码保护
  watermark?: WatermarkConfig
  sampleMark?: SampleMarkConfig
}

/**
 * 水印配置
 */
export interface WatermarkConfig {
  text: string                   // 水印文字（默认为项目名称）
  opacity: number                // 透明度 0-1（默认 0.1）
  position: 'center' | 'corner'  // 位置
  rotation: number               // 旋转角度（默认 -30°）
}

/**
 * 样张标记配置
 */
export interface SampleMarkConfig {
  enable: boolean
  text: string                   // 默认："样张 - 仅供内部参考"
  position: 'header' | 'footer' | 'both'
}

/**
 * 封面页配置
 */
export interface CoverPageConfig {
  enable: boolean                // 是否包含封面（默认 true）
  useProjectCover: boolean       // 使用项目封面图片（默认 true）
  customCover?: {
    imageUrl: string
    position: 'cover' | 'background' | 'none'
    opacity: number
  }
  showTitle: boolean
  showEpisodeInfo: boolean
  showWriters: boolean
  showVersion: boolean
}

/**
 * 导出配置
 */
export interface ExportConfig {
  format: ScriptFormat
  fileType: FileType
  range: ExportRange
  cover: CoverPageConfig
  protection: ProtectionConfig
  metadata: {
    projectId: string
    projectName: string
    scriptVersion?: string
    exportDate: Date
  }
}
```

---

## 二、封面页系统

### 2.1 封面页数据结构

```typescript
// lib/types/cover.ts
export interface ProjectCover {
  title: string
  subtitle?: string

  episodeInfo?: {
    current: number      // 当前集数
    total: number        // 总集数
  }

  writers: string[]      // 编剧列表

  coverImage?: {
    url: string
    position: 'cover' | 'background' | 'none'
    opacity?: number     // 0-1
  }

  version?: {
    label: string        // 版本标签，如 "初稿"、"修订稿"
    date: Date
    notes?: string       // 版本说明
  }

  // 项目元数据（从项目配置读取）
  projectMetadata: {
    genre: string[]      // 类型标签
    logline?: string     // 故事梗概
    targetEpisodes: number
  }
}
```

### 2.2 封面页组件

```typescript
// components/export/cover-page.tsx
export function CoverPage({ cover, config }: { cover: ProjectCover, config: ExportConfig }) {
  const coverStyle: React.CSSProperties = {}

  // 背景图片处理
  if (cover.coverImage?.url && cover.coverImage.position === 'background') {
    coverStyle.backgroundImage = `url(${cover.coverImage.url})`
    coverStyle.backgroundSize = 'cover'
    coverStyle.backgroundPosition = 'center'
    if (cover.coverImage.opacity) {
      coverStyle.opacity = cover.coverImage.opacity
    }
  }

  return (
    <div className="cover-page w-[210mm] h-[297mm] bg-white flex flex-col justify-center items-center p-[25mm] relative">
      {/* 背景图片 */}
      {cover.coverImage?.url && cover.coverImage.position === 'background' && (
        <div style={coverStyle} className="absolute inset-0 -z-10" />
      )}

      {/* 封面图片 */}
      {cover.coverImage?.url && cover.coverImage.position === 'cover' && (
        <div className="w-[140mm] h-[100mm] mb-8 relative">
          <img
            src={cover.coverImage.url}
            alt="封面"
            className="w-full h-full object-cover rounded-lg shadow-xl"
            style={{ opacity: cover.coverImage.opacity }}
          />
        </div>
      )}

      {/* 标题 */}
      <h1 className="text-6xl font-bold text-center mb-4">
        {cover.title}
      </h1>

      {/* 副标题 */}
      {cover.subtitle && (
        <h2 className="text-2xl text-gray-600 text-center mb-8">
          {cover.subtitle}
        </h2>
      )}

      {/* 集数信息 */}
      {cover.episodeInfo && config.cover.showEpisodeInfo && (
        <div className="text-lg text-gray-500 mb-8">
          第 {cover.episodeInfo.current} / {cover.episodeInfo.total} 集
        </div>
      )}

      {/* 编剧 */}
      {config.cover.showWriters && cover.writers.length > 0 && (
        <div className="text-lg text-gray-600 mb-12">
          编剧：{cover.writers.join('、')}
        </div>
      )}

      {/* 版本信息 */}
      {cover.version && config.cover.showVersion && (
        <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-400">
          <div>{cover.version.label}</div>
          <div>{formatDate(cover.version.date)}</div>
          {cover.version.notes && (
            <div className="mt-2 italic">{cover.version.notes}</div>
          )}
        </div>
      )}

      {/* 类型标签 */}
      {cover.projectMetadata.genre.length > 0 && (
        <div className="absolute top-8 right-8 flex gap-2">
          {cover.projectMetadata.genre.map(genre => (
            <span
              key={genre}
              className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2.3 封面编辑器

```typescript
// components/export/cover-editor.tsx
export function CoverEditor({ cover, onChange }: { cover: ProjectCover, onChange: (cover: ProjectCover) => void }) {
  return (
    <div className="space-y-6">
      {/* 封面图片选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          封面图片
        </label>
        <ImagePicker
          currentImage={cover.coverImage?.url}
          onSelect={(url) => onChange({
            ...cover,
            coverImage: { ...cover.coverImage, url }
          })}
        />
      </div>

      {/* 图片位置 */}
      {cover.coverImage?.url && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片位置
          </label>
          <div className="flex gap-2">
            {(['cover', 'background', 'none'] as const).map(position => (
              <button
                key={position}
                onClick={() => onChange({
                  ...cover,
                  coverImage: { ...cover.coverImage, position }
                })}
                className={`
                  px-4 py-2 rounded-lg
                  ${cover.coverImage.position === position
                    ? 'bg-brand-gold text-white'
                    : 'bg-gray-100 text-gray-600'}
                `}
              >
                {position === 'cover' ? '封面居中' :
                 position === 'background' ? '背景铺满' : '不显示'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 图片透明度 */}
      {cover.coverImage?.url && cover.coverImage.position !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            透明度
          </label>
          <Slider
            value={cover.coverImage.opacity || 1}
            onChange={(opacity) => onChange({
              ...cover,
              coverImage: { ...cover.coverImage, opacity }
            })}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      )}

      {/* 封面元素开关 */}
      <div className="space-y-3">
        <Checkbox
          label="显示标题"
          checked={true}
          disabled  // 标题始终显示
        />
        <Checkbox
          label="显示集数"
          checked={!!cover.episodeInfo}
          onChange={(checked) => onChange({
            ...cover,
            episodeInfo: checked ? { current: 1, total: 80 } : undefined
          })}
        />
        <Checkbox
          label="显示编剧"
          checked={cover.writers.length > 0}
          onChange={(checked) => onChange({
            ...cover,
            writers: checked ? ['编剧姓名'] : []
          })}
        />
        <Checkbox
          label="显示版本信息"
          checked={!!cover.version}
          onChange={(checked) => onChange({
            ...cover,
            version: checked ? {
              label: '初稿',
              date: new Date()
            } : undefined
          })}
        />
      </div>
    </div>
  )
}
```

---

## 三、导出范围选择系统

### 3.1 范围选择组件

```typescript
// components/export/range-selector.tsx
export function RangeSelector({ range, onChange }: { range: ExportRange, onChange: (range: ExportRange) => void }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        导出范围
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* 全部内容 */}
        <RangeButton
          label="全部内容"
          icon={FileText}
          selected={range.type === ExportRangeType.ALL}
          onClick={() => onChange({ type: ExportRangeType.ALL })}
        />

        {/* 页数范围 */}
        <RangeButton
          label="页数范围"
          icon={File}
          selected={range.type === ExportRangeType.PAGE_RANGE}
          onClick={() => onChange({
            type: ExportRangeType.PAGE_RANGE,
            pageStart: 1,
            pageEnd: 10
          })}
        />

        {/* 集数范围 */}
        <RangeButton
          label="集数范围"
          icon={Layers}
          selected={range.type === ExportRangeType.EPISODE_RANGE}
          onClick={() => onChange({
            type: ExportRangeType.EPISODE_RANGE,
            episodeStart: 1,
            episodeEnd: 10
          })}
        />

        {/* 场数范围 */}
        <RangeButton
          label="场数范围"
          icon={Clapperboard}
          selected={range.type === ExportRangeType.SCENE_RANGE}
          onClick={() => onChange({
            type: ExportRangeType.SCENE_RANGE,
            sceneStart: 1,
            sceneEnd: 50
          })}
        />

        {/* 前N页（样张） */}
        <RangeButton
          label="前N页"
          icon={Scissors}
          selected={range.type === ExportRangeType.FIRST_N_PAGES}
          onClick={() => onChange({
            type: ExportRangeType.FIRST_N_PAGES,
            firstN: 5
          })}
        />

        {/* 前N场（样张） */}
        <RangeButton
          label="前N场"
          icon={Scissors}
          selected={range.type === ExportRangeType.FIRST_N_SCENES}
          onClick={() => onChange({
            type: ExportRangeType.FIRST_N_SCENES,
            firstN: 10
          })}
        />
      </div>

      {/* 范围参数输入 */}
      {range.type === ExportRangeType.PAGE_RANGE && (
        <div className="flex items-center gap-2 mt-4">
          <Input
            type="number"
            value={range.pageStart || 1}
            onChange={(e) => onChange({ ...range, pageStart: parseInt(e.target.value) })}
            className="w-20"
          />
          <span>至</span>
          <Input
            type="number"
            value={range.pageEnd || 10}
            onChange={(e) => onChange({ ...range, pageEnd: parseInt(e.target.value) })}
            className="w-20"
          />
          <span className="text-sm text-gray-500">页</span>
        </div>
      )}

      {/* 其他范围类型类似... */}
    </div>
  )
}

function RangeButton({ label, icon: Icon, selected, onClick }: {
  label: string
  icon: LucideIcon
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
        ${selected
          ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
          : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
```

### 3.2 内容提取器

```typescript
// lib/export/content-extractor.ts
export class ContentExtractor {
  /**
   * 根据范围配置提取内容
   */
  static async extract(
    fullContent: TipTapDocument,
    range: ExportRange,
    metadata: ProjectMetadata
  ): Promise<TipTapDocument> {
    switch (range.type) {
      case ExportRangeType.ALL:
        return fullContent

      case ExportRangeType.PAGE_RANGE:
        return this.extractByPageRange(fullContent, range.pageStart!, range.pageEnd!)

      case ExportRangeType.EPISODE_RANGE:
        return this.extractByEpisodeRange(fullContent, range.episodeStart!, range.episodeEnd!)

      case ExportRangeType.SCENE_RANGE:
        return this.extractBySceneRange(fullContent, range.sceneStart!, range.sceneEnd!)

      case ExportRangeType.FIRST_N_PAGES:
        return this.extractFirstNPages(fullContent, range.firstN!)

      case ExportRangeType.FIRST_N_SCENES:
        return this.extractFirstNScenes(fullContent, range.firstN!)

      default:
        throw new Error(`Unknown range type: ${range.type}`)
    }
  }

  /**
   * 按页数范围提取
   */
  private static extractByPageRange(
    content: TipTapDocument,
    startPage: number,
    endPage: number
  ): TipTapDocument {
    // 计算每页平均行数
    const avgLinesPerPage = 25
    const startLine = (startPage - 1) * avgLinesPerPage
    const endLine = endPage * avgLinesPerPage

    const lines = content.content?.filter(node => {
      // 简化版：按节点数量估算
      // 实际应计算渲染后的页数
      return true
    }) || []

    return {
      ...content,
      content: lines.slice(startLine, endLine)
    }
  }

  /**
   * 按集数范围提取
   */
  private static extractByEpisodeRange(
    content: TipTapDocument,
    startEpisode: number,
    endEpisode: number
  ): TipTapDocument {
    const scenes = content.content?.filter(node => {
      if (node.type === 'sceneHeading') {
        const match = node.attrs?.number?.match(/(\d+)-(\d+)/)
        if (match) {
          const episode = parseInt(match[1])
          return episode >= startEpisode && episode <= endEpisode
        }
      }
      return true  // 保留非场景标题节点
    }) || []

    return { ...content, content: scenes }
  }

  /**
   * 按场数范围提取
   */
  private static extractBySceneRange(
    content: TipTapDocument,
    startScene: number,
    endScene: number
  ): TipTapDocument {
    let currentScene = 0
    const result: any[] = []
    let inRange = false

    for (const node of content.content || []) {
      if (node.type === 'sceneHeading') {
        currentScene++
        inRange = currentScene >= startScene && currentScene <= endScene
      }

      if (inRange || node.type === 'sceneHeading') {
        result.push(node)
      }
    }

    return { ...content, content: result }
  }

  /**
   * 提取前N页
   */
  private static extractFirstNPages(
    content: TipTapDocument,
    n: number
  ): TipTapDocument {
    return this.extractByPageRange(content, 1, n)
  }

  /**
   * 提取前N场
   */
  private static extractFirstNScenes(
    content: TipTapDocument,
    n: number
  ): TipTapDocument {
    return this.extractBySceneRange(content, 1, n)
  }
}
```

---

## 四、防盗版导出系统

### 4.1 纯图PDF导出器

```typescript
// lib/export/image-pdf-exporter.ts
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export class ImagePDFExporter {
  /**
   * 导出为纯图PDF
   */
  static async export(
    content: TipTapDocument,
    config: ExportConfig,
    cover?: ProjectCover
  ): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // 1. 渲染封面页
    if (config.cover.enable && cover) {
      const coverElement = this.renderCover(cover)
      const coverImage = await this.htmlToImage(coverElement, config.protection)
      doc.addImage(coverImage, 'PNG', 0, 0, 210, 297)
      doc.addPage()
    }

    // 2. 渲染剧本内容页
    const pages = this.splitContentIntoPages(content)
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // 添加水印
      const watermarkedPage = this.addWatermark(page, config.protection.watermark)

      // 添加样张标记
      const markedPage = this.addSampleMark(watermarkedPage, config.protection.sampleMark)

      // 转换为图片
      const pageImage = await this.htmlToImage(markedPage, config.protection)

      // 添加到PDF
      if (i > 0) doc.addPage()
      doc.addImage(pageImage, 'PNG', 0, 0, 210, 297)
    }

    // 3. 生成PDF Blob
    return doc.output('blob')
  }

  /**
   * 渲染封面页为DOM
   */
  private static renderCover(cover: ProjectCover): HTMLElement {
    const container = document.createElement('div')
    container.className = 'w-[210mm] h-[297mm] bg-white flex flex-col justify-center items-center p-[25mm]'

    // 渲染封面内容...
    // (实际实现会将 React 组件渲染为 DOM)

    return container
  }

  /**
   * 将内容分割为页面
   */
  private static splitContentIntoPages(content: TipTapDocument): HTMLElement[] {
    const pages: HTMLElement[] = []
    const currentPage = document.createElement('div')
    currentPage.className = 'w-[210mm] min-h-[297mm] bg-white p-[25mm]'

    let currentHeight = 0
    const maxHeight = 297 - 25.4 * 2  // A4高度减去页边距

    // 遍历内容节点
    for (const node of content.content || []) {
      const element = this.renderNode(node)
      const elementHeight = this.estimateHeight(element)

      if (currentHeight + elementHeight > maxHeight) {
        // 当前页已满，开始新页
        pages.push(currentPage)
        const newPage = document.createElement('div')
        newPage.className = 'w-[210mm] min-h-[297mm] bg-white p-[25mm]'
        newPage.appendChild(element)
        currentPage = newPage
        currentHeight = elementHeight
      } else {
        // 添加到当前页
        currentPage.appendChild(element)
        currentHeight += elementHeight
      }
    }

    if (currentPage.children.length > 0) {
      pages.push(currentPage)
    }

    return pages
  }

  /**
   * 渲染单个节点
   */
  private static renderNode(node: any): HTMLElement {
    const element = document.createElement('div')

    switch (node.type) {
      case 'sceneHeading':
        element.className = 'text-lg font-bold uppercase mb-4'
        element.textContent = node.content?.[0]?.text || ''
        break

      case 'action':
        element.className = 'text-left mb-2'
        element.textContent = node.content?.[0]?.text || ''
        break

      case 'character':
        element.className = 'text-center font-bold uppercase mb-1'
        element.textContent = node.content?.[0]?.text || ''
        break

      case 'dialogue':
        element.className = 'text-center max-w-2xl mx-auto mb-2'
        element.textContent = node.content?.[0]?.text || ''
        break

      default:
        element.textContent = node.content?.[0]?.text || ''
    }

    return element
  }

  /**
   * 估算元素高度
   */
  private static estimateHeight(element: HTMLElement): number {
    // 简化版：返回估算值
    // 实际应测量元素的实际渲染高度
    const textLength = element.textContent?.length || 0
    return Math.ceil(textLength / 50) * 5  // 每50字符约5mm
  }

  /**
   * 添加水印
   */
  private static addWatermark(
    page: HTMLElement,
    watermark?: WatermarkConfig
  ): HTMLElement {
    if (!watermark) return page

    const watermarkElement = document.createElement('div')
    watermarkElement.className = 'absolute inset-0 flex items-center justify-center pointer-events-none'
    watermarkElement.style.opacity = watermark.opacity.toString()

    const watermarkText = document.createElement('div')
    watermarkText.className = 'text-6xl font-bold text-gray-300 transform -rotate-30'
    watermarkText.style.transform = `rotate(${watermark.rotation}deg)`
    watermarkText.textContent = watermark.text

    if (watermark.position === 'center') {
      watermarkElement.appendChild(watermarkText)
    } else {
      // 角落水印
      watermarkElement.className += ' justify-end items-end p-8'
      watermarkText.className = 'text-2xl'
      watermarkElement.appendChild(watermarkText)
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'relative'
    wrapper.appendChild(page.cloneNode(true))
    wrapper.appendChild(watermarkElement)

    return wrapper
  }

  /**
   * 添加样张标记
   */
  private static addSampleMark(
    page: HTMLElement,
    sampleMark?: SampleMarkConfig
  ): HTMLElement {
    if (!sampleMark?.enable) return page

    const mark = document.createElement('div')
    mark.className = 'text-center text-sm text-red-500 font-bold'
    mark.textContent = sampleMark.text

    if (sampleMark.position === 'header' || sampleMark.position === 'both') {
      const headerMark = mark.cloneNode(true) as HTMLElement
      page.insertBefore(headerMark, page.firstChild)
    }

    if (sampleMark.position === 'footer' || sampleMark.position === 'both') {
      const footerMark = mark.cloneNode(true) as HTMLElement
      page.appendChild(footerMark)
    }

    return page
  }

  /**
   * 将HTML转换为图片
   */
  private static async htmlToImage(
    element: HTMLElement,
    protection: ProtectionConfig
  ): Promise<string> {
    // 使用 html2canvas 将 DOM 转换为 canvas
    const canvas = await html2canvas(element, {
      scale: 2,  // 提高清晰度
      useCORS: true,
      logging: false,
    })

    return canvas.toDataURL('image/png')
  }
}
```

### 4.2 只读Word导出器

```typescript
// lib/export/word-readonly-exporter.ts
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export class WordReadOnlyExporter {
  /**
   * 导出为只读Word文档
   */
  static async export(
    content: TipTapDocument,
    config: ExportConfig,
    cover?: ProjectCover
  ): Promise<Blob> {
    // 1. 创建Word文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: this.buildDocumentChildren(content, cover, config)
      }]
    })

    // 2. 打包为Blob
    const blob = await Packer.toBlob(doc)

    // 3. 添加密码保护（需要后端处理或使用第三方库）
    // 注意：docx.js 不直接支持密码保护
    // 解决方案：
    // a. 使用 mammoth 生成后，通过 Python/Node.js 后端添加密码
    // b. 使用在线服务（如 CloudConvert）
    // c. 提示用户手动设置密码

    return blob
  }

  /**
   * 构建文档内容
   */
  private static buildDocumentChildren(
    content: TipTapDocument,
    cover?: ProjectCover,
    config?: ExportConfig
  ): Paragraph[] {
    const children: Paragraph[] = []

    // 1. 封面页
    if (cover && config?.cover.enable) {
      children.push(
        new Paragraph({
          text: cover.title,
          heading: 'Title1',
          alignment: 'center',
          spacing: { after: 400 }
        })
      )

      if (cover.subtitle) {
        children.push(
          new Paragraph({
            text: cover.subtitle,
            alignment: 'center',
            spacing: { after: 400 }
          })
        )
      }

      if (cover.episodeInfo) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `第 ${cover.episodeInfo.current} / ${cover.episodeInfo.total} 集`,
                italics: true
              })
            ],
            alignment: 'center',
            spacing: { after: 400 }
          })
        )
      }

      // 分页符
      children.push(
        new Paragraph({
          children: [],
          pageBreakBefore: true
        })
      )
    }

    // 2. 剧本内容
    for (const node of content.content || []) {
      switch (node.type) {
        case 'sceneHeading':
          children.push(
            new Paragraph({
              text: node.content?.[0]?.text || '',
              heading: 'Heading2',
              spacing: { before: 200, after: 200 }
            })
          )
          break

        case 'action':
          children.push(
            new Paragraph({
              text: node.content?.[0]?.text || '',
              spacing: { after: 100 }
            })
          )
          break

        case 'character':
          children.push(
            new Paragraph({
              text: node.content?.[0]?.text || '',
              alignment: 'center',
              bold: true,
              spacing: { before: 100, after: 50 }
            })
          )
          break

        case 'dialogue':
          children.push(
            new Paragraph({
              text: node.content?.[0]?.text || '',
              alignment: 'center',
              indent: { left: 7200 },  // 约2.5英寸缩进
              spacing: { after: 100 }
            })
          )
          break
      }
    }

    return children
  }

  /**
   * 添加水印（Word格式）
   */
  private static addWatermarkToDoc(
    doc: Document,
    watermark: WatermarkConfig
  ): Document {
    // docx.js 不直接支持水印
    // 需要手动操作 Word XML 或使用后端处理

    // 临时方案：在每页添加透明文字
    // 实际生产中应使用专业库

    return doc
  }
}
```

### 4.3 后端密码保护服务

```typescript
// app/api/export/word-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { parseString, Builder } from 'xml2js'

/**
 * 为Word文档添加密码保护
 * 通过修改 docx 文件的 settings.xml
 */
export async function POST(request: NextRequest) {
  const { file, password } = await request.json()

  try {
    // 1. 解压 docx 文件
    const zip = await JSZip.loadAsync(file)

    // 2. 读取 settings.xml
    const settingsXml = await zip.file('word/settings.xml')?.async('string')

    if (!settingsXml) {
      throw new Error('settings.xml not found')
    }

    // 3. 解析 XML
    const settings = await parseStringPromise(settingsXml)

    // 4. 添加密码保护
    // 注意：这只是基础保护，真正的密码保护需要更多配置
    settings['w:settings'] = settings['w:settings'] || {}
    settings['w:settings']['w:documentProtection'] = {
      $: {
        'w:edit': 'readOnly',
        'w:enforcement': '1',
        'w:cryptProviderType': 'rsaAES',
        'w:hash': Math.random().toString(36).substring(7),  // 简化版
        'w:salt': Math.random().toString(36).substring(7),
        'w:cryptAlgorithmClass': 'AES',
        'w:cryptSpinCount': '100000',
        'w:cryptAlgorithmSid': '14',
      }
    }

    // 5. 重新生成 XML
    const newSettingsXml = new Builder({ renderOpts: { pretty: false } })
      .buildObject(settings)

    // 6. 更新 zip
    zip.file('word/settings.xml', newSettingsXml)

    // 7. 生成新的 docx
    const protectedFile = await zip.generateAsync({ type: 'blob' })

    return NextResponse.json({
      success: true,
      file: protectedFile
    })

  } catch (error) {
    console.error('Password protection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add password protection'
    }, { status: 500 })
  }
}
```

---

## 五、导出对话框UI

### 5.1 导出对话框组件

```typescript
// components/export/export-dialog.tsx
export function ExportDialog({ open, onClose, project }: ExportDialogProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: ScriptFormat.CHINESE,
    fileType: FileType.PDF,
    range: { type: ExportRangeType.ALL },
    cover: {
      enable: true,
      useProjectCover: true,
      showTitle: true,
      showEpisodeInfo: true,
      showWriters: true,
      showVersion: false
    },
    protection: {
      enableImagePDF: false,
      enableWordPassword: false,
      watermark: {
        text: project.name,
        opacity: 0.1,
        position: 'center',
        rotation: -30
      }
    },
    metadata: {
      projectId: project.id,
      projectName: project.name,
      exportDate: new Date()
    }
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // 根据配置选择导出器
      let blob: Blob

      if (config.fileType === FileType.IMAGE_PDF) {
        blob = await ImagePDFExporter.export(
          project.scriptContent,
          config,
          project.cover
        )
      } else if (config.fileType === FileType.WORD_READONLY) {
        blob = await WordReadOnlyExporter.export(
          project.scriptContent,
          config,
          project.cover
        )
      } else {
        // 标准导出
        blob = await StandardExporter.export(
          project.scriptContent,
          config,
          project.cover
        )
      }

      // 下载文件
      const filename = generateFilename(config)
      saveAs(blob, filename)

      setIsExporting(false)
      onClose()

    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
      // 显示错误提示
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导出剧本</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* 左侧：格式和文件类型选择 */}
          <div className="space-y-6">
            {/* 格式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                剧本格式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <FormatButton
                  label="中文短剧格式v2.0"
                  description="包含△符号，符合国内规范"
                  selected={config.format === ScriptFormat.CHINESE}
                  onClick={() => setConfig({
                    ...config,
                    format: ScriptFormat.CHINESE
                  })}
                />
                <FormatButton
                  label="Fountain国际格式"
                  description="标准剧本格式，便于国际交流"
                  selected={config.format === ScriptFormat.FOUNTAIN}
                  onClick={() => setConfig({
                    ...config,
                    format: ScriptFormat.FOUNTAIN
                  })}
                />
              </div>
            </div>

            {/* 文件类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                文件类型
              </label>
              <div className="space-y-2">
                <FileTypeOption
                  type={FileType.PDF}
                  label="PDF文档"
                  description="标准PDF，适合打印和阅读"
                  icon={FileText}
                  selected={config.fileType === FileType.PDF}
                  available={[ScriptFormat.CHINESE, ScriptFormat.FOUNTAIN]}
                  currentFormat={config.format}
                  onClick={() => setConfig({ ...config, fileType: FileType.PDF })}
                />
                <FileTypeOption
                  type={FileType.WORD}
                  label="Word文档"
                  description="可编辑的Word格式"
                  icon={File}
                  selected={config.fileType === FileType.WORD}
                  available={[ScriptFormat.CHINESE, ScriptFormat.FOUNTAIN]}
                  currentFormat={config.format}
                  onClick={() => setConfig({ ...config, fileType: FileType.WORD })}
                />
                <FileTypeOption
                  type={FileType.TEXT}
                  label="纯文本"
                  description="UTF-8编码的纯文本文件"
                  icon={FileText}
                  selected={config.fileType === FileType.TEXT}
                  available={[ScriptFormat.CHINESE, ScriptFormat.FOUNTAIN]}
                  currentFormat={config.format}
                  onClick={() => setConfig({ ...config, fileType: FileType.TEXT })}
                />
                <FileTypeOption
                  type={FileType.IMAGE_PDF}
                  label="纯图PDF（防盗版）"
                  description="转换为图片，无法复制文字"
                  icon={Lock}
                  selected={config.fileType === FileType.IMAGE_PDF}
                  available={[ScriptFormat.CHINESE]}
                  currentFormat={config.format}
                  onClick={() => setConfig({ ...config, fileType: FileType.IMAGE_PDF })}
                  pro
                />
                <FileTypeOption
                  type={FileType.WORD_READONLY}
                  label="只读Word（防盗版）"
                  description="密码保护，防止修改"
                  icon={Lock}
                  selected={config.fileType === FileType.WORD_READONLY}
                  available={[ScriptFormat.CHINESE]}
                  currentFormat={config.format}
                  onClick={() => setConfig({ ...config, fileType: FileType.WORD_READONLY })}
                  pro
                />
              </div>
            </div>
          </div>

          {/* 右侧：其他配置 */}
          <div className="space-y-6">
            {/* 范围选择 */}
            <RangeSelector
              range={config.range}
              onChange={(range) => setConfig({ ...config, range })}
            />

            {/* 封面配置 */}
            <CollapsibleSection title="封面页">
              <CoverEditor
                cover={project.cover}
                onChange={(cover) => setConfig({
                  ...config,
                  cover: { ...config.cover, ...cover }
                })}
              />
            </CollapsibleSection>

            {/* 防盗版配置 */}
            <CollapsibleSection title="防盗版设置">
              <ProtectionEditor
                config={config.protection}
                onChange={(protection) => setConfig({ ...config, protection })}
              />
            </CollapsibleSection>
          </div>
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出剧本
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 5.2 防盗版设置编辑器

```typescript
// components/export/protection-editor.tsx
export function ProtectionEditor({
  config,
  onChange
}: {
  config: ProtectionConfig
  onChange: (config: ProtectionConfig) => void
}) {
  return (
    <div className="space-y-4">
      {/* 防盗版开关 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium">启用防盗版功能</div>
          <div className="text-sm text-gray-500">
            保护您的剧本不被非法复制
          </div>
        </div>
        <Switch
          checked={config.enableImagePDF || config.enableWordPassword}
          onCheckedChange={(checked) => onChange({
            ...config,
            enableImagePDF: checked,
            enableWordPassword: checked
          })}
        />
      </div>

      {/* 水印配置 */}
      {(config.enableImagePDF || config.enableWordPassword) && (
        <div className="space-y-3 pt-3 border-t">
          <label className="block text-sm font-medium text-gray-700">
            水印设置
          </label>

          <Input
            placeholder="水印文字"
            value={config.watermark?.text || ''}
            onChange={(e) => onChange({
              ...config,
              watermark: { ...config.watermark, text: e.target.value }
            })}
          />

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              透明度: {Math.round((config.watermark?.opacity || 0.1) * 100)}%
            </label>
            <Slider
              value={[config.watermark?.opacity || 0.1]}
              onValueChange={([opacity]) => onChange({
                ...config,
                watermark: { ...config.watermark, opacity }
              })}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              位置
            </label>
            <div className="flex gap-2">
              {(['center', 'corner'] as const).map(position => (
                <button
                  key={position}
                  onClick={() => onChange({
                    ...config,
                    watermark: { ...config.watermark, position }
                  })}
                  className={`
                    px-3 py-1.5 rounded text-sm
                    ${config.watermark?.position === position
                      ? 'bg-brand-gold text-white'
                      : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  {position === 'center' ? '居中' : '角落'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 样张标记 */}
      <CollapsibleSection title="样张标记">
        <div className="space-y-3">
          <Switch
            checked={config.sampleMark?.enable || false}
            onCheckedChange={(enable) => onChange({
              ...config,
              sampleMark: { ...config.sampleMark, enable }
            })}
          />
          <Input
            placeholder="标记文字"
            defaultValue="样张 - 仅供内部参考"
            onBlur={(e) => onChange({
              ...config,
              sampleMark: { ...config.sampleMark, text: e.target.value }
            })}
          />
          <div className="flex gap-2">
            {(['header', 'footer', 'both'] as const).map(position => (
              <button
                key={position}
                onClick={() => onChange({
                  ...config,
                  sampleMark: { ...config.sampleMark, position }
                })}
                className={`
                  px-3 py-1.5 rounded text-sm
                  ${config.sampleMark?.position === position
                    ? 'bg-brand-gold text-white'
                    : 'bg-gray-100 text-gray-600'}
                `}
              >
                {position === 'header' ? '页眉' :
                 position === 'footer' ? '页脚' : '页眉+页脚'}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
```

---

## 六、文件命名与下载

### 6.1 文件名生成器

```typescript
// lib/export/filename-generator.ts
export interface FilenameConfig {
  projectName: string
  format: ScriptFormat
  fileType: FileType
  range?: ExportRange
  version?: string
  date?: Date
}

export function generateFilename(config: FilenameConfig): string {
  const parts: string[] = []

  // 1. 项目名称
  parts.push(sanitizeFilename(config.projectName))

  // 2. 范围标识
  if (config.range && config.range.type !== ExportRangeType.ALL) {
    const rangeLabel = getRangeLabel(config.range)
    if (rangeLabel) parts.push(rangeLabel)
  }

  // 3. 版本标识
  if (config.version) {
    parts.push(config.version)
  }

  // 4. 日期
  const dateStr = formatDate(config.date || new Date())
  parts.push(dateStr)

  // 5. 扩展名
  const ext = getFileExtension(config.fileType)
  parts.push(ext)

  return parts.join('_')
}

function getRangeLabel(range: ExportRange): string | null {
  switch (range.type) {
    case ExportRangeType.FIRST_N_PAGES:
      return `前${range.firstN}页`
    case ExportRangeType.FIRST_N_SCENES:
      return `前${range.firstN}场`
    case ExportRangeType.PAGE_RANGE:
      return `P${range.pageStart}-${range.pageEnd}`
    case ExportRangeType.EPISODE_RANGE:
      return `E${range.episodeStart}-${range.episodeEnd}`
    case ExportRangeType.SCENE_RANGE:
      return `S${range.sceneStart}-${range.sceneEnd}`
    default:
      return null
  }
}

function sanitizeFilename(name: string): string {
  // 移除非法字符
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50)  // 限制长度
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function getFileExtension(type: FileType): string {
  switch (type) {
    case FileType.PDF:
    case FileType.IMAGE_PDF:
      return 'pdf'
    case FileType.WORD:
    case FileType.WORD_READONLY:
      return 'docx'
    case FileType.TEXT:
      return 'txt'
    default:
      return 'pdf'
  }
}
```

### 6.2 下载处理

```typescript
// lib/export/downloader.ts
import { saveAs } from 'file-saver'

export async function downloadFile(
  blob: Blob,
  filename: string,
  options?: {
    onProgress?: (progress: number) => void
  }
): Promise<void> {
  // 使用 file-saver 保存文件
  saveAs(blob, filename)

  // 如果需要进度跟踪，可以使用自定义实现
  if (options?.onProgress) {
    options.onProgress(100)
  }
}
```

---

## 七、验收标准

### 7.1 功能完整性

- [ ] 支持所有格式×文件类型组合
- [ ] 封面页可自定义（图片、位置、元素）
- [ ] 导出范围选择正常工作
- [ ] 防盗版功能生效（纯图PDF、只读Word）

### 7.2 用户体验

- [ ] 导出对话框清晰易懂
- [ ] 导出进度有反馈
- [ ] 文件名规范且有意义
- [ ] 错误处理友好

### 7.3 性能

- [ ] 纯图PDF导出时间 < 30s（100页）
- [ ] Word导出时间 < 10s（100页）
- [ ] 内存使用合理（< 500MB）

---

**让灵感，在剧本中苏醒** ✨
