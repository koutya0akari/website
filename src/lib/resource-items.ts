import "server-only";

import type { ResourceItem } from "@/lib/types";

const LECTURE_NOTE_REPOSITORY = "koutya0akari/Lecture-Note";
const LECTURE_NOTE_BRANCH = "main";
const LECTURE_NOTE_CATEGORY = "GitHub PDF";
const LECTURE_NOTE_FILE_URL_PREFIX = `https://github.com/${LECTURE_NOTE_REPOSITORY}/blob/${LECTURE_NOTE_BRANCH}/`;

export type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  external_url: string | null;
  hidden?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type GitHubTreeEntry = {
  path: string;
  type: string;
};

type GitHubTreeResponse = {
  tree?: GitHubTreeEntry[];
};

type GitHubResourceItem = {
  path: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
};

export type AdminResourceItem = {
  id: string;
  metadata_id: string | null;
  source: "github" | "database";
  title: string;
  description: string;
  category: string;
  file_url: string | null;
  external_url: string | null;
  hidden: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  has_metadata: boolean;
};

/** メタデータ行が無い項目は sort_order=0（既定）として扱う。 */
function resolveSortOrder(row: ResourceRow | undefined | null): number {
  const value = row?.sort_order;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isHidden(row: ResourceRow | undefined | null): boolean {
  return row?.hidden === true;
}

/** sort_order 昇順、同値は元の並び（GitHub→DB）を保つ安定ソート。 */
function bySortOrder<T extends { _order: number; _index: number }>(a: T, b: T): number {
  return a._order - b._order || a._index - b._index;
}

function encodeGitHubPath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function formatLectureNoteTitle(path: string): string {
  return path
    .replace(/\.pdf$/i, "")
    .replace(/^2026s_/, "")
    .replace(/_/g, " ");
}

function getFileKey(fileUrl: string | null | undefined): string | null {
  const trimmed = fileUrl?.trim();
  return trimmed ? trimmed : null;
}

function buildFallbackDescription({
  title,
  category,
  fileUrl,
  externalUrl,
}: {
  title: string;
  category: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
}): string {
  if (isLectureNoteFileUrl(fileUrl) || category === LECTURE_NOTE_CATEGORY) {
    return `「${title}」の講義ノートを PDF で公開しています。`;
  }

  if (externalUrl?.trim()) {
    return `「${title}」の公開資料です。リンク先で内容を確認できます。`;
  }

  return `「${title}」の公開資料です。`;
}

function resolvePublicDescription({
  title,
  description,
  category,
  fileUrl,
  externalUrl,
}: {
  title: string;
  description: string | null | undefined;
  category: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
}): string {
  const trimmed = description?.trim();
  if (trimmed) {
    return trimmed;
  }

  return buildFallbackDescription({ title, category, fileUrl, externalUrl });
}

function mapDatabaseRow(row: ResourceRow): ResourceItem {
  return {
    id: row.id,
    title: row.title,
    description: resolvePublicDescription({
      title: row.title,
      description: row.description,
      category: row.category,
      fileUrl: row.file_url,
      externalUrl: row.external_url,
    }),
    category: row.category ?? "",
    fileUrl: row.file_url ?? "",
    externalUrl: row.external_url ?? undefined,
  };
}

function createMetadataMap(rows: ResourceRow[]) {
  const map = new Map<string, ResourceRow>();

  for (const row of rows) {
    const key = getFileKey(row.file_url);
    if (!key || map.has(key)) {
      continue;
    }
    map.set(key, row);
  }

  return map;
}

export async function getLectureNoteItems(): Promise<GitHubResourceItem[]> {
  const response = await fetch(
    `https://api.github.com/repos/${LECTURE_NOTE_REPOSITORY}/git/trees/${LECTURE_NOTE_BRANCH}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 300 },
    },
  ).catch((error) => {
    console.error("[GitHub] Failed to fetch lecture note tree:", error);
    return null;
  });

  if (!response?.ok) {
    if (response) {
      console.error("[GitHub] Failed to fetch lecture note tree:", response.status, response.statusText);
    }
    return [];
  }

  const data = (await response.json()) as GitHubTreeResponse;

  return (data.tree ?? [])
    .filter((entry) => entry.type === "blob" && entry.path.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.path.localeCompare(b.path, "en"))
    .map((entry) => ({
      path: entry.path,
      title: formatLectureNoteTitle(entry.path),
      description: "",
      category: LECTURE_NOTE_CATEGORY,
      fileUrl: `${LECTURE_NOTE_FILE_URL_PREFIX}${encodeGitHubPath(entry.path)}`,
    }));
}

export function mergeResourceItems(databaseRows: ResourceRow[], githubItems: GitHubResourceItem[], limit = 100): ResourceItem[] {
  const metadataMap = createMetadataMap(databaseRows);
  const githubKeys = new Set(githubItems.map((item) => item.fileUrl));

  const mergedGitHubItems = githubItems.map((item) => {
    const metadata = metadataMap.get(item.fileUrl);

    const resourceItem: ResourceItem = metadata
      ? {
          id: metadata.id,
          title: metadata.title || item.title,
          description: resolvePublicDescription({
            title: metadata.title || item.title,
            description: metadata.description ?? item.description,
            category: metadata.category || item.category,
            fileUrl: item.fileUrl,
            externalUrl: metadata.external_url,
          }),
          category: metadata.category || item.category,
          fileUrl: item.fileUrl,
        }
      : {
          id: `lecture-note-${item.path}`,
          title: item.title,
          description: resolvePublicDescription({
            title: item.title,
            description: item.description,
            category: item.category,
            fileUrl: item.fileUrl,
            externalUrl: null,
          }),
          category: item.category,
          fileUrl: item.fileUrl,
        };

    return { resourceItem, hidden: isHidden(metadata), order: resolveSortOrder(metadata) };
  });

  const standaloneDatabaseItems = databaseRows
    .filter((row) => {
      const key = getFileKey(row.file_url);
      return !key || !githubKeys.has(key);
    })
    .map((row) => ({ resourceItem: mapDatabaseRow(row), hidden: isHidden(row), order: resolveSortOrder(row) }));

  return [...mergedGitHubItems, ...standaloneDatabaseItems]
    .map((entry, index) => ({ ...entry, _order: entry.order, _index: index }))
    .filter((entry) => !entry.hidden)
    .sort(bySortOrder)
    .map((entry) => entry.resourceItem)
    .slice(0, limit);
}

export function buildAdminResourceItems(databaseRows: ResourceRow[], githubItems: GitHubResourceItem[]): AdminResourceItem[] {
  const metadataMap = createMetadataMap(databaseRows);
  const githubKeys = new Set(githubItems.map((item) => item.fileUrl));

  const githubResourceItems: AdminResourceItem[] = githubItems.map((item) => {
    const metadata = metadataMap.get(item.fileUrl);

    return {
      id: `github:${item.path}`,
      metadata_id: metadata?.id ?? null,
      source: "github" as const,
      title: metadata?.title || item.title,
      description: metadata?.description ?? item.description,
      category: metadata?.category || item.category,
      file_url: item.fileUrl,
      external_url: metadata?.external_url ?? null,
      hidden: isHidden(metadata),
      sort_order: resolveSortOrder(metadata),
      created_at: metadata?.created_at ?? null,
      updated_at: metadata?.updated_at ?? null,
      has_metadata: Boolean(metadata),
    };
  });

  const standaloneDatabaseItems: AdminResourceItem[] = databaseRows
    .filter((row) => {
      const key = getFileKey(row.file_url);
      return !key || !githubKeys.has(key);
    })
    .map((row) => ({
      id: row.id,
      metadata_id: row.id,
      source: "database" as const,
      title: row.title,
      description: row.description ?? "",
      category: row.category ?? "",
      file_url: row.file_url,
      external_url: row.external_url,
      hidden: isHidden(row),
      sort_order: resolveSortOrder(row),
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
      has_metadata: true,
    }));

  return [...githubResourceItems, ...standaloneDatabaseItems]
    .map((item, index) => ({ item, _order: item.sort_order, _index: index }))
    .sort(bySortOrder)
    .map((entry) => entry.item);
}

export function isLectureNoteFileUrl(fileUrl: string | null | undefined): boolean {
  if (!fileUrl) {
    return false;
  }

  return fileUrl.startsWith(LECTURE_NOTE_FILE_URL_PREFIX) && fileUrl.toLowerCase().endsWith(".pdf");
}
