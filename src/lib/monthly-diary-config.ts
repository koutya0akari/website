export const MONTHLY_DIARY_FOLDER = "Monthly Diary";
export const LEGACY_WEEKLY_DIARY_FOLDER = "Weekly Diary";

export const MONTHLY_DIARY_FOLDERS = [
  MONTHLY_DIARY_FOLDER,
  LEGACY_WEEKLY_DIARY_FOLDER,
] as const;

export const RESERVED_DIARY_FOLDER_EXCLUSION_FILTER = `folder.is.null,and(folder.neq."${MONTHLY_DIARY_FOLDER}",folder.neq."${LEGACY_WEEKLY_DIARY_FOLDER}")`;
