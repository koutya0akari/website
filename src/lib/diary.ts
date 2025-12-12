import "server-only";

import type { DiaryEntry } from "@/lib/types";

const useSupabase = process.env.USE_SUPABASE === "true";

export async function getDiaryEntries(limit = 50): Promise<DiaryEntry[]> {
  if (useSupabase) {
    const { getDiaryEntries: getFromSupabase } = await import("@/lib/diary-supabase");
    return getFromSupabase(limit);
  } else {
    const { getDiaryEntries: getFromMicroCMS } = await import("@/lib/microcms");
    return getFromMicroCMS(limit);
  }
}

export async function getPopularDiaryEntries(
  limit = 5,
  excludeSlug?: string,
): Promise<DiaryEntry[]> {
  if (useSupabase) {
    const { getPopularDiaryEntries: getFromSupabase } = await import("@/lib/diary-supabase");
    return getFromSupabase(limit, excludeSlug);
  } else {
    const { getPopularDiaryEntries: getFromMicroCMS } = await import("@/lib/microcms");
    return getFromMicroCMS(limit, excludeSlug);
  }
}

export async function getDiaryBySlug(
  slug: string,
  draftKey?: string,
): Promise<DiaryEntry | undefined> {
  if (useSupabase) {
    const { getDiaryBySlug: getFromSupabase } = await import("@/lib/diary-supabase");
    // Supabase doesn't support draft keys in the same way
    return getFromSupabase(slug);
  } else {
    const { getDiaryBySlug: getFromMicroCMS } = await import("@/lib/microcms");
    return getFromMicroCMS(slug, draftKey);
  }
}

export async function incrementDiaryView(slug: string): Promise<number | undefined> {
  if (useSupabase) {
    const { incrementDiaryView: incrementInSupabase } = await import("@/lib/diary-supabase");
    return incrementInSupabase(slug);
  } else {
    const { incrementDiaryView: incrementInMicroCMS } = await import("@/lib/microcms");
    return incrementInMicroCMS(slug);
  }
}
