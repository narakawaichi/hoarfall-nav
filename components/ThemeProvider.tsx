"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 默认设为 true，这样在读取到配置前，如果是夜间模式就不会闪烁
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 标记组件已挂载，避免 hydration 报错
    setMounted(true);

    // 从 localStorage 读取真实状态
    const savedTheme = localStorage.getItem('blog-theme');
    // 如果没有记录，默认给深色模式（流萤飞舞）
    const isDarkMode = savedTheme !== 'light';
    setIsDark(isDarkMode);

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // 极其重要：监听 isDark 状态，只要它变了，立刻强制更新 html 标签，防止路由切换丢失
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    const newDark = !isDark;
    // 切换瞬间：给 html 加 .theme-switching → CSS 里临时禁用所有 transition/backdrop-filter，
    //    避免 108 处毛玻璃+过渡同时做 1 秒渐变导致的卡顿。
    const root = document.documentElement;
    root.classList.add('theme-switching');
    setIsDark(newDark);
    localStorage.setItem('blog-theme', newDark ? 'dark' : 'light');
    // 切换完成后移除，恢复平滑过渡（需稍长于渐变，确保新色已经定下）
    window.setTimeout(() => root.classList.remove('theme-switching'), 350);
  };

  // 在客户端挂载完成前，为了防止闪屏，先隐藏内容
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);