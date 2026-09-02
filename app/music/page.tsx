import { siteConfig } from "@/siteConfig";
import { buildMetadata } from "@/lib/seo";
import MusicClient from "./MusicClient";

// 这里是服务端渲染，完美支持 metadata
export const metadata = buildMetadata({ page: "music" });

export default function MusicPage() {
  return <MusicClient />;
}