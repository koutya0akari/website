"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App] Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Error</p>
      <h1 className="mt-4 text-4xl font-semibold">問題が発生しました</h1>
      <p className="mt-2 text-white/70">
        一時的なエラーの可能性があります。再読み込みで直らない場合は、時間をおいてお試しください。
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-night transition-colors hover:bg-accent/90"
        >
          再試行する
        </button>
        <Link
          href="/"
          className="rounded-full border border-transparent px-6 py-3 text-sm text-white hover:border-accent hover:text-accent"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
