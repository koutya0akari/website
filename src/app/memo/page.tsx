import type { Metadata } from "next";

import { DiaryFilter } from "@/components/diary/diary-filter";
import { JournalSection } from "@/components/journal/journal-section";
import { MEMO_LABEL, MEMO_OVERLINE } from "@/lib/diary-labels";
import { getMemoEntries } from "@/lib/memo";

export const metadata: Metadata = {
  title: MEMO_LABEL,
  description: "文章メモをまとめた一覧ページです。",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function MemoPage() {
  const entries = await getMemoEntries(100);

  return (
    <div className="mx-auto max-w-content space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12">
      <JournalSection variant="listing">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{MEMO_OVERLINE}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">{MEMO_LABEL}</h1>
      </JournalSection>

      <DiaryFilter
        entries={entries}
        hrefBase="/memo"
        showViewCount={false}
        emptyMessage="該当するメモはありません。"
      />
    </div>
  );
}
