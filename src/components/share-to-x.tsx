import { Twitter } from "lucide-react";

type ShareToXProps = {
  url: string;
  text: string;
  hashtags?: string[];
  via?: string;
};

export function ShareToX({ url, text, hashtags, via = "akari0koutya" }: ShareToXProps) {
  const hashtagParam =
    hashtags && hashtags.length > 0 ? `&hashtags=${encodeURIComponent(hashtags.map((t) => t.replace(/^#/, "")).join(","))}` : "";
  const viaParam = via ? `&via=${encodeURIComponent(via.replace(/^@/, ""))}` : "";
  const intentUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}${hashtagParam}${viaParam}`;

  return (
    <a
      href={intentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-accent hover:text-accent"
      aria-label="Xで共有"
      title="Xで共有"
    >
      <Twitter className="h-3.5 w-3.5" />
      Share
    </a>
  );
}
