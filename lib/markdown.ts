/**
 * Markdown 渲染辅助：为正文中的 <img> 自动兜底 alt（rehype 插件，无额外依赖）
 * 优先级：作者显式写的 alt > 图片 title > 文件名（去扩展名/下划线转空格）> "图片"
 */

export function fillImageAlt(node: any): void {
  if (!node || typeof node !== "object") return;
  if (
    node.type === "element" &&
    node.tagName === "img" &&
    node.properties
  ) {
    if (!node.properties.alt) {
      const src = String(node.properties.src || "");
      const file = decodeURIComponent(
        src.split("/").pop()?.split("?")[0] || ""
      );
      const base = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      node.properties.alt =
        node.properties.title || base || "图片";
    }
  }
  if (Array.isArray(node.children)) node.children.forEach(fillImageAlt);
}

/** 供 unified .use() 使用的 rehype 插件形态 */
export const rehypeFillImageAlt = () => (tree: any) => {
  fillImageAlt(tree);
};
