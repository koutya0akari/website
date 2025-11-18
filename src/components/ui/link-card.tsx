"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type OgData = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url: string;
};

export function LinkCard({ url }: { url: string }) {
  const [data, setData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOg = async () => {
      try {
        const res = await fetch(`/api/og-proxy?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Failed to fetch OGP");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOg();
  }, [url]);

  if (error) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-4 flex items-center gap-2 break-all rounded-lg border border-white/10 bg-white/5 p-4 text-accent hover:underline"
      >
        <ExternalLink size={16} />
        {url}
      </a>
    );
  }

  if (loading) {
    return (
      <div className="my-4 h-[120px] w-full animate-pulse rounded-xl border border-white/10 bg-white/5" />
    );
  }

  if (!data) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group my-6 flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-night-soft/50 transition hover:border-accent/50 hover:bg-night-soft md:h-[120px] md:flex-row"
    >
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-bold text-white group-hover:text-accent sm:text-lg">
            {data.title || url}
          </h3>
          {data.description && (
            <p className="line-clamp-1 text-xs text-white/60 sm:line-clamp-2 sm:text-sm">
              {data.description}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
          {data.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.favicon} alt="" className="h-4 w-4 object-contain" />
          )}
          <span className="line-clamp-1">{data.siteName || new URL(url).hostname}</span>
        </div>
      </div>
      {data.image && (
        <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-full md:w-[200px]">
          <Image
            src={data.image}
            alt={data.title || "Link preview"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized // 外部画像の最適化をスキップ（ドメイン設定回避のため）
          />
        </div>
      )}
    </a>
  );
}
