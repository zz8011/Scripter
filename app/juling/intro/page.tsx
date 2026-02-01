"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Feather, Sparkles, MessageCircle, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JulingIntroData {
  name: string;
  poem: string[];
  personality: {
    title: string;
    description: string;
    traits: string[];
  };
  speakingStyle: string;
  cooperationStyle: string;
  wuxing: {
    dominant: string;
    secondary: string;
  };
}

// 诗号展示组件
function PoemDisplay({ lines }: { lines: string[] }) {
  return (
    <div className="relative py-8 px-6">
      {/* 装饰边框 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C9A962] to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C9A962] to-transparent" />
      
      <div className="space-y-4 text-center">
        {lines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="text-xl md:text-2xl font-display text-[#1A1A1A] tracking-wider"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

// 性格特质卡片
function PersonalityCard({ data }: { data: JulingIntroData["personality"] }) {
  return (
    <Card className="border-[#D3C9B0] bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#C9A962]" />
          <h3 className="text-lg font-display font-bold text-[#1A1A1A]">
            性格特质
          </h3>
        </div>
        
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-[#C9A962]/10 text-[#C9A962] rounded-full text-sm font-medium">
            {data.title}
          </span>
        </div>
        
        <p className="text-[#5C5548] mb-4 leading-relaxed">{data.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {data.traits.map((trait, index) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 + index * 0.1 }}
              className="px-3 py-1 bg-[#F5F1E8] text-[#8B7355] rounded-lg text-sm"
            >
              {trait}
            </motion.span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 风格展示卡片
function StyleCard({ 
  icon: Icon, 
  title, 
  description,
  delay 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="border-[#D3C9B0] bg-white h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C9A962]/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#C9A962]" />
            </div>
            <div>
              <h4 className="font-medium text-[#1A1A1A] mb-1">{title}</h4>
              <p className="text-sm text-[#5C5548] leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 五行徽章
function WuxingBadge({ type, label }: { type: string; label: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    wood: { bg: "bg-green-100", text: "text-green-700" },
    fire: { bg: "bg-red-100", text: "text-red-700" },
    earth: { bg: "bg-yellow-100", text: "text-yellow-700" },
    metal: { bg: "bg-gray-100", text: "text-gray-700" },
    water: { bg: "bg-blue-100", text: "text-blue-700" },
  };

  const color = colors[type] || colors.earth;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
      {label}
    </span>
  );
}

export default function IntroPage() {
  const router = useRouter();
  const [introData, setIntroData] = useState<JulingIntroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟获取剧灵介绍数据
    const fetchIntroData = async () => {
      try {
        // 实际项目中应该从API获取
        // const response = await fetch("/api/juling/config");
        // const data = await response.json();
        
        // 模拟数据
        const mockData: JulingIntroData = {
          name: "墨羽",
          poem: [
            "墨染青云意自闲",
            "羽化飞仙入梦间",
            "笔走龙蛇书万象",
            "心随剧韵舞流年",
          ],
          personality: {
            title: "温润如玉 · 才华横溢",
            description: "你的剧灵生性温和，如春风化雨，善于体察人心。在创作中，TA擅长细腻的情感刻画和人物关系的铺陈，能让故事充满温度与深度。",
            traits: ["细腻敏感", "善解人意", "富有创意", "耐心专注"],
          },
          speakingStyle: "说话温文尔雅，善用比喻和意象，语言优美流畅，富有诗意。在讨论剧本时，会引用经典作品，给出富有洞察力的建议。",
          cooperationStyle: "喜欢循序渐进地打磨作品，重视每一个细节。在合作中善于倾听，能够准确理解你的创作意图，并用专业的编剧知识帮你完善故事。",
          wuxing: {
            dominant: "wood",
            secondary: "fire",
          },
        };

        // 模拟延迟
        setTimeout(() => {
          setIntroData(mockData);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchIntroData();
  }, []);

  const handleStartJourney = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] paper-texture flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#C9A962] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!introData) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] paper-texture flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8B7355]">数据加载失败，请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] paper-texture">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* 剧灵名字 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Feather className="w-5 h-5 text-[#C9A962]" />
            <span className="text-sm text-[#8B7355] tracking-widest">你的专属剧灵</span>
            <Feather className="w-5 h-5 text-[#C9A962]" />
          </div>
          <h1 className="text-4xl font-display font-bold text-[#1A1A1A] mb-3">
            {introData.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <WuxingBadge type={introData.wuxing.dominant} label="主：木" />
            <WuxingBadge type={introData.wuxing.secondary} label="辅：火" />
          </div>
        </motion.div>

        {/* 诗号 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-[#D3C9B0] bg-gradient-to-b from-white to-[#F5F1E8]">
            <CardContent className="p-0">
              <PoemDisplay lines={introData.poem} />
            </CardContent>
          </Card>
        </motion.div>

        {/* 性格特质 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
          className="mb-6"
        >
          <PersonalityCard data={introData.personality} />
        </motion.div>

        {/* 说话风格与合作风格 */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <StyleCard
            icon={MessageCircle}
            title="说话风格"
            description={introData.speakingStyle}
            delay={3.2}
          />
          <StyleCard
            icon={Users}
            title="合作风格"
            description={introData.cooperationStyle}
            delay={3.4}
          />
        </div>

        {/* 开始按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6 }}
        >
          <Button
            onClick={handleStartJourney}
            className="w-full h-14 bg-[#C9A962] hover:bg-[#A68A45] text-white font-display text-lg rounded-xl transition-all duration-300 group"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            开始创作之旅
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
