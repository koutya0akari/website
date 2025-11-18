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
    <section className="grid gap-6 rounded-[32px] border border-white/10 bg-night-soft/50 p-6 sm:p-8 md:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Resources</p>
        <h2 className="text-2xl font-semibold sm:text-3xl">公開資料</h2>
        <ResourceGrid resources={resources} />
        <Link href="/resources" className="inline-block text-sm text-accent underline underline-offset-4">
          その他の資料を見る
        </Link>
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-xl font-semibold">Contact</h3>
        <p className="text-white/70">連絡は下記よりお気軽にどうぞ。</p>
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
