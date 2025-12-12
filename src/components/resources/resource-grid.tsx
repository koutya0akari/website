import type { ResourceItem } from "@/lib/types";
import { SmartLink } from "@/components/smart-link";

type ResourceGridProps = {
  resources: ResourceItem[];
};

export function ResourceGrid({ resources }: ResourceGridProps) {
  if (resources.length === 0) {
    return <p className="text-white/70">まだ公開中の資料がありません。。。</p>;
  }

  return (
    <div className="grid gap-4">
      {resources.map((item) => (
        <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">{item.category}</div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-white/70">{item.description}</p>
          </div>
          <SmartLink
            href={item.externalUrl ?? item.fileUrl}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-black"
          >
            開く
          </SmartLink>
        </article>
      ))}
    </div>
  );
}
