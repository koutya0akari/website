"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { KATEX_PRERENDERED_CLASS } from "@/lib/katex";

const delimiters = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
  { left: "$", right: "$", display: false },
];

export function KaTeXProvider() {
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    async function renderMath() {
      const { default: renderMathInElement } = await import("katex/dist/contrib/auto-render");
      if (!active) return;
      renderMathInElement(document.body, {
        delimiters,
        throwOnError: false,
        ignoredClasses: [KATEX_PRERENDERED_CLASS],
      });
    }

    renderMath();

    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
