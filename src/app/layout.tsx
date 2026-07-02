import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Signika_Negative } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { CommandPalette } from "@/components/command-palette";
import { ScrollProgress } from "@/components/scroll-progress";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// CJK フォントは preload 可能な subset を持たない（`subsets: ["latin"]` だと
// 日本語グリフが system フォントに落ちる）。`preload: false` で unicode-range
// 分割された全スライスを self-host し、日本語も Noto で描画されるようにする。
const noto = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

const signika = Signika_Negative({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-signika",
  display: "swap",
});

const defaultOgImage =
  "/api/og?title=Akari%20Math%20Lab&summary=%E6%95%B0%E5%AD%A6%E3%81%AE%E5%8B%89%E5%BC%B7%E3%83%95%E3%82%A9%E3%83%BC%E3%82%AB%E3%82%B9%E3%81%A8%E7%99%BA%E8%A1%A8%E8%B3%87%E6%96%99%E3%82%92%E3%81%BE%E3%81%A8%E3%82%81%E3%81%9F%E3%83%9D%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%AA%E3%82%AA%E3%80%82&author=akari0koutya";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.akari0koutya.com"),
  title: {
    default: "Akari Math Lab",
    template: "%s | Akari Math Lab",
  },
  description:
    " Akari のリサーチ・日記・資料をまとめるポートフォリオ。Vercel + microCMS で運用します。",
  openGraph: {
    title: "Akari Math Lab",
    description: "数学の勉強フォーカスと発表資料をまとめたポートフォリオ。Vercel と microCMS で管理。",
    url: "https://www.akari0koutya.com",
    siteName: "Akari Math Lab",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Akari Math Lab share image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akari Math Lab",
    description: " Akari の研究・発表資料をまとめたポートフォリオ。",
    images: [defaultOgImage],
  },
  icons: {
    icon: "/tako.png",
    shortcut: "/tako.png",
    apple: "/tako.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${noto.variable} ${signika.variable}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-medium focus:text-night focus:shadow-lg"
        >
          本文へスキップ
        </a>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <ScrollProgress />
            <ScrollToTop />
            <SiteHeader />
            <div id="main-content" tabIndex={-1} className="flex-1 pb-16">
              {children}
            </div>
            <SiteFooter />
          </div>
          <CommandPalette />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
