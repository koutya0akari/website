import {
  LEGACY_WEEKLY_DIARY_FOLDER,
  MEMO_FOLDER,
  MONTHLY_DIARY_FOLDER,
} from "@/lib/monthly-diary-config";

export const MATH_DIARY_LABEL = "数学メモ";
export const MONTHLY_DIARY_LABEL = "日記";
export const MEMO_LABEL = "メモ";
export const MATH_DIARY_OVERLINE = "MATH NOTES";
export const MONTHLY_DIARY_OVERLINE = "DIARY";
export const MEMO_OVERLINE = "MEMO";

export function getDiaryDisplayLabel(folder?: string, fallback = MATH_DIARY_LABEL) {
  if (!folder) {
    return fallback;
  }

  if (folder === "Math Diary") {
    return MATH_DIARY_LABEL;
  }

  if (folder === MONTHLY_DIARY_FOLDER || folder === LEGACY_WEEKLY_DIARY_FOLDER) {
    return MONTHLY_DIARY_LABEL;
  }

  if (folder === MEMO_FOLDER) {
    return MEMO_LABEL;
  }

  return folder;
}
