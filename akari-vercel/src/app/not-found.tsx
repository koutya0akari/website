import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">404</p>
      <h1 className="mt-4 text-4xl font-semibold">ページが見つかりません</h1>
      <p className="mt-2 text-white/70">リンクが変更されたか、まだ公開前のページかもしれません。</p>
      <Link href="/" className="mt-6 rounded-full border border-white/40 px-6 py-3 text-sm text-white hover:border-accent hover:text-accent">
        ホームへ戻る
      </Link>
    </div>
  );
}
