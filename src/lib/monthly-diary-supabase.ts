import "server-only";

import { createContentEntriesModule } from "@/lib/content-entries";
import { MONTHLY_DIARY_FOLDER, MONTHLY_DIARY_FOLDERS } from "@/lib/monthly-diary-config";

const monthlyDiaryModule = createContentEntriesModule({
  label: "monthly diary",
  applyScope: (query) => query.in("folder", [...MONTHLY_DIARY_FOLDERS]),
  // 旧 Weekly Diary フォルダの行も Monthly Diary として扱う
  resolveFolder: () => MONTHLY_DIARY_FOLDER,
});

export const getMonthlyDiaryEntries = monthlyDiaryModule.getEntries;
export const getMonthlyDiaryBySlug = monthlyDiaryModule.getBySlug;
