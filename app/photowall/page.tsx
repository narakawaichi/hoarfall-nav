import { siteConfig } from "../../siteConfig";
import { buildMetadata } from "@/lib/seo";
import PhotoWallClient from "./PhotoWallClient";

export const metadata = buildMetadata({ page: "photowall" });

export default function PhotoWallPage() {
  return <PhotoWallClient />;
}