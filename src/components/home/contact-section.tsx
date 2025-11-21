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
    <section className="grid gap-6 rounded-[30px] border border-white/10 bg-white/5 p-6 sm:p-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Resources</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">公開資料</h2>
            <p className="text-sm text-white/70">スライド・配布資料・メモのスナップショット。</p>
          </div>
          <Link href="/resources" className="text-xs text-accent underline underline-offset-4">
            全て
          </Link>
        </div>
        <ResourceGrid resources={resources} />
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-night-soft to-night p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Contact</h3>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">Open</span>
        </div>
        <p className="text-white/70">数学の勉強会・資料作成の依頼など、お気軽にどうぞ。</p>
        <div className="flex flex-wrap gap-3">
          {contactEntries.map((link) => (
            <SmartLink
              key={link.id}
              href={link.url}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-accent hover:text-accent hover:scale-105 active:scale-95"
            >
              {link.label}
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
