"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Feather, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface BaziData {
  year: string;
  month: string;
  day: string;
  hour: string;
  wuxing: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  rizhu: string;
}

interface JulingData {
  bazi: BaziData;
  name?: string;
}

// 八字计算动画组件
function BaziCalculationAnimation({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { text: "观测天象...", icon: Star },
    { text: "推算年柱...", icon: Sparkles },
    { text: "推算月柱...", icon: Sparkles },
    { text: "推算日柱...", icon: Sparkles },
    { text: "推算时柱...", icon: Sparkles },
    { text: "五行分析...", icon: Feather },
    { text: "命格生成完毕", icon: Star },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="relative">
        <motion.div
          className="w-32 h-32 rounded-full border-2 border-[#C9A962] flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#C9A962] rounded-full"
              style={{
                transform: `rotate(${i * 45}deg) translateX(60px)`,
              }}
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {(() => {
            const IconComponent = steps[step]?.icon || Star;
            return <IconComponent className="w-12 h-12 text-[#C9A962]" />;
          })()}
        </motion.div>
      </div>

      <div className="space-y-2 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg text-[#C9A962] font-display"
          >
            {steps[step]?.text}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-[#C9A962]" : "bg-[#D3C9B0]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 八字展示卡片
function BaziCertificate({ data }: { data: BaziData }) {
  const wuxingLabels: Record<string, string> = {
    wood: "木",
    fire: "火",
    earth: "土",
    metal: "金",
    water: "水",
  };

  const wuxingColors: Record<string, string> = {
    wood: "#7FA870",
    fire: "#C96262",
    earth: "#C9A962",
    metal: "#8B7355",
    water: "#7EA0C9",
  };

  return (
    <Card className="bg-gradient-to-br from-[#F5F1E8] to-white border-[#D3C9B0] overflow-hidden">
      <CardContent className="p-6">
        {/* 证书标题 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Feather className="w-5 h-5 text-[#C9A962]" />
            <span className="text-sm text-[#8B7355] tracking-widest">剧灵诞辰证书</span>
            <Feather className="w-5 h-5 text-[#C9A962]" />
          </div>
          <div className="w-16 h-0.5 bg-[#C9A962] mx-auto" />
        </div>

        {/* 八字 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "年柱", value: data.year },
            { label: "月柱", value: data.month },
            { label: "日柱", value: data.day },
            { label: "时柱", value: data.hour },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-white rounded-lg border border-[#D3C9B0]"
            >
              <div className="text-xs text-[#8B7355] mb-1">{item.label}</div>
              <div className="text-xl font-display font-bold text-[#1A1A1A]">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* 日主 */}
        <div className="text-center mb-6 p-4 bg-[#C9A962]/10 rounded-lg">
          <span className="text-sm text-[#8B7355]">日主：</span>
          <span className="text-lg font-display font-bold text-[#C9A962]">
            {data.rizhu}
          </span>
        </div>

        {/* 五行 */}
        <div className="space-y-3">
          <div className="text-sm text-[#8B7355] text-center mb-3">五行分析</div>
          {Object.entries(data.wuxing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: wuxingColors[key] }}
              >
                {wuxingLabels[key]}
              </span>
              <div className="flex-1 h-2 bg-[#D3C9B0]/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: wuxingColors[key] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <span className="text-sm text-[#5C5548] w-10 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BirthPage() {
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(true);
  const [julingName, setJulingName] = useState("");
  const [julingData, setJulingData] = useState<JulingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 生成八字数据
  useEffect(() => {
    // 模拟API调用
    const generateBazi = async () => {
      try {
        const response = await fetch("/api/juling/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp: Date.now() }),
        });

        if (!response.ok) {
          // 使用模拟数据
          setJulingData({
            bazi: {
              year: "甲辰",
              month: "丙寅",
              day: "戊午",
              hour: "庚申",
              wuxing: {
                wood: 25,
                fire: 30,
                earth: 20,
                metal: 15,
                water: 10,
              },
              rizhu: "戊土",
            },
          });
          return;
        }

        const data = await response.json();
        setJulingData(data);
      } catch (error) {
        // 使用模拟数据
        setJulingData({
          bazi: {
            year: "甲辰",
            month: "丙寅",
            day: "戊午",
            hour: "庚申",
            wuxing: {
              wood: 25,
              fire: 30,
              earth: 20,
              metal: 15,
              water: 10,
            },
            rizhu: "戊土",
          },
        });
      }
    };

    generateBazi();
  }, []);

  const handleCalculationComplete = () => {
    setIsCalculating(false);
  };

  const handleConfirmBirth = async () => {
    if (!julingName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/juling/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: julingName,
          ...julingData,
        }),
      });

      if (response.ok) {
        router.push("/juling/intro");
      } else {
        // 模拟成功，直接跳转
        router.push("/juling/intro");
      }
    } catch (error) {
      // 模拟成功，直接跳转
      router.push("/juling/intro");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] paper-texture">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A962]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-2">
            剧灵诞生
          </h1>
          <p className="text-[#8B7355]">天地为炉，造化为工，你的专属剧灵正在孕育...</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isCalculating ? (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BaziCalculationAnimation onComplete={handleCalculationComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {julingData && <BaziCertificate data={julingData.bazi} />}

              {/* 命名输入 */}
              <Card className="border-[#D3C9B0] bg-white">
                <CardContent className="p-6">
                  <label className="block text-sm text-[#8B7355] mb-2">
                    为你的剧灵起一个名字
                  </label>
                  <Input
                    value={julingName}
                    onChange={(e) => setJulingName(e.target.value)}
                    placeholder="例如：墨羽、青鸾、云笙..."
                    className="border-[#D3C9B0] focus:border-[#C9A962] focus:ring-[#C9A962]"
                    maxLength={10}
                  />
                  <p className="text-xs text-[#8B7355] mt-2">
                    好名字能让剧灵更有灵性，建议 2-4 个字
                  </p>
                </CardContent>
              </Card>

              {/* 确认按钮 */}
              <Button
                onClick={handleConfirmBirth}
                disabled={!julingName.trim() || isSubmitting}
                className="w-full h-14 bg-[#C9A962] hover:bg-[#A68A45] text-white font-display text-lg rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    确认诞生
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
