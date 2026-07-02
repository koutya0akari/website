import "server-only";

import { revalidatePath } from "next/cache";

import type { ContentRouteConfig } from "@/lib/admin/content-route-factory";
import {
  MEMO_FOLDER,
  MONTHLY_DIARY_FOLDER,
  MONTHLY_DIARY_FOLDERS,
  RESERVED_DIARY_FOLDER_EXCLUSION_FILTER,
} from "@/lib/monthly-diary-config";

// route.ts と [id]/route.ts の両方から使うため、設定はここに一元化する。

export const diaryRouteConfig: ContentRouteConfig = {
  label: "diary",
  applyScope: (query) => query.or(RESERVED_DIARY_FOLDER_EXCLUSION_FILTER),
  orderByPublished: false,
  // diary はリクエストで指定されたフォルダをそのまま保存（予約フォルダは validateFolder で拒否）
  resolveWriteFolder: (folder) => (typeof folder === "string" && folder ? folder : null),
  validateFolder: (folder) => {
    const value = String(folder ?? "");
    if (MONTHLY_DIARY_FOLDERS.includes(value as (typeof MONTHLY_DIARY_FOLDERS)[number])) {
      return `Folder "${MONTHLY_DIARY_FOLDER}" is reserved. Use 日記 admin instead.`;
    }
    if (value === MEMO_FOLDER) {
      return `Folder "${MEMO_FOLDER}" is reserved. Use メモ admin instead.`;
    }
    return null;
  },
  revalidate: (slug) => {
    revalidatePath("/");
    revalidatePath("/diary");
    if (slug) revalidatePath(`/diary/${slug}`);
  },
};

export const memoRouteConfig: ContentRouteConfig = {
  label: "memo",
  applyScope: (query) => query.eq("folder", MEMO_FOLDER),
  orderByPublished: true,
  resolveWriteFolder: () => MEMO_FOLDER,
  revalidate: (slug) => {
    revalidatePath("/memo");
    if (slug) revalidatePath(`/memo/${slug}`);
  },
};

export const monthlyDiaryRouteConfig: ContentRouteConfig = {
  label: "monthly diary",
  applyScope: (query) => query.in("folder", [...MONTHLY_DIARY_FOLDERS]),
  orderByPublished: true,
  resolveWriteFolder: () => MONTHLY_DIARY_FOLDER,
  revalidate: (slug) => {
    revalidatePath("/");
    revalidatePath("/monthly-diary");
    if (slug) revalidatePath(`/monthly-diary/${slug}`);
  },
};
