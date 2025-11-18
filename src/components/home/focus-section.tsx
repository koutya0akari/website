import type { SiteContent } from "@/lib/types";

type FocusSectionProps = {
  focuses: SiteContent["focuses"];
};

export function FocusSection({ focuses }: FocusSectionProps) {
  if (focuses.length === 0) return null;

  return (
    <section
      id="focus"
      className="grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {focuses.map((focus) => (
        <article key={focus.id} className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">{focus.id}</p>
          <h3 className="text-xl font-semibold">{focus.title}</h3>
          <p className="text-white/70">{focus.description}</p>
        </article>
      ))}
    </section>
  );
}
