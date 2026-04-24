export const MONTHLY_DIARY_FOLDER = "Monthly Diary";
export const LEGACY_WEEKLY_DIARY_FOLDER = "Weekly Diary";
export const MEMO_FOLDER = "Memo";

export const MONTHLY_DIARY_FOLDERS = [
  MONTHLY_DIARY_FOLDER,
  LEGACY_WEEKLY_DIARY_FOLDER,
] as const;

export const RESERVED_DIARY_FOLDERS = [
  MONTHLY_DIARY_FOLDER,
  LEGACY_WEEKLY_DIARY_FOLDER,
  MEMO_FOLDER,
] as const;

export const RESERVED_DIARY_FOLDER_EXCLUSION_FILTER = `folder.is.null,and(${RESERVED_DIARY_FOLDERS.map(
  (folder) => `folder.neq."${folder}"`,
).join(",")})`;
