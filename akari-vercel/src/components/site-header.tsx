import Link from "next/link";

const NAV_ITEMS = [
  { label: "ホーム", href: "/" },
  { label: "研究関心", href: "/#focus" },
  { label: "プロジェクト", href: "/#projects" },
  { label: "Diary", href: "/diary" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030817]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-wide">
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">Akari</span>
          <span className="font-display text-white">Math Lab</span>
        </Link>
        <nav className="hidden gap-5 text-sm text-white/80 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/diary"
          className="rounded-full border border-white/20 px-4 py-1 text-sm font-medium text-white hover:border-accent hover:text-accent"
        >
          Updates
        </Link>
      </div>
    </header>
  );
}
