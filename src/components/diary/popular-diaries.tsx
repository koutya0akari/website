import Link from "next/link";

import type { DiaryEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PopularDiariesProps = {
  entries: DiaryEntry[];
};

const viewFormatter = new Intl.NumberFormat("ja-JP");

function formatViews(viewCount?: number) {
  if (typeof viewCount !== "number" || Number.isNaN(viewCount)) return null;
  return `${viewFormatter.format(viewCount)} PV`;
}

export function PopularDiaries({ entries }: PopularDiariesProps) {
  if (entries.length === 0) return null;

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-white/10 via-night-soft/60 to-night-soft/90 p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Popular</p>
            <h2 className="text-lg font-semibold text-white">よく読まれている記事</h2>
          </div>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Views</span>
        </div>
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const views = formatViews(entry.viewCount);
            return (
              <Link
                key={entry.id}
                href={`/diary/${entry.slug}`}
                className="group block rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition duration-150 hover:-translate-y-0.5 hover:border-accent/70 hover:bg-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-accent/90 to-highlight/80 text-sm font-semibold text-night shadow-card">
                    #{index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{entry.folder ?? "Math Diary"}</p>
                    <h3 className="text-sm font-semibold text-white transition group-hover:text-accent">{entry.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      {views ? (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80">{views}</span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">PV集計中</span>
                      )}
                      <time className="text-white/50">{formatDate(entry.publishedAt)}</time>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
