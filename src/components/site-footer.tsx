import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { Github, Twitter, Mail, Heart, BookOpen, FolderOpen, User } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/koutya0akari", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/akari0koutya", label: "Twitter" },
  { icon: Mail, href: "mailto:koutya0akari@gmail.com", label: "Email" },
];

const NAV_LINKS = [
  { icon: BookOpen, href: "/diary" as const, label: "Math Diary" },
  { icon: FolderOpen, href: "/resources" as const, label: "Resources" },
  { icon: User, href: "/about" as const, label: "About" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-night/80 backdrop-blur-sm">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">Akari</span>
              <span className="font-display text-lg text-white">Math Lab</span>
            </Link>
            <p className="text-sm text-white/50">
              代数幾何・圏論を中心に学習を続けています。<br />
              数学の世界を探求する日々の記録。
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-white/70">Navigation</h3>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-white/50 transition hover:text-accent"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <a
                href="/sitemap.xml"
                className="flex items-center gap-2 text-sm text-white/50 transition hover:text-accent"
              >
                <span className="h-4 w-4 text-center text-xs">🗺️</span>
                Sitemap
              </a>
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-white/70">Connect</h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                    aria-label={link.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {currentYear} Akari Math Lab. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-400" /> using Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
