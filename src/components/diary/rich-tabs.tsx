"use client";

import { useId, useState, type ReactNode } from "react";

export type RichTabItem = {
  label: string;
  content: ReactNode;
};

export function RichTabs({ items }: { items: RichTabItem[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();

  if (items.length === 0) return null;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-white/10">
      <div
        role="tablist"
        aria-label="タブ"
        className="flex flex-wrap gap-1 border-b border-white/10 p-1.5"
      >
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <button
              key={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${index}`}
              onClick={() => setActive(index)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-gray-400 hover:bg-night-muted hover:text-gray-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="prose prose-invert max-w-none px-4 py-3 prose-headings:font-semibold prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
        {items.map((item, index) => (
          <div
            key={`${baseId}-panel-${index}`}
            role="tabpanel"
            id={`${baseId}-panel-${index}`}
            aria-labelledby={`${baseId}-tab-${index}`}
            hidden={index !== active}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
