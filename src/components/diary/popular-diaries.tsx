import Link from "next/link";

import { SpotlightCard } from "@/components/ui/spotlight-card";
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

/**
 * サイドバー用の縦並び表示（従来のコンポーネント）
 */
export function PopularDiaries({ entries }: PopularDiariesProps) {
  if (entries.length === 0) return null;

  return (
    <aside>
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

/**
 * 横並び3列グリッド表示（メインコンテンツ上部用）
 */
export function PopularDiariesGrid({ entries }: PopularDiariesProps) {
  if (entries.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Popular</p>
          <h2 className="text-xl font-semibold text-white">よく読まれている記事</h2>
        </div>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Views</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry, index) => {
          const views = formatViews(entry.viewCount);
          return (
            <SpotlightCard
              key={entry.id}
              className="relative flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-accent/80"
            >
              {/* ランキングバッジ */}
              <div className="absolute -left-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-accent/90 to-highlight/80 text-sm font-bold text-night shadow-lg">
                #{index + 1}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {entry.folder ?? "Math Diary"}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <time className="text-sm text-white/60">{formatDate(entry.publishedAt)}</time>
                  {views ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">
                      {views}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
                      PV集計中
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  <Link href={`/diary/${entry.slug}`} className="hover:text-accent">
                    {entry.title}
                  </Link>
                </h3>
              </div>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
