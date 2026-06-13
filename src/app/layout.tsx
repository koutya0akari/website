import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Signika_Negative } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { CommandPalette } from "@/components/command-palette";
import { InteractiveBackground } from "@/components/interactive-background";
import { KaTeXProvider } from "@/components/math/katex-provider";
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

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const signika = Signika_Negative({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-signika",
  display: "swap",
});

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
        url: "/tako.png",
        width: 512,
        height: 512,
        alt: "Akari Math Lab logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akari Math Lab",
    description: " Akari の研究・発表資料をまとめたポートフォリオ。",
    images: ["/tako.png"],
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
            <KaTeXProvider />
            <InteractiveBackground />
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
