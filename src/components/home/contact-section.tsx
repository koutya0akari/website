import Link from "next/link";

import { ResourceGrid } from "@/components/resources/resource-grid";
import { SmartLink } from "@/components/smart-link";
import { directContacts } from "@/data/home";
import type { SiteContent, ResourceItem } from "@/lib/types";

type ContactSectionProps = {
  site: SiteContent;
  resources: ResourceItem[];
};

export function ContactSection({ site, resources }: ContactSectionProps) {
  const existingContactIds = new Set(site.contactLinks.map((link) => link.id));
  const additionalContactLinks = directContacts.filter((contact) => !existingContactIds.has(contact.id));
  const contactEntries = [...site.contactLinks, ...additionalContactLinks];

  return (
    <section className="relative grid gap-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 md:grid-cols-[1.15fr_0.85fr]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(100,210,255,0.12),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(247,181,0,0.12),transparent_35%)]" />
      </div>
      <div className="relative space-y-4 rounded-[28px] border border-white/10 bg-black/10 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Resources</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">公開資料</h2>
            <p className="text-sm text-white/70">スライド・配布資料・メモ。</p>
          </div>
          <Link href="/resources" className="rounded-full bg-white/10 px-3 py-1 text-xs text-accent underline-offset-4 hover:underline">
            全て
          </Link>
        </div>
        <ResourceGrid resources={resources} />
      </div>
      <div className="relative space-y-4 rounded-[28px] border border-white/10 bg-gradient-to-b from-night-soft to-night p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-3 rounded-[22px] border border-white/5" />
          <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Contact</h3>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Open</span>
        </div>
        <div className="relative flex flex-wrap gap-3">
          {contactEntries.map((link) => (
            <SmartLink
              key={link.id}
              href={link.url}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
            >
              {link.label}
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
