import type { Metadata } from "next";
import Link from "next/link";

import { PopularDiariesGrid } from "@/components/diary/popular-diaries";
import { DiaryFilter } from "@/components/diary/diary-filter";
import { JournalSection } from "@/components/journal/journal-section";
import { MATH_DIARY_LABEL, MATH_DIARY_OVERLINE } from "@/lib/diary-labels";
import { getDiaryEntries, getPopularDiaryEntries } from "@/lib/diary";

export const metadata: Metadata = {
  title: MATH_DIARY_LABEL,
  description: "数学メモ。フォルダやタグ、検索で学習記録を絞り込めます。",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const [diaries, popularDiaries] = await Promise.all([getDiaryEntries(100), getPopularDiaryEntries(6)]);

  return (
    <div className="mx-auto max-w-content px-6 py-12 space-y-10">
      <JournalSection variant="listing">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{MATH_DIARY_OVERLINE}</p>
        <h1 className="mt-3 text-4xl font-semibold">{MATH_DIARY_LABEL}</h1>
        <Link href="/resources" className="mt-5 inline-flex text-sm text-accent underline underline-offset-4">
          公開資料を見る
        </Link>
      </JournalSection>

      {/* よく読まれている記事 - 最上部に横並びで表示 */}
      <PopularDiariesGrid entries={popularDiaries} />

      {/* 記事一覧 - 3列グリッド */}
      <DiaryFilter entries={diaries} />
    </div>
  );
}
