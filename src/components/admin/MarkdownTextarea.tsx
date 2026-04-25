"use client";

import { useState, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { Bold, Italic, Link, List, ListOrdered, Code, Heading2, Quote, Eye, Edit3 } from "lucide-react";

import { markdownToHtml } from "@/components/admin/editor/editor-utils";

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
  className?: string;
}

type MarkdownToolbarButton = {
  id: string;
  icon: LucideIcon;
  title: string;
} & (
  | { type: "wrap"; prefix: string; suffix?: string; placeholder?: string }
  | { type: "line"; prefix: string }
);

const MARKDOWN_TOOLBAR_BUTTONS: MarkdownToolbarButton[] = [
  { id: "bold", icon: Bold, type: "wrap", prefix: "**", suffix: "**", placeholder: "太字", title: "太字 (Ctrl+B)" },
  { id: "italic", icon: Italic, type: "wrap", prefix: "*", suffix: "*", placeholder: "斜体", title: "斜体 (Ctrl+I)" },
  { id: "code", icon: Code, type: "wrap", prefix: "`", suffix: "`", placeholder: "コード", title: "インラインコード" },
  { id: "link", icon: Link, type: "wrap", prefix: "[", suffix: "](url)", placeholder: "リンクテキスト", title: "リンク" },
  { id: "heading", icon: Heading2, type: "line", prefix: "## ", title: "見出し2" },
  { id: "unordered-list", icon: List, type: "line", prefix: "- ", title: "箇条書き" },
  { id: "ordered-list", icon: ListOrdered, type: "line", prefix: "1. ", title: "番号付きリスト" },
  { id: "quote", icon: Quote, type: "line", prefix: "> ", title: "引用" },
];

export function MarkdownTextarea({
  value,
  onChange,
  rows = 4,
  placeholder = "",
  label,
  className = "",
}: MarkdownTextareaProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = useCallback((prefix: string, suffix: string = prefix, placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    
    onChange(newValue);
    
    // カーソル位置を調整
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    
    onChange(newValue);
    
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, [value, onChange]);

  const handleToolbarButton = useCallback((button: MarkdownToolbarButton) => {
    if (button.type === "line") {
      insertAtLineStart(button.prefix);
      return;
    }

    insertFormat(button.prefix, button.suffix, button.placeholder);
  }, [insertAtLineStart, insertFormat]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      )}
      
      <div className="rounded-md border border-night-muted bg-night overflow-hidden">
        {/* ツールバー */}
        <div className="flex items-center justify-between border-b border-night-muted bg-night-soft px-2 py-1">
          <div className="flex items-center gap-1">
            {MARKDOWN_TOOLBAR_BUTTONS.map((button) => {
              const Icon = button.icon;
              return (
                <button
                  key={button.id}
                  type="button"
                  onClick={() => handleToolbarButton(button)}
                  onMouseDown={(e) => e.preventDefault()} // テキストエリアのフォーカスを維持
                  title={button.title}
                  disabled={isPreview}
                  className="rounded p-1.5 text-gray-400 hover:bg-night-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Markdown</span>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                isPreview
                  ? "bg-accent/20 text-accent"
                  : "text-gray-400 hover:bg-night-muted hover:text-white"
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="h-3 w-3" />
                  編集
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  プレビュー
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* エディタ / プレビュー */}
        {isPreview ? (
          <div
            className="prose prose-invert prose-preserve-whitespace max-w-none p-4 text-gray-100 min-h-[100px]"
            style={{ minHeight: `${rows * 1.5}rem` }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none resize-y font-mono text-sm"
          />
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Markdown記法をサポート: **太字**, *斜体*, `コード`, [リンク](url), ## 見出し, - リスト, &gt; 引用
      </p>
    </div>
  );
}
