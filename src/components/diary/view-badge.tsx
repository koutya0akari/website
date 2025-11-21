'use client';

import { useEffect, useState } from "react";

type DiaryViewBadgeProps = {
  slug: string;
  initialCount?: number;
};

export function DiaryViewBadge({ slug, initialCount }: DiaryViewBadgeProps) {
  const [count, setCount] = useState<number | null>(
    typeof initialCount === "number" && Number.isFinite(initialCount) ? initialCount : null,
  );

  useEffect(() => {
    let canceled = false;

    async function increment() {
      try {
        const res = await fetch("/api/diary/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { viewCount?: number };
        if (!canceled && typeof data.viewCount === "number" && Number.isFinite(data.viewCount)) {
          setCount(data.viewCount);
        }
      } catch (error) {
        console.error("[DiaryViewBadge] failed to increment view", error);
      }
    }

    increment();
    return () => {
      canceled = true;
    };
  }, [slug]);

  const label =
    typeof count === "number" && Number.isFinite(count) ? `${count.toLocaleString("ja-JP")} PV` : "PV集計中";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      <span aria-hidden>👁️</span>
      {label}
    </span>
  );
}
