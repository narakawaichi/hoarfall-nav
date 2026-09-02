import type { Metadata } from "next";
import { siteConfig } from "@/siteConfig";

export type SeoPageKey = keyof typeof siteConfig.seo.pages;

export type SeoPageRule = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalPath?: string;
};

/** 站点基准 URL（无尾斜杠），用于 canonical / sitemap / OG 绝对地址 */
export const SITE_URL = String(siteConfig.baseUrl || "").replace(/\/+$/, "");

export interface BuildMetadataOptions {
  page: SeoPageKey;
  /** 动态页覆盖标题（文章/杂谈标题） */
  title?: string;
  /** 动态页覆盖描述（摘要） */
  description?: string;
  /** 动态页覆盖关键词（tags） */
  keywords?: string[];
  /** canonical 路径，如 "/posts/xxx"；缺省用 "/" */
  canonicalPath?: string;
  /** OG 分享图，缺省用全局/规则 */
  ogImage?: string;
  /** 首页 true 时 title 直出，不追加 " | 站点名" 后缀 */
  absoluteTitle?: boolean;
  /** article 类型的发布时间（文章/杂谈日期） */
  publishedTime?: string;
}

/** 去除 Markdown 符号，截取纯文本（用于 description） */
export function stripMarkdown(text?: string, maxLen = 160): string {
  if (!text) return "";
  return text
    .replace(/!\[.*?\]\(.*?\)/g, " ") // 图片
    .replace(/[#>*`~\-_\[\]()|]/g, " ") // md 符号
    .replace(/<[^>]+>/g, " ") // 行内 html
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

/** 统一构建 Next Metadata（title/description/keywords/canonical/OG/Twitter） */
export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const rule = (siteConfig.seo.pages as Record<string, SeoPageRule>)[opts.page];
  const title = opts.title ?? rule?.title ?? siteConfig.title;
  const description =
    opts.description ?? rule?.description ?? siteConfig.seo.defaultDescription;
  const keywords = [
    ...(opts.keywords ?? rule?.keywords ?? siteConfig.seo.defaultKeywords),
  ];
  const ogImage = opts.ogImage ?? rule?.ogImage ?? siteConfig.seo.ogImage;
  const canonical = new URL(
    opts.canonicalPath ?? rule?.canonicalPath ?? "/",
    SITE_URL
  ).toString();
  const fullTitle = `${title} | ${siteConfig.title}`;
  const isArticle = opts.page === "post" || opts.page === "chatterDetail";

  return {
    // 非 absolute 时交给根 layout 的 title.template 追加 " | 站点名"
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      type: isArticle ? "article" : "website",
      url: canonical,
      siteName: siteConfig.title,
      title: opts.absoluteTitle ? title : fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(isArticle && opts.publishedTime
        ? { publishedTime: opts.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.absoluteTitle ? title : fullTitle,
      description,
      images: [ogImage],
    },
  };
}
