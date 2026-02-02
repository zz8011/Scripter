import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Noto_Serif_SC, Courier_Prime } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/providers/AppProviders";

/* ==================================================
   字体配置 Font Configuration
   ================================================== */

// UI 正文字体 - Inter + Noto Sans SC
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// 品牌标题字体 - Noto Serif SC
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// 编辑区字体 - Courier Prime (等宽字体)
const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/* ==================================================
   元数据配置 Metadata Configuration
   ================================================== */

export const metadata: Metadata = {
  title: "剧灵 Scripter - 让灵感，在剧本中苏醒",
  description: "AI 剧本创作平台 - 一支懂你的笔。专业的短剧编剧工具，支持剧本编辑、人物管理、场景规划、世界观设定和分镜制作。",
  keywords: ["剧本创作", "短剧编剧", "AI写作", "剧本编辑器", "编剧工具"],
  authors: [{ name: "Scripter Team" }],
  creator: "剧灵 Scripter",
  publisher: "scripter.art",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://scripter.art",
    title: "剧灵 Scripter - 让灵感，在剧本中苏醒",
    description: "AI 剧本创作平台 - 一支懂你的笔",
    siteName: "剧灵 Scripter",
  },
  twitter: {
    card: "summary_large_image",
    title: "剧灵 Scripter - 让灵感，在剧本中苏醒",
    description: "AI 剧本创作平台 - 一支懂你的笔",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

/* ==================================================
   根布局 Root Layout
   ================================================== */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Iconify Icons - 通过 CDN 加载 */}
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      </head>
      <body
        className={`${inter.variable} ${notoSansSC.variable} ${notoSerifSC.variable} ${courierPrime.variable} font-ui antialiased paper-texture`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
