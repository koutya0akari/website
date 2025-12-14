import type { MetadataRoute } from "next";

import { getDiaryEntries } from "@/lib/diary";
import { getWeeklyDiaryEntries } from "@/lib/weekly-diary";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.akari0koutya.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [diaries, weeklyDiaries] = await Promise.all([getDiaryEntries(1000), getWeeklyDiaryEntries(1000)]);

  const diaryUrls = diaries.map((diary) => ({
    url: `${SITE_URL}/diary/${diary.slug}`,
    lastModified: diary.updatedAt || diary.publishedAt,
  }));

  const weeklyDiaryUrls = weeklyDiaries.map((entry) => ({
    url: `${SITE_URL}/weekly-diary/${entry.slug}`,
    lastModified: entry.updatedAt || entry.publishedAt,
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
      url: `${SITE_URL}/weekly-diary`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date(),
    },
    ...diaryUrls,
    ...weeklyDiaryUrls,
  ];
}
