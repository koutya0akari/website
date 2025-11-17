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

type DiaryCMSResponse = DiaryEntry & MicroCMSContentId & MicroCMSDate;
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

function normalizeDiary(entry: DiaryCMSResponse): DiaryEntry {
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug ?? entry.id,
    summary: entry.summary || createExcerpt(entry.body ?? ""),
    body: entry.body ?? "",
    folder: entry.folder,
    tags: entry.tags ?? [],
    heroImage: entry.heroImage,
    publishedAt: entry.publishedAt ?? entry.createdAt ?? new Date().toISOString(),
    updatedAt: entry.updatedAt ?? entry.revisedAt,
  };
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
