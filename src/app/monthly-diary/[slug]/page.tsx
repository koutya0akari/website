import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiaryBody } from "@/components/diary/diary-body";
import { TableOfContents } from "@/components/diary/table-of-contents";
import { JournalSection } from "@/components/journal/journal-section";
import { ShareToX } from "@/components/share-to-x";
import { MONTHLY_DIARY_LABEL, MONTHLY_DIARY_OVERLINE } from "@/lib/diary-labels";
import { getMonthlyDiaryBySlug } from "@/lib/monthly-diary";
import { formatMonthlyDiaryLabel, getMonthlyDiarySummary } from "@/lib/monthly-diary-utils";
import { createExcerpt, formatDate, stripHtml } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.akari0koutya.com";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMonthlyDiaryBySlug(slug);
  if (!entry) {
    return { title: MONTHLY_DIARY_LABEL };
  }

  const description = createExcerpt(stripHtml(entry.summary || entry.body), 180);
  const tags = (entry.tags ?? []).slice(0, 6).map((tag) => `#${tag.replace(/^#/, "")}`);
  const withTags = tags.length > 0 ? `${description} ${tags.join(" ")}` : description;
  const ogImage = `/api/og?title=${encodeURIComponent(entry.title)}&summary=${encodeURIComponent(description)}&tags=${encodeURIComponent(tags.join(" "))}&author=akari0koutya`;

  return {
    title: entry.title,
    description: withTags,
    openGraph: {
      title: entry.title,
      description: withTags,
      type: "article",
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: withTags,
      creator: "@akari0koutya",
      site: "@akari0koutya",
      images: [ogImage],
    },
  };
}

export default async function MonthlyDiaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getMonthlyDiaryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const monthLabel = formatMonthlyDiaryLabel(entry.publishedAt);
  const summary = getMonthlyDiarySummary(entry.summary, entry.body, 260);
  const shareUrl = `${SITE_URL}/monthly-diary/${entry.slug}`;
  const shareTags = entry.tags?.slice(0, 6).map((tag) => tag.replace(/^#/, "")) ?? [];
  const shareText = [entry.title, monthLabel].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <Link href="/monthly-diary" className="text-sm text-accent underline-offset-4 hover:underline">
        ← {MONTHLY_DIARY_LABEL} 一覧へ戻る
      </Link>

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="space-y-8">
          <JournalSection variant="page">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{MONTHLY_DIARY_OVERLINE}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">{entry.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">{summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span>{monthLabel}</span>
              <span className="text-white/30">•</span>
              <time>
                Published {formatDate(entry.publishedAt)}
                {entry.updatedAt && (
                  <span className="text-white/45"> （更新 {formatDate(entry.updatedAt)}）</span>
                )}
              </time>
              <ShareToX url={shareUrl} text={shareText} hashtags={shareTags} via="akari0koutya" />
            </div>

            {entry.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
                {entry.tags.map((tag) => (
                  <span key={tag} className="tag-chip !border-0 bg-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </JournalSection>

          {entry.heroImage?.url && (
            <div className="relative overflow-hidden rounded-3xl shadow-[0_18px_48px_rgba(2,8,20,0.22)]">
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

          <section className="rounded-[32px] bg-night-soft/75 p-6 shadow-[0_18px_48px_rgba(2,8,20,0.18)] sm:p-8">
            <DiaryBody html={entry.body} />
          </section>
        </article>

        <aside className="hidden xl:block">
          <TableOfContents html={entry.body} />
        </aside>
      </div>
    </div>
  );
}
