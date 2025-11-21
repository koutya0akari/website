import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { seminarThemes } from "@/data/home";

export function SeminarSection() {
  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Seminars</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">自主ゼミのテーマ</h2>
          <p className="text-sm text-white/70">
            書籍を読み抜き、ノートを公開するためのテーマ群。圏論から組版まで横断でメモしています。
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">Reading / Drafting</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {seminarThemes.map((theme) => (
          <SpotlightCard key={theme.title} className="relative space-y-3 p-6">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <h3 className="text-lg font-semibold text-white">{theme.title}</h3>
            <p className="text-sm text-white/75">{theme.summary}</p>
            {theme.references && (
              <div className="flex flex-wrap gap-3 text-xs">
                {theme.references.map((ref) => (
                  <SmartLink key={ref.url} href={ref.url} className="text-accent underline underline-offset-4">
                    {ref.label}
                  </SmartLink>
                ))}
              </div>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
