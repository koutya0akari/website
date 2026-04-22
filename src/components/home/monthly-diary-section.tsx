import Link from "next/link";

import { MonthlyDiaryCard } from "@/components/monthly-diary/monthly-diary-card";
import { MONTHLY_DIARY_LABEL } from "@/lib/diary-labels";
import type { DiaryEntry } from "@/lib/types";

type MonthlyDiarySectionProps = {
  entries: DiaryEntry[];
};

export function MonthlyDiarySection({ entries }: MonthlyDiarySectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(145deg,rgba(12,22,40,0.95),rgba(8,12,24,0.92))] p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[30px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(248,214,116,0.14),transparent_32%),radial-gradient(circle_at_88%_0%,rgba(100,210,255,0.16),transparent_34%)]" />
      </div>

      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{MONTHLY_DIARY_LABEL}</h2>
        </div>
        <Link
          href="/monthly-diary"
          className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
        >
          日記一覧へ
        </Link>
      </div>

      <div className="relative mt-6 grid gap-5 lg:grid-cols-2">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            日記を準備中です。
          </div>
        ) : (
          entries.map((entry) => <MonthlyDiaryCard key={entry.id} entry={entry} compact />)
        )}
      </div>
    </section>
  );
}
