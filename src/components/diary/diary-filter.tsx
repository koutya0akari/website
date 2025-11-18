'use client';

import { useMemo, useState } from "react";

import type { DiaryEntry } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { DiaryCard } from "./diary-card";

type DiaryFilterProps = {
  entries: DiaryEntry[];
};

export function DiaryFilter({ entries }: DiaryFilterProps) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const folders = useMemo(
    () => Array.from(new Set(entries.map((item) => item.folder).filter((value): value is string => Boolean(value)))),
    [entries],
  );
  const tags = useMemo(() => Array.from(new Set(entries.flatMap((entry) => entry.tags ?? []))), [entries]);

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return entries.filter((entry) => {
      const title = entry.title.toLowerCase();
      const summary = stripHtml(entry.summary ?? "").toLowerCase();
      const body = stripHtml(entry.body ?? "").toLowerCase();
      const matchesQuery = !query || title.includes(keyword) || summary.includes(keyword) || body.includes(keyword);
      const matchesFolder = !folder || entry.folder === folder;
      const matchesTag = !tag || entry.tags?.includes(tag);
      return matchesQuery && matchesFolder && matchesTag;
    });
  }, [entries, query, folder, tag]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="search"
            placeholder="キーワードで検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={() => setFolder(null)}
              className={`rounded-full px-4 py-1 ${!folder ? "bg-accent text-black" : "bg-white/10 text-white/70"}`}
            >
              All folders
            </button>
            {folders.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFolder((prev) => (prev === name ? null : name))}
                className={`rounded-full px-4 py-1 ${folder === name ? "bg-accent text-black" : "bg-white/10 text-white/70"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTag(null)}
              className={`rounded-full border px-3 py-1 ${!tag ? "border-accent text-accent" : "border-white/20 text-white/60"}`}
            >
              All tags
            </button>
            {tags.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTag((prev) => (prev === item ? null : item))}
                className={`rounded-full border px-3 py-1 ${
                  tag === item ? "border-accent text-accent" : "border-white/20 text-white/60"
                }`}
              >
                #{item}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-6">
        {filtered.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} />
        ))}
        {filtered.length === 0 && <p className="text-center text-white/60">該当する日記はありません。</p>}
      </div>
    </div>
  );
}
