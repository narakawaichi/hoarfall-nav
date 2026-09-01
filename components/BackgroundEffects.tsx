"use client";
import { useTheme } from './ThemeProvider';
import Fireflies from './Fireflies';
import Sakura from './Sakura';
import WindyGrass from './WindyGrass';

export default function BackgroundEffects() {
  const { isDark } = useTheme();

  return (
    <>
      {/* ⚠️ 关键：这里必须用条件渲染，不能用 opacity 切换。
          opacity:0 并不会停止 CSS 动画，浏览器照样每帧照常计算，
          那样昼夜两套特效会同时挂载、同时跑满，白白吃掉一半性能。 */}
      <style>{`@keyframes bgEffectFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        key={isDark ? 'night' : 'day'}
        style={{ animation: 'bgEffectFadeIn 1s ease-in-out' }}
      >
        {isDark ? <Fireflies /> : <Sakura />}
      </div>

      {/* 草地一直存在，但它内部会自动改变颜色 */}
      <WindyGrass />
    </>
  );
}