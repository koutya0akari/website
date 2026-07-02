"use client";

import { useEffect, useState } from "react";
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
  const [failedImage, setFailedImage] = useState(false);
  const [failedFavicon, setFailedFavicon] = useState(false);

  useEffect(() => {
    const fetchOg = async () => {
      setLoading(true);
      setError(false);
      setFailedImage(false);
      setFailedFavicon(false);

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

  const hostname = getHostname(url);

  if (error) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-4 flex items-center gap-2 break-all rounded-lg border border-transparent bg-night-muted p-4 text-accent hover:underline"
      >
        <ExternalLink size={16} />
        {url}
      </a>
    );
  }

  if (loading) {
    return (
      <div className="my-4 h-[120px] w-full animate-pulse rounded-xl border border-transparent bg-night-muted" />
    );
  }

  if (!data) return null;

  const imageSrc = !failedImage ? data.image : undefined;
  const faviconSrc = !failedFavicon ? data.favicon : undefined;
  const previewSrc = imageSrc || faviconSrc;
  const isFaviconPreview = Boolean(!imageSrc && faviconSrc);
  const fallbackInitial = (data.siteName || hostname || url).trim().charAt(0).toUpperCase();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose group my-6 flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-night-soft text-left no-underline transition hover:border-accent/50 hover:bg-night-soft md:min-h-[136px] md:flex-row"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 space-y-2">
          <h3 className="m-0 line-clamp-2 break-words text-base font-bold leading-snug text-white transition group-hover:text-accent sm:text-lg">
            {data.title || url}
          </h3>
          {data.description && (
            <p className="m-0 line-clamp-2 break-words text-xs leading-relaxed text-white/62 sm:text-sm">
              {data.description}
            </p>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-2 text-xs text-white/55">
          {faviconSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconSrc}
              alt=""
              className="m-0 h-4 w-4 shrink-0 rounded-sm object-contain"
              onError={() => setFailedFavicon(true)}
            />
          )}
          <span className="line-clamp-1 min-w-0 break-all">{data.siteName || hostname}</span>
        </div>
      </div>
      <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center overflow-hidden border-t border-white/10 md:aspect-auto md:w-[220px] md:border-l md:border-t-0">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={data.title || "リンクプレビュー"}
            loading="lazy"
            decoding="async"
            className={`m-0 h-full w-full transition duration-500 group-hover:scale-105 ${
              isFaviconPreview ? "p-10 object-contain md:p-12" : "object-cover"
            }`}
            onError={() => {
              if (imageSrc) {
                setFailedImage(true);
                return;
              }

              setFailedFavicon(true);
            }}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-night-muted text-2xl font-semibold text-white/70">
            {fallbackInitial || <ExternalLink className="h-7 w-7" aria-hidden="true" />}
          </div>
        )}
      </div>
    </a>
  );
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
