import type { MetadataRoute } from "next";

import { getDiaryEntries } from "@/lib/microcms";

const SITE_URL = "https://akari0koutya.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const diaries = await getDiaryEntries(1000);

  const diaryUrls = diaries.map((diary) => ({
    url: `${SITE_URL}/diary/${diary.slug}`,
    lastModified: diary.updatedAt || diary.publishedAt,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/diary`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date(),
    },
    ...diaryUrls,
  ];
}
