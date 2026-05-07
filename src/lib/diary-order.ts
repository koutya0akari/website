import type { DiaryEntry } from "@/lib/types";

const MIN_SORT_CANDIDATES = 1000;

export function getSortCandidateLimit(limit: number): number {
  return Math.max(limit, MIN_SORT_CANDIDATES);
}

function timestamp(value: string | undefined): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function comparePublishedDesc(a: DiaryEntry, b: DiaryEntry): number {
  const publishedDiff = timestamp(b.publishedAt) - timestamp(a.publishedAt);
  if (publishedDiff !== 0) return publishedDiff;
  return b.id.localeCompare(a.id);
}

export function sortByPublishedDesc(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort(comparePublishedDesc);
}

export function sortByPopularityDesc(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => {
    const viewDiff = (b.viewCount ?? 0) - (a.viewCount ?? 0);
    if (viewDiff !== 0) return viewDiff;
    return comparePublishedDesc(a, b);
  });
}
