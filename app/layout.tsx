import 'katex/dist/katex.min.css';
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import BackgroundEffects from "../components/BackgroundEffects";
import { MusicProvider } from "../components/MusicProvider";
import FloatingPlayer from "../components/FloatingPlayer";
import { siteConfig } from "../siteConfig";
import ClickEffect from "../components/ClickEffect";
import BackgroundSlider from "../components/BackgroundSlider";
import GlobalToolbox from "../components/GlobalToolbox";
import SplashScreen from "../components/SplashScreen";
import DanmakuBackground from '../components/DanmakuBackground';

import MobileBackButton from '../components/MobileBackButton';
import { SITE_URL } from "@/lib/seo";

// 全站动态渲染：内容(md)每次请求实时读取 → 后台同步后无需重新构建即可生效
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.seo.defaultKeywords,
  icons: {
    icon: siteConfig.faviconUrl,
    apple: siteConfig.faviconUrl,
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.title,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    url: SITE_URL,
    images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.ogImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.hoarfall.cn/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              #app-mount-root { opacity: 0; visibility: hidden; pointer-events: none; }
              html.splash-seen #app-mount-root { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }
            `
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('hasSeenSplash') === 'true') {
                  document.documentElement.classList.add('splash-seen');
                }
              } catch (e) {}
              // 兜底保险：无论任何原因（JS 异常/存储不可用），4 秒后强制解封内容，避免手机端永久白屏
              setTimeout(function () {
                document.documentElement.classList.add('splash-seen');
              }, 4000);
            `
          }}
        />
        {/* 📄 自定义页首 HTML 注入（siteConfig.headerHtml） */}
        {siteConfig.headerHtml ? (
          <div dangerouslySetInnerHTML={{ __html: siteConfig.headerHtml }} />
        ) : null}
      </head>

      <body className="w-screen overflow-x-hidden min-h-full flex flex-col relative transition-colors duration-1000 bg-slate-50 dark:bg-slate-950 font-serif">
        <ThemeProvider>

          <SplashScreen />

          <MusicProvider>
            <div id="app-mount-root" className="flex-1 flex flex-col transition-opacity duration-1000">
              <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                {!siteConfig.useGradient && <BackgroundSlider />}
                <div className="absolute inset-0 z-[-9] bg-white/30 dark:bg-slate-900/40 backdrop-blur-md transition-colors duration-1000"></div>

                {/*  仅在渐变模式下渲染流动渐变层；图片背景模式下不渲染，避免全屏重绘动画空转 */}
                {siteConfig.useGradient && (
                  <div
                    className="absolute inset-0 z-[-8] opacity-60 dark:opacity-20 mix-blend-color transition-opacity duration-1000 transform-gpu"
                    style={{
                      background: `linear-gradient(-45deg, ${siteConfig.themeColors.join(', ')})`,
                      backgroundSize: '400% 400%',
                      animation: 'gradientMove 15s ease infinite'
                    }}
                  ></div>
                )}

                {/*   优化：手机端去掉了 mix-blend-overlay，但保留了 blur 模糊光晕，确保视觉不打折 */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/40 dark:bg-indigo-900/20 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/30 dark:bg-purple-900/30 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>

                {/* 隐藏手机端高负载粒子特效 */}
                <div className="hidden md:block absolute inset-0 w-full h-full">
                  <BackgroundEffects />
                </div>
              </div>

              {/* 隐藏手机端弹幕 */}
              <div className="hidden md:block">
                <DanmakuBackground />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                {children}
              </div>

              <div className="hidden md:block">
                <FloatingPlayer />
              </div>

              <div className="hidden md:block">
                <GlobalToolbox />
              </div>

              <div className="md:hidden block">
                <MobileBackButton />
              </div>

              {/* 隐藏手机端点击粒子 */}
              <div className="hidden md:block">
                <ClickEffect />
              </div>
            </div>

            <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
              @keyframes gradientMove { 
                0% { background-position: 0% 50%; } 
                50% { background-position: 100% 50%; } 
                100% { background-position: 0% 50%; } 
              }
            `}} />
          </MusicProvider>

          {/* 📄 自定义页尾 HTML 注入（siteConfig.footerHtml） */}
          {siteConfig.footerHtml ? (
            <div dangerouslySetInnerHTML={{ __html: siteConfig.footerHtml }} />
          ) : null}

        </ThemeProvider>
      </body>
    </html>
  );
}