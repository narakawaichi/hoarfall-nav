"use client";

import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';

// 技术栈（页尾徽章）
const STACK = ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Font Awesome 6'];

// 赞助商 / 服务商
const RAINYUN_LOGO = 'https://www.rainyun.com/img/logo.d193755d.png';
const RAINYUN_LINK = 'https://www.rainyun.com/achen_';
const EDGEONE_LOGO = '/logos/edgeone-eo.svg'; // 自托管：腾讯云官方产品图标
const EDGEONE_LINK = 'https://edgeone.cloud.tencent.com/';

export default function SiteFooter() {
  // 开始时间：取自 siteConfig.buildDate —— 该值由后台(my-blog-manager)编辑后经“内容同步”覆盖到 siteConfig.ts
  const START_DATE = new Date(siteConfig.buildDate || '2026-03-23T00:00:00').getTime();
  const startYear = new Date(START_DATE).getFullYear();

  const [duration, setDuration] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - START_DATE;
      if (diff < 0) {
        setDuration('刚刚开始');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const mins = Math.floor((diff / 60000) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setDuration(`${days} 天 ${hours} 小时 ${mins} 分 ${secs} 秒`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [START_DATE]);

  return (
    <footer className="w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-7 transition-all duration-700 hover:shadow-indigo-500/10">
      {/* 第一行：运行时间 + 技术栈 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
          <span>
            本站已稳定运行
            <span className="text-indigo-600 dark:text-indigo-400 font-black tabular-nums ml-1">{duration || '--'}</span>
          </span>
        </div>

        {/* 技术栈徽章 */}
        <div className="flex flex-wrap gap-2">
          {STACK.map((name) => (
            <span
              key={name}
              className="px-2.5 py-1 bg-white/50 dark:bg-slate-700/50 rounded-md shadow-sm text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 transition-colors duration-300 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="my-5 border-t border-dashed border-white/50 dark:border-white/10"></div>

      {/* 第二行：服务支持（雨云 + 腾讯云 EdgeOne） */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300">
        {/* 雨云：图片上下居中、与文字平齐 */}
        <div className="flex items-center gap-1.5">
          <span>本站由</span>
          <a
            href={RAINYUN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            title="雨云 - 高性能云服务器"
            className="inline-flex items-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            <img
              src={RAINYUN_LOGO}
              alt="雨云"
              loading="lazy"
              className="h-[1.35em] w-auto object-contain select-none pointer-events-none"
            />
          </a>
          <span>提供服务支持</span>
        </div>

        {/* 腾讯云 EdgeOne：图片上下居中、与文字平齐 */}
        <div className="flex items-center gap-1.5">
          <span>本站安全防护已启用，由</span>
          <a
            href={EDGEONE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            title="腾讯云 EdgeOne"
            className="inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            <img
              src={EDGEONE_LOGO}
              alt="腾讯云 EdgeOne"
              loading="lazy"
              className="h-[1.2em] w-auto object-contain select-none pointer-events-none"
            />
            <span className="font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">腾讯云 EdgeOne</span>
          </a>
          <span>提供安全防护</span>
        </div>
      </div>

      {/* 第三行：版权与备案 */}
      <div className="mt-5 pt-3 border-t border-white/40 dark:border-white/10 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>© {startYear} {siteConfig.title}</span>
        <span className="hidden sm:inline text-slate-400 dark:text-slate-500">·</span>
        <span>把热爱的东西，一件件搭成现实</span>
        {siteConfig.icpConfig && (
          <>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">·</span>
            <a
              href={siteConfig.icpConfig.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-500 transition-colors border-b border-dashed border-slate-400 dark:border-slate-500 pb-0.5"
            >
              {siteConfig.icpConfig.name}
            </a>
          </>
        )}
      </div>
    </footer>
  );
}
