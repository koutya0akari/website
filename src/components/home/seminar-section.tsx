import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { seminarThemes } from "@/data/home";

export function SeminarSection() {
  return (
    <section className="space-y-6 rounded-[32px] border border-white/10 bg-night-soft/70 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Seminar Themes</p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">自主ゼミのテーマ</h2>
        <p className="text-white/70">
          研究の軸となる書籍やゼミ活動をまとめました。導来代数幾何と圏論を中心に、関連する環論・組版・表現論を往復しています。
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {seminarThemes.map((theme) => (
          <SpotlightCard key={theme.title} className="space-y-3 p-6">
            <h3 className="text-xl font-semibold text-white">{theme.title}</h3>
            <p className="text-white/70">{theme.summary}</p>
            {theme.references && (
              <div className="flex flex-wrap gap-3 text-sm">
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
