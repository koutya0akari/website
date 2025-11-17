import Link from "next/link";

import type { DiaryEntry } from "@/lib/types";
import { createExcerpt, formatDate } from "@/lib/utils";

type DiaryCardProps = {
  entry: DiaryEntry;
  compact?: boolean;
};

export function DiaryCard({ entry, compact = false }: DiaryCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-0.5 hover:border-accent/80 hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">{entry.folder ?? "Diary"}</span>
        <time className="text-sm text-white/60">{formatDate(entry.publishedAt)}</time>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">
          <Link href={`/diary/${entry.slug}`} className="hover:text-accent">
            {entry.title}
          </Link>
        </h3>
        <p className="mt-2 text-white/70">{entry.summary || createExcerpt(entry.body)}</p>
      </div>
      {!compact && entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
