import "server-only";

export {
  getMonthlyDiaryEntries as getWeeklyDiaryEntries,
  getMonthlyDiaryBySlug as getWeeklyDiaryBySlug,
} from "@/lib/monthly-diary-supabase";
