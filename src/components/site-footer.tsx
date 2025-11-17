import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Akari Math Lab. Built with Next.js + microCMS.</p>
        <div className="flex flex-wrap gap-4">
          <a href="/sitemap.xml" className="hover:text-white">
            Sitemap
          </a>
          <Link href="/resources" className="hover:text-white">
            Resources
          </Link>
          <Link href="/diary" className="hover:text-white">
            Math Diary
          </Link>
        </div>
      </div>
    </footer>
  );
}
