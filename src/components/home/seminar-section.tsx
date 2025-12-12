import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { seminarThemes } from "@/data/home";

export function SeminarSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 via-night-soft/40 to-night-soft/80 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(100,210,255,0.12),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(247,181,0,0.1),transparent_35%)]" />
      </div>
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Seminars</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">自主ゼミのテーマ</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <span className="rounded-full bg-white/10 px-3 py-1">Reading / Drafting</span>
          <span className="rounded-full border border-accent/40 px-3 py-1 text-accent">参考文献は随時追加</span>
        </div>
      </div>
      <div className="relative mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {seminarThemes.map((theme, index) => (
          <SpotlightCard
            key={theme.title}
            className="relative h-full space-y-3 overflow-hidden bg-white/5 p-6"
            spotlightColor="rgba(247, 181, 0, 0.25)"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10" />
            <div className="absolute -right-16 top-0 h-28 w-28 rotate-12 rounded-full bg-highlight/15 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/70">
                Seminar {index + 1}
                <span className="h-1 w-1 rounded-full bg-accent" />
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold text-accent">Reading</span>
            </div>
            <div className="relative space-y-2">
              <h3 className="text-lg font-semibold text-white">{theme.title}</h3>
              <p className="text-sm text-white/75">{theme.summary}</p>
            </div>
            {theme.references && (
              <div className="relative space-y-2 border-t border-white/10 pt-2 text-xs">
                <p className="text-white/60">References</p>
                <div className="flex flex-wrap gap-2">
                  {theme.references.map((ref) => (
                    <SmartLink
                      key={ref.url}
                      href={ref.url}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-accent underline-offset-4 hover:underline"
                    >
                      {ref.label}
                    </SmartLink>
                  ))}
                </div>
              </div>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
