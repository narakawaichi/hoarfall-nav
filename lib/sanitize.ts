// lib/sanitize.ts
// Markdown 渲染安全消毒：基于 hast-util-sanitize 的默认 GitHub schema，
// 剥离 script / iframe / 事件属性 / javascript: 协议等危险内容（存储型 XSS 防护）。
// 额外放开 class 属性，保留代码高亮（hljs）与 KaTeX 的样式类。
import { sanitize, defaultSchema } from "hast-util-sanitize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schema: any = {
  ...defaultSchema,
  attributes: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(defaultSchema as any).attributes,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "*": [...((defaultSchema as any).attributes["*"] || []), ["className"]],
  },
};

// rehype 插件：在 rehypeStringify 之前调用，返回净化后的 hast 树
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function rehypeSanitizeSafe() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => sanitize(tree, schema);
}
