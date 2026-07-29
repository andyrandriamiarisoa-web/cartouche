import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "monthly", priority: 1 },
    {
      url: new URL("/studio", base).toString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: new URL("/c/demo", base).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: new URL("/galerie", base).toString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
