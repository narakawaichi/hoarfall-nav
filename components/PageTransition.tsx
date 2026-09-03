"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // 只做轻微上移动画，绝不用 opacity 隐藏内容。
      // 原因：如果初始 opacity:0，SSR 会把透明样式写进 HTML，手机端 React 水合失败时
      // 内容会被永久卡在透明态（只看到背景和毛边玻璃）。始终可见才是安全底线。
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}