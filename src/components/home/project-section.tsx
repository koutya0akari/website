import { SmartLink } from "@/components/smart-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { RichText } from "@/components/rich-text";
import type { SiteContent } from "@/lib/types";

type ProjectSectionProps = {
  projects: SiteContent["projects"];
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <section id="projects" className="relative overflow-hidden rounded-2xl border border-white/10 bg-night-soft p-5 sm:p-8">
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Activities</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">活動</h2>
        </div>
      </div>
      <div className="relative mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <SpotlightCard
            key={project.id}
            className="relative h-full space-y-3 overflow-hidden bg-white/5 p-5 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <RichText content={project.summary} className="prose-sm text-white/75" />
            <div className="space-y-2 text-sm text-white/70">
              {project.highlights.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight" />
                  <RichText
                    content={item}
                    as="span"
                    inline
                    className="rounded-2xl bg-black/20 px-2 py-1"
                    prose={false}
                  />
                </div>
              ))}
            </div>
            {project.link && (
              <SmartLink
                href={project.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:translate-x-0.5"
              >
                詳細へ
                <span aria-hidden>→</span>
              </SmartLink>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
