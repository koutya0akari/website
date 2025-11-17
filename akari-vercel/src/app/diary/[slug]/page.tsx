import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiaryBody } from "@/components/diary/diary-body";
import { getDiaryBySlug, getDiaryEntries } from "@/lib/microcms";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: { slug: string };
  searchParams?: { draftKey?: string };
};

export const revalidate = 180;

export async function generateStaticParams() {
  const diaries = await getDiaryEntries(40);
  return diaries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = await getDiaryBySlug(params.slug);
  if (!entry) {
    return { title: "Diary" };
  }

  return {
    title: entry.title,
    description: entry.summary,
  };
}

export default async function DiaryDetailPage({ params, searchParams }: PageProps) {
  const entry = await getDiaryBySlug(params.slug, searchParams?.draftKey);

  if (!entry) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link href="/diary" className="text-sm text-accent underline-offset-4 hover:underline">
        ← Diary 一覧へ戻る
      </Link>
      <div className="rounded-[32px] border border-white/10 bg-night-soft/80 p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{entry.folder ?? "Diary"}</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">{entry.title}</h1>
        <time className="mt-2 block text-sm text-white/70">
          Published {formatDate(entry.publishedAt)}{" "}
          {entry.updatedAt && <span className="text-white/50">（更新 {formatDate(entry.updatedAt)}）</span>}
        </time>
        {entry.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
            {entry.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {entry.heroImage?.url && (
        <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={entry.heroImage.url}
            alt={entry.heroImage.alt ?? entry.title}
            width={entry.heroImage.width ?? 1600}
            height={entry.heroImage.height ?? 900}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}
      <DiaryBody html={entry.body} />
    </article>
  );
}
