import Link from "next/link";

import { JournalCard } from "@/components/journal/journal-card";
import { MATH_DIARY_LABEL, getDiaryDisplayLabel } from "@/lib/diary-labels";
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
      <div className="glass-panel rounded-[20px] p-5 shadow-[var(--card-shadow)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Popular</p>
            <h2 className="text-lg font-semibold text-white">よく読まれている記事</h2>
          </div>
          <span className="border border-accent/25 bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">Views</span>
        </div>
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const views = formatViews(entry.viewCount);
            return (
              <Link
                key={entry.id}
                href={`/diary/${entry.slug}`}
                className="group block border border-highlight/20 bg-black/20 px-4 py-3 transition duration-150 hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-highlight/25 bg-accent/85 text-sm font-semibold text-night shadow-[0_10px_24px_rgba(2,9,7,0.22)]">
                    #{index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                      {getDiaryDisplayLabel(entry.folder, MATH_DIARY_LABEL)}
                    </p>
                    <h3 className="text-sm font-semibold text-white transition group-hover:text-accent">{entry.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      {views ? (
                        <span className="border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] text-accent">{views}</span>
                      ) : (
                        <span className="border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] text-white/70">PV集計中</span>
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
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Popular</p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">よく読まれている記事</h2>
        </div>
        <span className="border border-accent/25 bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">Views</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry, index) => {
          const views = formatViews(entry.viewCount);
          return (
            <JournalCard
              key={entry.id}
              className="relative flex flex-col gap-4 p-5 hover:-translate-y-0.5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* ランキングバッジ */}
                <div className="flex h-8 w-8 items-center justify-center border border-highlight/25 bg-accent/85 text-xs font-bold text-night shadow-[0_10px_24px_rgba(2,9,7,0.22)]">
                  #{index + 1}
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {getDiaryDisplayLabel(entry.folder, MATH_DIARY_LABEL)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                <time className="text-sm text-white/60">{formatDate(entry.publishedAt)}</time>
                {views ? (
                  <span className="border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">
                    {views}
                  </span>
                ) : (
                  <span className="border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] text-white/70">
                    PV集計中
                  </span>
                )}
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
                    <span key={tag} className="tag-chip !border-0 bg-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </JournalCard>
          );
        })}
      </div>
    </section>
  );
}
