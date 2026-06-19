export const LINK_ONLY_MEMO_TAG = "__visibility:link-only";

export function isLinkOnlyMemo(tags?: string[] | null): boolean {
  return (tags ?? []).includes(LINK_ONLY_MEMO_TAG);
}

export function getPublicMemoTags(tags?: string[] | null): string[] {
  return (tags ?? []).filter((tag) => tag !== LINK_ONLY_MEMO_TAG);
}

export function getStoredMemoTags(tags?: string[] | null, linkOnly = false): string[] {
  const publicTags = getPublicMemoTags(tags).filter((tag) => tag.trim());

  if (!linkOnly) {
    return publicTags;
  }

  return [...publicTags, LINK_ONLY_MEMO_TAG];
}
