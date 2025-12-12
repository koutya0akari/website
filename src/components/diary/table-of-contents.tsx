"use client";

import { useEffect, useState, useCallback } from "react";
import { List, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  html: string;
}

export function TableOfContents({ html }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse HTML to extract headings
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4");

    const tocItems: TocItem[] = [];
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      tocItems.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName[1]),
      });
    });

    setItems(tocItems);
  }, [html]);

  // Intersection Observer for active heading
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  if (items.length < 2) return null;

  return (
    <div className="sticky top-24">
      <div className="rounded-2xl border border-white/10 bg-night-soft/80 backdrop-blur-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <List className="h-4 w-4 text-accent" />
            目次
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-white/50" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <nav className="border-t border-white/10 p-4 pt-2">
                <ul className="space-y-1">
                  {items.map((item) => {
                    const isActive = activeId === item.id;
                    const indent = (item.level - 1) * 12;

                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToHeading(item.id)}
                          className={`group relative flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-all ${
                            isActive
                              ? "bg-accent/10 text-accent"
                              : "text-white/60 hover:bg-white/5 hover:text-white/80"
                          }`}
                          style={{ paddingLeft: `${indent + 12}px` }}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="toc-indicator"
                              className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-accent"
                              transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            />
                          )}

                          {/* Level indicator dot */}
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              isActive ? "bg-accent" : "bg-white/30 group-hover:bg-white/50"
                            }`}
                          />

                          {/* Text */}
                          <span className="truncate">{item.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Progress indicator */}
              <div className="border-t border-white/10 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>
                    {items.findIndex((item) => item.id === activeId) + 1} / {items.length}
                  </span>
                  <span>セクション</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-highlight"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((items.findIndex((item) => item.id === activeId) + 1) / items.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

