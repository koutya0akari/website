import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import type { DiaryEntry } from "@/lib/types";

type DiarySectionProps = {
  diaries: DiaryEntry[];
};

export function DiarySection({ diaries }: DiarySectionProps) {
  return (
    <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Math Diary</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-semibold sm:text-3xl">最近の学習記録</h2>
          <Link href="/diary" className="text-sm text-accent underline-offset-4 hover:underline">
            全て見る
          </Link>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {diaries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} compact />
        ))}
      </div>
    </section>
  );
}
