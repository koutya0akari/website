"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { SmartLink } from "@/components/smart-link";

const NAV_ITEMS = [
  { label: "ホーム", href: "/" },
  { label: "研究関心", href: "/#focus" },
  { label: "プロジェクト", href: "/#projects" },
  { label: "Math Diary", href: "/diary" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030817]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-wide">
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">Akari</span>
          <span className="font-display text-white">Math Lab</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <div className="flex gap-5 text-sm text-white/80">
            {NAV_ITEMS.map((item) => (
              <SmartLink
                key={item.href}
                href={item.href}
                className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
              >
                {item.label}
              </SmartLink>
            ))}
          </div>
          <Link
            href="/diary"
            className="rounded-full border border-white/20 px-4 py-1 text-sm font-medium text-white transition hover:border-accent hover:text-accent"
          >
            Updates
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="text-white/80 transition hover:text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-[#030817] md:hidden"
          >
            <nav className="flex flex-col gap-4 p-6">
              {NAV_ITEMS.map((item) => (
                <SmartLink
                  key={item.href}
                  href={item.href}
                  className="text-base text-white/80 transition hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </SmartLink>
              ))}
              <Link
                href="/diary"
                className="inline-block w-fit rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-accent hover:text-accent"
                onClick={() => setIsOpen(false)}
              >
                Updates
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
