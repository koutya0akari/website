import type { SiteContent } from "@/lib/types";

type FocusSectionProps = {
  focuses: SiteContent["focuses"];
};

export function FocusSection({ focuses }: FocusSectionProps) {
  if (focuses.length === 0) return null;

  return (
    <section id="focus" className="space-y-5 rounded-[30px] border border-white/10 bg-night-soft/70 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Research Tracks</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">今追いかけている軸</h2>
          <p className="text-sm text-white/70">抽象的な視点で数学をまとめるためのレールを3本に整理。</p>
        </div>
        <div className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70">
          学びのノイズを減らすための行き先メモ
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {focuses.map((focus) => (
          <article
            key={focus.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-accent/70"
          >
            <div className="absolute right-3 top-3 h-12 w-12 rounded-full bg-accent/10 blur-2xl" />
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{focus.id}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{focus.title}</h3>
            <p className="mt-2 text-sm text-white/75">{focus.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
