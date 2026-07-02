import { describe, it, expect } from "vitest";

import { filterAndRankEntries } from "@/lib/search";
import type { DiaryEntry } from "@/lib/types";

function makeEntry(overrides: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    id: "1",
    title: "スキーム論の基礎",
    slug: "scheme-basics",
    summary: "<p>アフィンスキームの定義と基本性質。</p>",
    body: "層とスキームについての学習記録。",
    tags: ["代数幾何"],
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterAndRankEntries", () => {
  it("matches on title, tags, and body", () => {
    const entries = [
      makeEntry({ id: "t", title: "圏論入門", body: "内容", tags: [] }),
      makeEntry({ id: "g", title: "その他", body: "内容", tags: ["圏論"], slug: "tag-hit" }),
      makeEntry({ id: "b", title: "その他2", body: "圏論の話", tags: [], slug: "body-hit" }),
      makeEntry({ id: "n", title: "無関係", body: "無関係", tags: [], slug: "no-hit" }),
    ];

    const hits = filterAndRankEntries("圏論", entries, "diary", "/diary");
    expect(hits.map((h) => h.id)).toEqual(["t", "g", "b"]);
  });

  it("ranks title matches before tag and body matches", () => {
    const entries = [
      makeEntry({ id: "body", title: "AAA", body: "homology の計算", tags: [] }),
      makeEntry({ id: "title", title: "Homology 入門", body: "", tags: [] }),
      makeEntry({ id: "tag", title: "BBB", body: "", tags: ["homology"] }),
    ];

    const hits = filterAndRankEntries("homology", entries, "diary", "/diary");
    expect(hits.map((h) => h.id)).toEqual(["title", "tag", "body"]);
  });

  it("is case-insensitive", () => {
    const entries = [makeEntry({ title: "Grothendieck Topology" })];
    expect(filterAndRankEntries("grothendieck", entries, "diary", "/diary")).toHaveLength(1);
    expect(filterAndRankEntries("TOPOLOGY", entries, "diary", "/diary")).toHaveLength(1);
  });

  it("excludes link-only entries even when they match", () => {
    const entries = [makeEntry({ title: "秘密のノート", linkOnly: true })];
    expect(filterAndRankEntries("秘密", entries, "diary", "/diary")).toEqual([]);
  });

  it("caps results at max", () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: `${i}`, title: `圏論ノート ${i}`, slug: `note-${i}` }),
    );
    expect(filterAndRankEntries("圏論", entries, "diary", "/diary", 5)).toHaveLength(5);
  });

  it("returns nothing for an empty or whitespace query", () => {
    const entries = [makeEntry()];
    expect(filterAndRankEntries("", entries, "diary", "/diary")).toEqual([]);
    expect(filterAndRankEntries("   ", entries, "diary", "/diary")).toEqual([]);
  });

  it("builds href from the prefix and strips HTML from the description", () => {
    const [hit] = filterAndRankEntries("スキーム", [makeEntry()], "memo", "/memo");
    expect(hit.href).toBe("/memo/scheme-basics");
    expect(hit.description).toBe("アフィンスキームの定義と基本性質。");
    expect(hit.type).toBe("memo");
  });

  it("truncates long descriptions", () => {
    const [hit] = filterAndRankEntries(
      "スキーム",
      [makeEntry({ summary: `<p>${"あ".repeat(100)}</p>` })],
      "diary",
      "/diary",
    );
    expect(hit.description).toBe(`${"あ".repeat(60)}…`);
  });
});
