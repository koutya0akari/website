import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Signika_Negative } from "next/font/google";

import { KaTeXProvider } from "@/components/math/katex-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akari0koutya.com"),
  title: {
    default: "Akari Math Lab",
    template: "%s | Akari Math Lab",
  },
  description:
    "数学科学生 Akari のリサーチ・日記・資料をまとめるポートフォリオ。Vercel + microCMS で運用します。",
  openGraph: {
    title: "Akari Math Lab",
    description:
      "数学の活動記録、研究フォーカス、発表資料をまとめたポートフォリオ。Vercel と microCMS で管理。",
    url: "https://akari0koutya.com",
    siteName: "Akari Math Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akari Math Lab",
    description:
      "数学科学生 Akari の活動・研究・発表資料をまとめたポートフォリオ。",
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
    <html lang="ja">
      <body className={`${inter.variable} ${noto.variable} ${signika.variable}`}>
        <div className="flex min-h-screen flex-col">
          <KaTeXProvider />
          <SiteHeader />
          <div className="flex-1 pb-16">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
