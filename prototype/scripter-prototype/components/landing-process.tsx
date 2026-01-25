/* ==================================================
   着陆页创作流程组件
   ================================================== */

"use client"

const PROCESS_STEPS = [
  {
    id: 1,
    icon: "lucide:lightbulb",
    step: "STEP 01",
    title: "创意萌发与梗概",
    description: "输入核心概念，AI 协助生成三幕式大纲，快速确定故事基调与受众标签。",
    align: "left"
  },
  {
    id: 2,
    icon: "lucide:feather",
    step: "STEP 02",
    title: "智能填充与细化",
    description: "在剧本编辑区进行沉浸式写作，利用 AI 补全台词，实时校验人物性格一致性。",
    align: "right"
  },
  {
    id: 3,
    icon: "lucide:clapperboard",
    step: "STEP 03",
    title: "分镜预览与导出",
    description: "一键生成分镜建议脚本，导出符合行业规范的 PDF 或 Markdown 格式，准备开机。",
    align: "left"
  }
];

export function LandingProcess() {
  return (
    <section id="process" className="px-6 md:px-12 lg:px-24 py-32 relative">
      {/* Section Header */}
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-serif-display font-bold mb-4" style={{ color: 'var(--white-bg)' }}>
          从灵感到成品
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          标准化的短剧工业化生产路径
        </p>
      </div>

      {/* Process Timeline */}
      <div className="max-w-4xl mx-auto relative">
        {/* Vertical Line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(201, 169, 98, 0.5), transparent)'
          }}
        ></div>

        <div className="space-y-24 md:space-y-32">
          {PROCESS_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`relative flex flex-col ${
                step.align === "left" ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8 md:gap-0`}
            >
              {/* Content */}
              <div className={`md:w-1/2 ${step.align === "left" ? "md:pr-20 md:text-right" : "md:pl-20"}`}>
                <p className="mb-2" style={{ color: 'var(--brand-gold)', fontFamily: 'Courier Prime, monospace' }}>
                  {step.step}
                </p>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--white-bg)' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {step.description}
                </p>
              </div>

              {/* Center Icon */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  backgroundColor: 'var(--ink-black)',
                  border: '2px solid var(--brand-gold)'
                }}
              >
                <iconify-icon icon={step.icon} style={{ color: 'var(--brand-gold)' }}></iconify-icon>
              </div>

              {/* Visual Element */}
              <div className={`md:w-1/2 ${step.align === "left" ? "md:pl-20" : "md:pr-20"}`}>
                <div
                  className="p-6 rounded-xl border backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {step.id === 1 && (
                    <div className="space-y-2">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(201, 169, 98, 0.2)'
                        }}
                      ></div>
                      <div
                        className="h-2 rounded"
                        style={{
                          width: '75%',
                          backgroundColor: 'rgba(201, 169, 98, 0.1)'
                        }}
                      ></div>
                      <div
                        className="h-2 rounded"
                        style={{
                          width: '50%',
                          backgroundColor: 'rgba(201, 169, 98, 0.05)'
                        }}
                      ></div>
                    </div>
                  )}
                  {step.id === 2 && (
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      ></div>
                      <div className="space-y-2 w-full">
                        <div
                          className="h-2 rounded"
                          style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        ></div>
                        <div
                          className="h-2 rounded"
                          style={{ width: '66.66%', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {step.id === 3 && (
                    <div
                      className="p-6 rounded-xl border flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(201, 169, 98, 0.1)',
                        borderColor: 'rgba(201, 169, 98, 0.2)'
                      }}
                    >
                      <iconify-icon
                        icon="lucide:file-check"
                        className="text-4xl"
                        style={{ color: 'var(--brand-gold)' }}
                      ></iconify-icon>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
