import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiaryBody } from "@/components/diary/diary-body";
import { DiaryEngagement } from "@/components/diary/diary-engagement";
import { Comments } from "@/components/diary/comments";
import { TableOfContents } from "@/components/diary/table-of-contents";
import { DiaryViewBadge } from "@/components/diary/view-badge";
import { ReadingTime } from "@/components/reading-time";
import { ShareToX } from "@/components/share-to-x";
import { getDiaryBySlug } from "@/lib/diary";
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
  const entry = await getDiaryBySlug(slug);
  if (!entry) {
    return { title: "Math Diary" };
  }

  const summary = entry.summary ? stripHtml(entry.summary) : "";
  const description = createExcerpt(summary, 180);
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
      images: [
        {
          url: ogImage,
        },
      ],
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

export default async function DiaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getDiaryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const shareUrl = `${SITE_URL}/diary/${entry.slug}`;
  const shareTags = entry.tags?.slice(0, 6).map((tag) => tag.replace(/^#/, "")) ?? [];
  const tagText = shareTags.slice(0, 3).map((tag) => `#${tag}`).join(" ");
  const shareText = [entry.title, tagText].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <Link href="/diary" className="text-sm text-accent underline-offset-4 hover:underline">
        ← Math Diary 一覧へ戻る
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="space-y-8">
          <div className="rounded-[32px] border border-white/10 bg-night-soft/80 p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{entry.folder ?? "Math Diary"}</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{entry.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <time>
                Published {formatDate(entry.publishedAt)}{" "}
                {entry.updatedAt && <span className="text-white/50">（更新 {formatDate(entry.updatedAt)}）</span>}
              </time>
              <span className="text-white/30">•</span>
              <ReadingTime content={entry.body} />
              <span className="text-white/30">•</span>
              <DiaryViewBadge slug={entry.slug} initialCount={entry.viewCount} />
              <ShareToX url={shareUrl} text={shareText} hashtags={shareTags} via="akari0koutya" />
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
          {entry.heroImage?.url && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
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
          <DiaryEngagement entryId={entry.id} title={entry.title} summary={entry.summary} />
          <Comments />
        </article>
        {/* Desktop Sidebar */}
        <aside className="hidden space-y-6 lg:block">
          <TableOfContents html={entry.body} />
        </aside>
      </div>
    </div>
  );
}
