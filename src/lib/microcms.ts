import "server-only";

import { createClient } from "microcms-js-sdk";
import type { MicroCMSContentId, MicroCMSDate, MicroCMSQueries } from "microcms-js-sdk";

import type { AboutContent, CMSImage, DiaryEntry, ResourceItem, SiteContent } from "@/lib/types";
import { createExcerpt } from "@/lib/utils";

const emptySite: SiteContent = {
  heroTitle: "",
  heroLead: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaUrl: "/",
  heroSecondaryCtaLabel: undefined,
  heroSecondaryCtaUrl: undefined,
  focuses: [],
  projects: [],
  timeline: [],
  contactLinks: [],
};

const emptyAbout: AboutContent = {
  intro: "",
  mission: "",
  sections: [],
  skills: [],
  quote: undefined,
};

const emptyDiaries: DiaryEntry[] = [];
const emptyResources: ResourceItem[] = [];

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const DIARY_ENDPOINT = "blogs";

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
  heroImage?: CMSImage;
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

function normalizeDiary(entry: DiaryCMSResponse): DiaryEntry {
  const body = entry.editer ?? entry.body ?? "";
  return {
    id: entry.id,
    title: entry.title ?? "無題",
    slug: entry.slug ?? entry.id,
    summary: entry.summary || createExcerpt(body),
    body,
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
    emptySite,
  );
}

export async function getDiaryEntries(limit = 50): Promise<DiaryEntry[]> {
  return safeGet(
    async () => {
      const list = await client!.getList<DiaryCMSResponse>({
        endpoint: DIARY_ENDPOINT,
        queries: {
          orders: "-publishedAt",
          limit,
        },
      });
      return list.contents.map(normalizeDiary);
    },
    emptyDiaries,
  );
}

export async function getDiaryBySlug(slug: string, draftKey?: string): Promise<DiaryEntry | undefined> {
  if (!client) {
    return undefined;
  }

  const queries: MicroCMSQueries = {
    filters: `slug[equals]${slug}`,
    limit: 1,
  };

  if (draftKey) {
    queries.draftKey = draftKey;
  }

  const data = await client!.getList<DiaryCMSResponse>({
    endpoint: DIARY_ENDPOINT,
    queries,
  });

  const entry = data.contents[0];

  return entry ? normalizeDiary(entry) : undefined;
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
    emptyResources,
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
    emptyAbout,
  );
}

export const cmsReady = Boolean(client);
