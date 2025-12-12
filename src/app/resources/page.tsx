import type { Metadata } from "next";

import { ResourceGrid } from "@/components/resources/resource-grid";
import { getResourceItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resources",
  description: "使用したスライドや配布資料を一覧で公開しています。",
};

export const revalidate = 300;

export default async function ResourcesPage() {
  const resources = await getResourceItems();

  return (
    <div className="mx-auto max-w-content px-6 py-12 space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-night-soft to-night p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Resources</p>
        <h1 className="mt-3 text-4xl font-semibold">公開資料</h1>
      </section>
      <ResourceGrid resources={resources} />
    </div>
  );
}
