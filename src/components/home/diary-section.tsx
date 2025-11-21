import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import type { DiaryEntry } from "@/lib/types";

type DiarySectionProps = {
  diaries: DiaryEntry[];
};

export function DiarySection({ diaries }: DiarySectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft/80 via-night/70 to-night-muted/70 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(100,210,255,0.15),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(247,181,0,0.12),transparent_35%)]" />
      </div>
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Math Diary</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">最近の学習記録</h2>
          <p className="text-sm text-white/70">証明のメモ、読書記録、ゼミの下書きを早めに公開。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Draft → Clean copy</span>
          <Link
            href="/diary"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            すべて見る
          </Link>
        </div>
      </div>
      <div className="relative mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diaries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} compact />
        ))}
      </div>
    </section>
  );
}
