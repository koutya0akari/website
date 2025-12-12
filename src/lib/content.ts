import "server-only";

// Supabase専用 - microCMS連携は削除済み
export {
  getSiteContent,
  getAboutContent,
  getResourceItems,
} from "@/lib/content-supabase";
