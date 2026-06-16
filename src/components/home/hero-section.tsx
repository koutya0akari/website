import { SmartLink } from "@/components/smart-link";
import { RichText } from "@/components/rich-text";
import type { SiteContent } from "@/lib/types";

type HeroSectionProps = {
  site: SiteContent;
};

export function HeroSection({ site }: HeroSectionProps) {
  return (
    <section className="glass-panel rounded-2xl p-5 text-white sm:p-7 lg:p-9">
      <div className="relative z-10">
        <div className="max-w-3xl space-y-5 sm:space-y-7">
          <div className="space-y-3">
            <RichText
              content={
                site.heroLead ||
                "代数幾何・圏論を軸に学習しています。数学ノートやメモなどの保管場所。"
              }
              className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg"
              prose={false}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
              <SmartLink
                href={site.heroSecondaryCtaUrl}
                className="w-full rounded-md border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-accent hover:text-accent sm:w-auto sm:px-6"
              >
                {site.heroSecondaryCtaLabel}
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
