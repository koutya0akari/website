import type { SiteContent } from "@/lib/types";
import { RichText } from "@/components/rich-text";

type FocusSectionProps = {
  focuses: SiteContent["focuses"];
};

export function FocusSection({ focuses }: FocusSectionProps) {
  if (focuses.length === 0) return null;

  return (
    <section
      id="focus"
      className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-night-soft via-night to-night-muted p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(100,210,255,0.12),transparent_35%),radial-gradient(circle_at_92%_10%,rgba(247,181,0,0.12),transparent_30%)]" />
        <div className="absolute left-10 top-0 h-full w-px bg-gradient-to-b from-white/15 via-white/5 to-transparent" />
      </div>
      <div className="relative grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Research Tracks</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">今追いかけている軸</h2>
            <p className="text-sm text-white/70">抽象的な視点で数学をまとめるためのレールを3本に整理。</p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-black/30 p-4 text-sm text-white/75">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/55">
              <span>Planning</span>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-[10px] font-semibold text-accent">in practice</span>
            </div>
            <div className="mt-3 space-y-2">
              <p>・圏論の視野で抽象化 → 証明を自分の言葉で再構成。</p>
              <p>・ノート化までを1スプリントに区切り、公開を前提に整理。</p>
              <p>・セミナーと個人学習をつなぎ、関連する話題を並走させる。</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">
            学びのノイズを減らすための行き先メモ
            <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
          </div>
        </div>
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {focuses.map((focus, index) => (
            <article
              key={focus.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent via-highlight to-accent/40" />
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-accent">
                  {focus.id}
                </span>
                <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Track {index + 1}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">{focus.title}</h3>
              <RichText content={focus.description} className="mt-2 prose-sm text-white/75" />
              <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
                <span className="h-px flex-1 bg-gradient-to-r from-accent/60 via-white/30 to-transparent" />
                <span>Notes ready</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
