"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  FileText,
  Home,
  User,
  FolderOpen,
  BookOpen,
  Hash,
  ArrowRight,
  Command,
  CornerDownLeft,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  href: string;
  type: "page" | "diary" | "resource" | "tag";
  icon: React.ReactNode;
}

const STATIC_PAGES: SearchResult[] = [
  { id: "home", title: "ホーム", description: "トップページへ", href: "/", type: "page", icon: <Home className="h-4 w-4" /> },
  { id: "diary", title: "Math Diary", description: "学習記録一覧", href: "/diary", type: "page", icon: <BookOpen className="h-4 w-4" /> },
  { id: "resources", title: "Resources", description: "公開資料", href: "/resources", type: "page", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "about", title: "About", description: "プロフィール", href: "/about", type: "page", icon: <User className="h-4 w-4" /> },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open/Close handlers
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setResults(STATIC_PAGES);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Keyboard shortcut to open (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(STATIC_PAGES);
      return;
    }

    setLoading(true);

    // Filter static pages
    const filteredPages = STATIC_PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    try {
      // Search diary entries
      const res = await fetch(`/api/admin/diary?limit=10`);
      if (res.ok) {
        const { data } = await res.json();
        const diaryResults: SearchResult[] = (data || [])
          .filter(
            (entry: { title: string; body: string; tags: string[] }) =>
              entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              entry.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              entry.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .slice(0, 5)
          .map((entry: { id: string; title: string; summary: string; slug: string }) => ({
            id: entry.id,
            title: entry.title,
            description: entry.summary?.slice(0, 60) + "...",
            href: `/diary/${entry.slug}`,
            type: "diary" as const,
            icon: <FileText className="h-4 w-4" />,
          }));

        setResults([...filteredPages, ...diaryResults]);
      } else {
        setResults(filteredPages);
      }
    } catch {
      setResults(filteredPages);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(results[selectedIndex].href as any);
          close();
        }
        break;
    }
  };

  // Navigate to result
  const navigateTo = (result: SearchResult) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(result.href as any);
    close();
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      const group = result.type === "page" ? "ページ" : result.type === "diary" ? "Math Diary" : "その他";
      if (!acc[group]) acc[group] = [];
      acc[group].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={open}
        className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white/80 md:flex"
        aria-label="検索を開く"
      >
        <Search className="h-3.5 w-3.5" />
        <span>検索</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={close}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-night-soft/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-5 w-5 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="ページ、記事、タグを検索..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  autoComplete="off"
                />
                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                )}
                <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/50">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 && query && !loading && (
                  <div className="py-8 text-center text-sm text-white/50">
                    「{query}」に一致する結果がありません
                  </div>
                )}

                {Object.entries(groupedResults).map(([group, items]) => (
                  <Fragment key={group}>
                    <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/40">
                      {group}
                    </div>
                    {items.map((result, index) => {
                      const globalIndex = results.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          onClick={() => navigateTo(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                            isSelected ? "bg-accent/20 text-white" : "text-white/70 hover:bg-white/5"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isSelected ? "bg-accent/30 text-accent" : "bg-white/10 text-white/50"
                            }`}
                          >
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.title}</div>
                            {result.description && (
                              <div className="text-xs text-white/50 truncate">{result.description}</div>
                            )}
                          </div>
                          {isSelected && <ArrowRight className="h-4 w-4 text-accent" />}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5">↑</kbd>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5">↓</kbd>
                    移動
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5">
                      <CornerDownLeft className="h-3 w-3" />
                    </kbd>
                    開く
                  </span>
                </div>
                <span>Powered by Akari Math Lab</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

