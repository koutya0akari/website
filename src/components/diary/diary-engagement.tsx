'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akari0koutya.com";
const SHOW_LIKE_COUNT = process.env.NEXT_PUBLIC_SHOW_LIKE_COUNT === "true";

const likeStorageKey = (id: string) => `math-diary-like:${id}`;
const likeCountKey = (id: string) => `math-diary-like-count:${id}`;

type DiaryEngagementProps = {
  entryId: string;
  title: string;
  summary?: string;
};

export function DiaryEngagement({ entryId, title, summary }: DiaryEngagementProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [liked, setLiked] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(likeStorageKey(entryId));
    setLiked(stored === "true");

    const storedCountRaw = window.localStorage.getItem(likeCountKey(entryId));
    const parsed = storedCountRaw ? Number(storedCountRaw) : 0;
    setLikeCount(Number.isNaN(parsed) ? 0 : parsed);
  }, [entryId]);

  const shareUrl = useMemo(() => {
    const url = new URL(pathname ?? "/", SITE_ORIGIN);
    return url.toString();
  }, [pathname]);

  const handleToggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      window.localStorage.setItem(likeStorageKey(entryId), String(next));
      setLikeCount((prevCount) => {
        const delta = next ? 1 : -1;
        const updated = Math.max(0, prevCount + delta);
        window.localStorage.setItem(likeCountKey(entryId), String(updated));
        return updated;
      });
      return next;
    });
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("リンクをコピーしました");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (error) {
      setCopyMessage("コピーに失敗しました");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  }, [shareUrl]);

  const trimmedSummary = (summary ?? "Math Diary").slice(0, 50);
  const shareText = encodeURIComponent(`${title}\n${trimmedSummary}`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = [
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    },
    {
      label: "Note",
      href: `https://note.com/intent/post?url=${encodedUrl}&body=${shareText}`,
    },
  ];

  const canNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  const handleNativeShare = useCallback(() => {
    if (!canNativeShare) return;
    navigator.share({ url: shareUrl, title, text: trimmedSummary }).catch(() => undefined);
  }, [canNativeShare, shareUrl, title, trimmedSummary]);

  const showDeveloperLikeCount = useMemo(() => {
    if (SHOW_LIKE_COUNT) return true;
    return Boolean(searchParams?.has("devLikes"));
  }, [searchParams]);

  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggleLike}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            liked ? "bg-accent text-black" : "bg-white/10 text-white"
          }`}
        >
          <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
          いいね
          {showDeveloperLikeCount && <span className="text-xs text-white/80">{likeCount}</span>}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            📱 シェア
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/80 transition hover:border-accent/80 hover:text-accent"
          >
            ↗ {link.label} で共有
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/80 transition hover:border-accent/80 hover:text-accent"
        >
          🔗 リンクをコピー
        </button>
      </div>
      {copyMessage && <p className="text-sm text-white/70">{copyMessage}</p>}
    </section>
  );
}
