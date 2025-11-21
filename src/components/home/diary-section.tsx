import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import type { DiaryEntry } from "@/lib/types";

type DiarySectionProps = {
  diaries: DiaryEntry[];
};

export function DiarySection({ diaries }: DiarySectionProps) {
  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-gradient-to-br from-night-soft/80 via-night/70 to-night-muted/70 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Math Diary</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">最近の学習記録</h2>
          <p className="text-sm text-white/70">証明のメモ、読書記録、ゼミの下書きを早めに公開。</p>
        </div>
        <Link href="/diary" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-accent hover:text-accent">
          すべて見る
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diaries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} compact />
        ))}
      </div>
    </section>
  );
}
