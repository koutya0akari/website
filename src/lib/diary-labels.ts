export const MATH_DIARY_LABEL = "数学メモ";
export const MONTHLY_DIARY_LABEL = "日記";
export const MATH_DIARY_OVERLINE = "MATH NOTES";
export const MONTHLY_DIARY_OVERLINE = "DIARY";

export function getDiaryDisplayLabel(folder?: string, fallback = MATH_DIARY_LABEL) {
  if (!folder) {
    return fallback;
  }

  if (folder === "Math Diary") {
    return MATH_DIARY_LABEL;
  }

  if (folder === "Monthly Diary" || folder === "Weekly Diary") {
    return MONTHLY_DIARY_LABEL;
  }

  return folder;
}
