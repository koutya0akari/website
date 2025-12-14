import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import type { DiaryEntry } from "@/lib/types";

type WeeklyDiarySectionProps = {
  entries: DiaryEntry[];
};

export function WeeklyDiarySection({ entries }: WeeklyDiarySectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft/80 via-night/70 to-night-muted/70 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(247,181,0,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(100,210,255,0.15),transparent_35%)]" />
      </div>
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Weekly Diary</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">週間日記</h2>
        </div>
        <Link
          href="/weekly-diary"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
        >
          すべて見る
        </Link>
      </div>
      <div className="relative mt-4 grid gap-5 md:grid-cols-2">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            週間日記を準備中です。
          </div>
        ) : (
          entries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              compact
              hrefBase="/weekly-diary"
              showViewCount={false}
            />
          ))
        )}
      </div>
    </section>
  );
}

