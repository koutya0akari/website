import "server-only";

// Supabase専用 - microCMS連携は削除済み
export {
  getDiaryEntries,
  getPopularDiaryEntries,
  getDiaryBySlug,
  incrementDiaryView,
} from "@/lib/diary-supabase";
