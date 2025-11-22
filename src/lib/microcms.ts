import "server-only";

import { createClient } from "microcms-js-sdk";
import type { MicroCMSContentId, MicroCMSDate, MicroCMSQueries } from "microcms-js-sdk";

import type { AboutContent, DiaryEntry, ResourceItem, SiteContent } from "@/lib/types";
import { createExcerpt } from "@/lib/utils";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN ?? process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY ?? process.env.NEXT_PUBLIC_MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.warn("[microCMS] Missing serviceDomain or apiKey. Check environment variables.");
}

const client =
  serviceDomain && apiKey
    ? createClient({
        serviceDomain,
        apiKey,
      })
    : null;

type DiaryCMSResponse = {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  editer?: string;
  folder?: string;
  tags?: string[];
  heroImage?: DiaryEntry["heroImage"];
  viewCount?: number;
  views?: number;
  pageViews?: number;
  pv?: number;
} & MicroCMSContentId & MicroCMSDate;
type ResourceCMSResponse = ResourceItem &
  MicroCMSContentId &
  MicroCMSDate & {
    file?: {
      url: string;
    };
  };
type AboutCMSResponse = AboutContent & MicroCMSContentId & MicroCMSDate;
type SiteCMSResponse = SiteContent & MicroCMSContentId & MicroCMSDate;

async function safeGet<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  if (!client) return fallback;
  try {
    return await fetcher();
  } catch (error) {
    console.error("[microCMS] fetch failed", error);
    return fallback;
  }
}

function extractViewCount(entry: DiaryCMSResponse): number | undefined {
  const { count } = extractViewCountWithField(entry);
  return count > 0 ? count : undefined;
}

function extractViewCountWithField(entry: DiaryCMSResponse): { count: number; field: string } {
  const candidates = [
    { key: "viewCount", val: entry.viewCount },
    { key: "views", val: entry.views },
    { key: "pageViews", val: entry.pageViews },
    { key: "pv", val: entry.pv },
  ];
  for (const { key, val } of candidates) {
    if (typeof val === "number" && Number.isFinite(val)) {
      return { count: val, field: key };
    }
    if (typeof val === "string") {
      const parsed = Number(val);
      if (!Number.isNaN(parsed)) {
        return { count: parsed, field: key };
      }
    }
  }
  return { count: 0, field: "viewCount" };
}

function normalizeDiary(entry: DiaryCMSResponse): DiaryEntry {
  const content = entry.editer ?? entry.body ?? "";
  return {
    id: entry.id,
    title: entry.title ?? "(タイトル未設定)",
    slug: entry.slug ?? entry.id,
    summary: entry.summary || createExcerpt(content),
    body: content,
    folder: entry.folder,
    tags: entry.tags ?? [],
    heroImage: entry.heroImage,
    publishedAt: entry.publishedAt ?? entry.createdAt ?? new Date().toISOString(),
    updatedAt: entry.updatedAt ?? entry.revisedAt,
    viewCount: extractViewCount(entry),
  };
}

function sortByPopularity(a: DiaryEntry, b: DiaryEntry) {
  const viewDiff = (b.viewCount ?? 0) - (a.viewCount ?? 0);
  if (viewDiff !== 0) return viewDiff;
  const publishedDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  return Number.isNaN(publishedDiff) ? 0 : publishedDiff;
}

async function getDiaryMetaBySlug(
  slug: string,
): Promise<{ id: string; viewCount: number; field: string } | undefined> {
  if (!client) return undefined;

  try {
    const list = await client.getList<DiaryCMSResponse>({
      endpoint: "diary",
      queries: {
        filters: `slug[equals]${slug}`,
        limit: 1,
        fields: "id,viewCount,views,pageViews,pv,slug",
      },
    });

    const entry = list.contents[0];

    if (!entry) {
      try {
        const fallback = await client.getListDetail<DiaryCMSResponse>({
          endpoint: "diary",
          contentId: slug,
          queries: {
            fields: "id,viewCount,views,pageViews,pv,slug",
          },
        });
        const { count, field } = extractViewCountWithField(fallback);
        return { id: fallback.id, viewCount: count, field };
      } catch {
        return undefined;
      }
    }

    const { count, field } = extractViewCountWithField(entry);
    return { id: entry.id, viewCount: count, field };
  } catch (error) {
    console.warn("[microCMS] failed to load diary meta by slug", error);
    return undefined;
  }
}

export async function incrementDiaryView(slug: string): Promise<number | undefined> {
  if (!client) return undefined;

  const meta = await getDiaryMetaBySlug(slug);
  if (!meta) return undefined;

  const nextCount = meta.viewCount + 1;

  try {
    await client.update({
      endpoint: "diary",
      contentId: meta.id,
      content: {
        [meta.field]: nextCount,
      },
    });
    return nextCount;
  } catch (error) {
    console.warn("[microCMS] failed to increment view count", error);
    return undefined;
  }
}

async function fetchPopularDiariesByOrder(
  order: "-viewCount" | "-views" | "-pv" | "-pageViews",
  limit: number,
  filters?: string,
): Promise<DiaryEntry[]> {
  if (!client) return [];
  try {
    const list = await client.getList<DiaryCMSResponse>({
      endpoint: "diary",
      queries: {
        orders: order,
        limit,
        ...(filters ? { filters } : {}),
      },
    });
    return list.contents.map(normalizeDiary);
  } catch (error) {
    console.warn(`[microCMS] failed to fetch diary order "${order}"`, error);
    return [];
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  return safeGet(
    async () => {
      const data = await client!.getObject<SiteCMSResponse>({
        endpoint: "site",
        queries: {
          depth: 2,
        },
      });
      return {
        heroTitle: data.heroTitle,
        heroLead: data.heroLead,
        heroPrimaryCtaLabel: data.heroPrimaryCtaLabel,
        heroPrimaryCtaUrl: data.heroPrimaryCtaUrl,
        heroSecondaryCtaLabel: data.heroSecondaryCtaLabel,
        heroSecondaryCtaUrl: data.heroSecondaryCtaUrl,
        focuses: data.focuses ?? [],
        projects: data.projects ?? [],
        timeline: data.timeline ?? [],
        contactLinks: data.contactLinks ?? [],
      };
    },
    emptySiteContent,
  );
}

export async function getDiaryEntries(limit = 50): Promise<DiaryEntry[]> {
  return safeGet(
    async () => {
      const list = await client!.getList<DiaryCMSResponse>({
        endpoint: "diary",
        queries: {
          orders: "-publishedAt",
          limit,
        },
      });
      return list.contents.map(normalizeDiary);
    },
    emptyDiaryEntries.slice(0, limit),
  );
}

export async function getPopularDiaryEntries(limit = 5, excludeSlug?: string): Promise<DiaryEntry[]> {
  const filters = excludeSlug ? `slug[not_equals]${excludeSlug}` : undefined;
  const orderKeys: Array<"-viewCount" | "-views" | "-pv" | "-pageViews"> = ["-viewCount", "-views", "-pv", "-pageViews"];

  let popular: DiaryEntry[] = [];

  if (client) {
    for (const order of orderKeys) {
      popular = await fetchPopularDiariesByOrder(order, limit, filters);
      if (popular.length > 0) {
        break;
      }
    }

    if (popular.length >= limit) {
      return popular.slice(0, limit);
    }
  }

  const fallbackCandidates = await getDiaryEntries(Math.max(limit * 2, 10));
  const fallbackFiltered = fallbackCandidates.filter((entry) => entry.slug !== excludeSlug);

  if (popular.length === 0) {
    return fallbackFiltered.sort(sortByPopularity).slice(0, limit);
  }

  const merged = [
    ...popular,
    ...fallbackFiltered.filter((entry) => !popular.some((item) => item.id === entry.id)),
  ].sort(sortByPopularity);

  return merged.slice(0, limit);
}

export async function getDiaryBySlug(slug: string, draftKey?: string): Promise<DiaryEntry | undefined> {
  const fallbackEntry = emptyDiaryEntries.find((item) => item.slug === slug);

  if (!client) {
    return fallbackEntry;
  }

  const queries: MicroCMSQueries = {
    filters: `slug[equals]${slug}`,
    limit: 1,
  };

  if (draftKey) {
    queries.draftKey = draftKey;
  }

  return safeGet(
    async () => {
      const data = await client!.getList<DiaryCMSResponse>({
        endpoint: "diary",
        queries,
      });
      const entry = data.contents[0];
      if (entry) {
        return normalizeDiary(entry);
      }

      try {
        const detail = await client!.getListDetail<DiaryCMSResponse>({
          endpoint: "diary",
          contentId: slug,
          queries: draftKey ? { draftKey } : undefined,
        });
        return normalizeDiary(detail);
      } catch (error) {
        if (isNotFoundError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    fallbackEntry,
  );
}

function isNotFoundError(error: unknown): error is { status: number } {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  if (!("status" in error)) {
    return false;
  }
  return (error as { status?: number }).status === 404;
}

export async function getResourceItems(limit = 100): Promise<ResourceItem[]> {
  return safeGet(
    async () => {
      const list = await client!.getList<ResourceCMSResponse>({
        endpoint: "resources",
        queries: {
          orders: "-publishedAt",
          limit,
        },
      });
      return list.contents.map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        fileUrl: resource.fileUrl ?? resource.file?.url ?? resource.externalUrl ?? "",
        externalUrl: resource.externalUrl,
      }));
    },
    emptyResourceItems.slice(0, limit),
  );
}

export async function getAboutContent(): Promise<AboutContent> {
  return safeGet(
    async () => {
      const data = await client!.getObject<AboutCMSResponse>({
        endpoint: "about",
        queries: { depth: 2 },
      });
      return {
        intro: data.intro,
        mission: data.mission,
        sections: data.sections ?? [],
        skills: data.skills ?? [],
        quote: data.quote,
      };
    },
    emptyAboutContent,
  );
}

export const cmsReady = Boolean(client);
const emptySiteContent: SiteContent = {
  heroTitle: "",
  heroLead: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaUrl: "",
  heroSecondaryCtaLabel: undefined,
  heroSecondaryCtaUrl: undefined,
  focuses: [],
  projects: [],
  timeline: [],
  contactLinks: [],
};

const emptyDiaryEntries: DiaryEntry[] = [];

const emptyResourceItems: ResourceItem[] = [];

const emptyAboutContent: AboutContent = {
  intro: "",
  mission: "",
  sections: [],
  skills: [],
  quote: undefined,
};
