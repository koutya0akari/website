import type { ResourceItem } from "@/lib/types";
import { SmartLink } from "@/components/smart-link";
import { RichText } from "@/components/rich-text";

type ResourceGridProps = {
  resources: ResourceItem[];
};

export function ResourceGrid({ resources }: ResourceGridProps) {
  if (resources.length === 0) {
    return <p className="text-white/70">まだ公開中の資料がありません。</p>;
  }

  return (
    <div className="grid gap-4">
      {resources.map((item) => (
        <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-transparent bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">{item.category}</div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            {item.description.trim() ? (
              <RichText content={item.description} className="prose-sm text-white/70" />
            ) : null}
          </div>
          <SmartLink
            href={item.externalUrl ?? item.fileUrl}
            target="_blank"
            className="inline-flex shrink-0 items-center justify-center self-start whitespace-nowrap rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-black sm:self-center"
          >
            開く
          </SmartLink>
        </article>
      ))}
    </div>
  );
}
