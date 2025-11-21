import type { Metadata } from "next";
import Link from "next/link";

import { PopularDiaries } from "@/components/diary/popular-diaries";
import { DiaryFilter } from "@/components/diary/diary-filter";
import { getDiaryEntries, getPopularDiaryEntries } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "Math Diary",
  description: "microCMS で管理する Math Diary。フォルダやタグ、検索で学習記録を絞り込めます。",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const [diaries, popularDiaries] = await Promise.all([getDiaryEntries(100), getPopularDiaryEntries(6)]);

  return (
    <div className="mx-auto max-w-content px-6 py-12 space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Math Diary</p>
        <h1 className="mt-3 text-4xl font-semibold">Math Diary</h1>
        <p className="mt-3 text-lg text-white/70">
          microCMS のヘッドレス CMS で作成した Math Diary を自動で取得しています。検索ボックスで本文内も検索でき、フォルダやタグで絞り込み可能です。
        </p>
        <Link href="/resources" className="mt-5 inline-flex text-sm text-accent underline underline-offset-4">
          公開資料を見る
        </Link>
      </section>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="lg:order-1">
          <DiaryFilter entries={diaries} />
        </div>
        <PopularDiaries entries={popularDiaries} />
      </div>
    </div>
  );
}
