import { describe, it, expect } from "vitest";

import {
  normalizeContentEntry,
  normalizeContentEntryListItem,
  type SupabaseContentRow,
} from "@/lib/content-entries-core";
import { LINK_ONLY_TAG } from "@/lib/content-visibility";

function makeRow(overrides: Partial<SupabaseContentRow> = {}): SupabaseContentRow {
  return {
    id: "row-1",
    title: "テスト記事",
    slug: "test-entry",
    body: "# 見出し\n\n本文です。",
    summary: "要約です。",
    folder: "Math Diary",
    tags: ["代数幾何"],
    status: "published",
    hero_image_url: null,
    view_count: 3,
    published_at: "2026-01-10T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-11T00:00:00.000Z",
    ...overrides,
  };
}

const passthroughFolder = (row: SupabaseContentRow) => row.folder || undefined;

describe("normalizeContentEntry", () => {
  it("renders body and summary markdown to HTML", () => {
    const entry = normalizeContentEntry(makeRow(), passthroughFolder);
    expect(entry.body).toContain("<h1");
    expect(entry.body).toContain("本文です。");
    expect(entry.summary).toContain("要約です。");
  });

  it("falls back to a body excerpt when summary is empty", () => {
    const entry = normalizeContentEntry(
      makeRow({ summary: null, body: "本文だけがあります。" }),
      passthroughFolder,
    );
    expect(entry.summary).toContain("本文だけがあります。");
    expect(entry.summary.startsWith("<p>")).toBe(true);
  });

  it("strips the link-only marker tag and sets linkOnly", () => {
    const entry = normalizeContentEntry(
      makeRow({ tags: ["圏論", LINK_ONLY_TAG] }),
      passthroughFolder,
    );
    expect(entry.tags).toEqual(["圏論"]);
    expect(entry.linkOnly).toBe(true);
  });

  it("hides zero view counts", () => {
    expect(normalizeContentEntry(makeRow({ view_count: 0 }), passthroughFolder).viewCount).toBeUndefined();
    expect(normalizeContentEntry(makeRow({ view_count: 5 }), passthroughFolder).viewCount).toBe(5);
  });

  it("falls back to created_at when published_at is null", () => {
    const entry = normalizeContentEntry(makeRow({ published_at: null }), passthroughFolder);
    expect(entry.publishedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("uses the injected folder resolver", () => {
    const fixed = normalizeContentEntry(makeRow(), () => "Memo");
    expect(fixed.folder).toBe("Memo");

    const passthrough = normalizeContentEntry(makeRow({ folder: null }), passthroughFolder);
    expect(passthrough.folder).toBeUndefined();
  });

  it("maps hero_image_url to both image fields", () => {
    const entry = normalizeContentEntry(
      makeRow({ hero_image_url: "https://example.com/x.png" }),
      passthroughFolder,
    );
    expect(entry.heroImage?.url).toBe("https://example.com/x.png");
    expect(entry.shareImage?.url).toBe("https://example.com/x.png");
    expect(normalizeContentEntry(makeRow(), passthroughFolder).heroImage).toBeUndefined();
  });
});

describe("normalizeContentEntryListItem", () => {
  it("keeps the body as plain text without HTML tags", () => {
    const entry = normalizeContentEntryListItem(makeRow(), passthroughFolder);
    expect(entry.body).not.toContain("<");
    expect(entry.body).toContain("本文です。");
  });

  it("builds the fallback summary from the plain-text body", () => {
    const entry = normalizeContentEntryListItem(
      makeRow({ summary: "", body: "**強調** されたテキスト" }),
      passthroughFolder,
    );
    expect(entry.summary).toContain("強調 されたテキスト");
    expect(entry.summary).not.toContain("**");
  });
});
