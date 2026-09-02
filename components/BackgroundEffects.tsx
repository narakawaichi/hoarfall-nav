"use client";
import { useTheme } from './ThemeProvider';
import Fireflies from './Fireflies';
import Sakura from './Sakura';
import WindyGrass from './WindyGrass';

export default function BackgroundEffects() {
  const { isDark } = useTheme();

  return (
    <>
      {/* 核心魔法：根据 isDark 条件挂载，只跑一套动画。
           不能用 opacity:0 隐藏——opacity 不影响 CSS 动画执行，
          两套动画同时跑会占满性能，必须条件渲染只挂载其中一个。 */}
      {isDark ? <Fireflies key="night" /> : <Sakura key="day" />}

      {/* 草地一直存在，但它内部会自动改变颜色 */}
      <WindyGrass />
    </>
  );
}