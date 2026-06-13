// ナビゲーション中に即時表示するローディングスケルトン。
// App Router の loading.tsx 境界から利用し、クリック後の「固まる」体感を解消する。

const containerClass = "mx-auto max-w-content space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12";

export function ListPageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className={containerClass} aria-hidden>
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="h-9 w-64 rounded-lg bg-white/5" />
      </div>
      <div className="grid animate-pulse gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border border-transparent bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12" aria-hidden>
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-28 rounded bg-white/5" />
        <div className="space-y-3">
          <div className="h-10 w-3/4 rounded-lg bg-white/5" />
          <div className="h-4 w-40 rounded bg-white/5" />
        </div>
        <div className="h-56 rounded-2xl bg-white/5" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-white/5"
              style={{ width: `${90 - (i % 4) * 12}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
