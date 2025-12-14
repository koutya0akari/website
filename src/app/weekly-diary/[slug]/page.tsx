import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiaryBody } from "@/components/diary/diary-body";
import { ReadingTime } from "@/components/reading-time";
import { getWeeklyDiaryBySlug } from "@/lib/weekly-diary";
import { formatDate, stripHtml } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getWeeklyDiaryBySlug(slug);
  if (!entry) {
    return { title: "Weekly Diary" };
  }

  const description = entry.summary ? stripHtml(entry.summary) : undefined;
  const ogImage = entry.heroImage?.url ?? "/tako.png";

  return {
    title: entry.title,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: "article",
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function WeeklyDiaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getWeeklyDiaryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <Link href="/weekly-diary" className="text-sm text-accent underline-offset-4 hover:underline">
        ← Weekly Diary 一覧へ戻る
      </Link>

      <article className="mt-6 space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-night-soft/80 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">{entry.folder ?? "Weekly Diary"}</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{entry.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <time>
              Published {formatDate(entry.publishedAt)}{" "}
              {entry.updatedAt && <span className="text-white/50">（更新 {formatDate(entry.updatedAt)}）</span>}
            </time>
            <span className="text-white/30">•</span>
            <ReadingTime content={entry.body} />
          </div>
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

        <DiaryBody html={entry.body} />
      </article>
    </div>
  );
}

