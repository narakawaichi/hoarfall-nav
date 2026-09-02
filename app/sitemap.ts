import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const STATIC_ROUTES: { path: string; priority: number; freq: Freq }[] = [
  { path: "/", priority: 1.0, freq: "daily" },
  { path: "/posts", priority: 0.8, freq: "weekly" },
  { path: "/chatter", priority: 0.8, freq: "weekly" },
  { path: "/moments", priority: 0.7, freq: "weekly" },
  { path: "/photowall", priority: 0.6, freq: "monthly" },
  { path: "/music", priority: 0.5, freq: "monthly" },
  { path: "/friends", priority: 0.5, freq: "monthly" },
  { path: "/projects", priority: 0.5, freq: "monthly" },
  { path: "/timeline", priority: 0.5, freq: "monthly" },
  { path: "/about", priority: 0.4, freq: "monthly" },
  { path: "/tree", priority: 0.4, freq: "monthly" },
];

/** 读取某目录下所有 .md 的 slug 与日期，容忍目录不存在/为空 */
function readSlugs(dir: string): { slug: string; date: string }[] {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      try {
        const { data } = matter(fs.readFileSync(path.join(dirPath, f), "utf8"));
        return { slug: f.replace(/\.md$/, ""), date: String(data.date || "") };
      } catch {
        return { slug: f.replace(/\.md$/, ""), date: "" };
      }
    });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = readSlugs("posts").map(({ slug, date }) => ({
    url: `${SITE_URL}/posts/${slug}`,
    ...(date && date !== "1970-01-01" ? { lastModified: date } : {}),
    changeFrequency: "monthly" as Freq,
    priority: 0.7,
  }));

  const chatters = readSlugs("chatters").map(({ slug, date }) => ({
    url: `${SITE_URL}/chatter/${slug}`,
    ...(date && date !== "1970-01-01" ? { lastModified: date } : {}),
    changeFrequency: "weekly" as Freq,
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path: p, priority, freq }) => ({
      url: `${SITE_URL}${p === "/" ? "" : p}`,
      changeFrequency: freq,
      priority,
    })
  );

  return [...staticEntries, ...posts, ...chatters];
}
