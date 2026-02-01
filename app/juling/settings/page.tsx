"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Feather, 
  Save, 
  Edit2, 
  ChevronLeft,
  RefreshCw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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

interface JulingConfig {
  name: string;
  bazi: BaziData;
  createdAt: string;
}

// 五行图表组件
function WuxingChart({ data }: { data: BaziData["wuxing"] }) {
  const wuxingData = [
    { key: "wood", label: "木", value: data.wood, color: "#7FA870" },
    { key: "fire", label: "火", value: data.fire, color: "#C96262" },
    { key: "earth", label: "土", value: data.earth, color: "#C9A962" },
    { key: "metal", label: "金", value: data.metal, color: "#8B7355" },
    { key: "water", label: "水", value: data.water, color: "#7EA0C9" },
  ];

  const maxValue = Math.max(...wuxingData.map((d) => d.value));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-4 h-48">
        {wuxingData.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-12 rounded-t-lg transition-all duration-300 hover:opacity-80"
              style={{ 
                backgroundColor: item.color,
                height: "100%",
              }}
            />
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4">
        {wuxingData.map((item) => (
          <div key={item.key} className="text-center w-12">
            <div
              className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: item.color }}
            >
              {item.label}
            </div>
            <span className="text-sm text-[#5C5548]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 八字详情卡片
function BaziDetailCard({ bazi }: { bazi: BaziData }) {
  const pillars = [
    { label: "年柱", value: bazi.year, meaning: "祖上根基" },
    { label: "月柱", value: bazi.month, meaning: "父母兄弟" },
    { label: "日柱", value: bazi.day, meaning: "自身配偶" },
    { label: "时柱", value: bazi.hour, meaning: "子女晚运" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {pillars.map((pillar, index) => (
        <motion.div
          key={pillar.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-4 bg-white rounded-lg border border-[#D3C9B0] hover:border-[#C9A962] transition-colors"
        >
          <div className="text-xs text-[#8B7355] mb-1">{pillar.label}</div>
          <div className="text-2xl font-display font-bold text-[#1A1A1A] mb-1">
            {pillar.value}
          </div>
          <div className="text-xs text-[#8B7355]">{pillar.meaning}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<JulingConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟获取配置数据
    const fetchConfig = async () => {
      try {
        // 实际项目中应该从API获取
        // const response = await fetch("/api/juling/config");
        // const data = await response.json();
        
        // 模拟数据
        const mockConfig: JulingConfig = {
          name: "墨羽",
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
          createdAt: "2026-02-01",
        };

        setTimeout(() => {
          setConfig(mockConfig);
          setNewName(mockConfig.name);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSaveName = async () => {
    if (!newName.trim() || newName === config?.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // 实际项目中应该调用API
      // await fetch("/api/juling/config", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name: newName }),
      // });

      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setConfig((prev) => prev ? { ...prev, name: newName } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    if (confirm("重新生成将重置当前剧灵的所有信息，确定要继续吗？")) {
      router.push("/juling/birth");
    }
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

  if (!config) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] paper-texture flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8B7355] mb-4">还没有创建剧灵</p>
          <Button
            onClick={() => router.push("/juling/birth")}
            className="bg-[#C9A962] hover:bg-[#A68A45] text-white"
          >
            创建剧灵
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] paper-texture">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#C9A962]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C9A962]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-[#8B7355] hover:text-[#1A1A1A] hover:bg-[#D3C9B0]/20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回
        </Button>

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-2">
            剧灵设置
          </h1>
          <p className="text-[#8B7355]">管理你的专属剧灵信息</p>
        </motion.div>

        <div className="space-y-6">
          {/* 基本信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[#D3C9B0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Feather className="w-5 h-5 text-[#C9A962]" />
                  剧灵名字
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 border-[#D3C9B0] focus:border-[#C9A962] focus:ring-[#C9A962]"
                        maxLength={10}
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveName}
                        disabled={isSaving || !newName.trim()}
                        className="bg-[#C9A962] hover:bg-[#A68A45] text-white"
                      >
                        {isSaving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-xl font-display text-[#1A1A1A]">
                        {config.name}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="border-[#D3C9B0] hover:border-[#C9A962] hover:text-[#C9A962]"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        修改
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#8B7355] mt-3">
                  诞生日期：{config.createdAt}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 八字详情卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-[#D3C9B0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-[#C9A962]" />
                  八字详情
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BaziDetailCard bazi={config.bazi} />
                
                <div className="p-4 bg-[#C9A962]/10 rounded-lg text-center">
                  <span className="text-sm text-[#8B7355]">日主：</span>
                  <span className="text-xl font-display font-bold text-[#C9A962] ml-2">
                    {config.bazi.rizhu}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 五行分析卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-[#D3C9B0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 via-yellow-400 to-blue-400" />
                  五行分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WuxingChart data={config.bazi.wuxing} />
              </CardContent>
            </Card>
          </motion.div>

          {/* 重新生成按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <Button
              variant="outline"
              onClick={handleRegenerate}
              className="w-full h-12 border-[#D3C9B0] text-[#8B7355] hover:text-[#C96262] hover:border-[#C96262]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成剧灵
            </Button>
            <p className="text-xs text-[#8B7355] text-center mt-2">
              重新生成将重置当前剧灵的所有信息
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
