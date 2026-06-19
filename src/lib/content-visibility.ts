export const LINK_ONLY_TAG = "__visibility:link-only";

export function isLinkOnlyContent(tags?: string[] | null): boolean {
  return (tags ?? []).includes(LINK_ONLY_TAG);
}

export function getPublicTags(tags?: string[] | null): string[] {
  return (tags ?? []).filter((tag) => tag !== LINK_ONLY_TAG);
}

export function getStoredTags(tags?: string[] | null, linkOnly = false): string[] {
  const publicTags = getPublicTags(tags).filter((tag) => tag.trim());

  if (!linkOnly) {
    return publicTags;
  }

  return [...publicTags, LINK_ONLY_TAG];
}
