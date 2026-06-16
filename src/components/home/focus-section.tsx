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
      className="glass-panel rounded-2xl p-5 sm:p-8"
    >
      <div className="relative z-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Research Tracks</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">今追いかけている軸</h2>
            <p className="text-sm text-white/70">抽象的な視点で数学をまとめるためのレールを3本に整理。</p>
          </div>
        </div>
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {focuses.map((focus, index) => (
            <article
              key={focus.id}
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-accent/60 sm:p-5"
            >
              <span className="absolute right-4 top-3 font-display text-4xl text-white/[0.05]">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <div className="flex items-start justify-between gap-3">
                <span className="border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-accent">
                  {focus.id}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">{focus.title}</h3>
              <RichText content={focus.description} className="mt-2 prose-sm text-white/75" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
