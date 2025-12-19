"use client";

import { useState, useRef, useCallback } from "react";
import { Bold, Italic, Link, List, ListOrdered, Code, Heading2, Quote, Eye, Edit3 } from "lucide-react";

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
  className?: string;
}

// シンプルなMarkdownプレビュー（サーバーサイドでも使える軽量版）
function renderMarkdownPreview(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown
    // エスケープ
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // コードブロック（先に処理）
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-night-muted rounded p-3 my-2 overflow-x-auto"><code>$2</code></pre>')
    // インラインコード
    .replace(/`([^`]+)`/g, '<code class="bg-night-muted px-1 rounded text-accent">$1</code>')
    // 見出し
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>')
    // 太字・斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // リンク
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-accent pl-4 my-2 text-gray-300 italic">$1</blockquote>')
    // 順序なしリスト
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // 順序付きリスト
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // 段落（空行で区切り）
    .replace(/\n\n/g, '</p><p class="my-2">')
    // 改行
    .replace(/\n/g, "<br>");
  
  // リストアイテムをulで囲む
  html = html.replace(/(<li class="ml-4 list-disc">.*?<\/li>(\s*<br>)?)+/g, (match) => {
    return '<ul class="my-2">' + match.replace(/<br>/g, "") + '</ul>';
  });
  html = html.replace(/(<li class="ml-4 list-decimal">.*?<\/li>(\s*<br>)?)+/g, (match) => {
    return '<ol class="my-2">' + match.replace(/<br>/g, "") + '</ol>';
  });
  
  return `<p class="my-2">${html}</p>`;
}

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
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [value, onChange]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertFormat("**", "**", "太字"), title: "太字 (Ctrl+B)" },
    { icon: Italic, action: () => insertFormat("*", "*", "斜体"), title: "斜体 (Ctrl+I)" },
    { icon: Code, action: () => insertFormat("`", "`", "コード"), title: "インラインコード" },
    { icon: Link, action: () => insertFormat("[", "](url)", "リンクテキスト"), title: "リンク" },
    { icon: Heading2, action: () => insertAtLineStart("## "), title: "見出し2" },
    { icon: List, action: () => insertAtLineStart("- "), title: "箇条書き" },
    { icon: ListOrdered, action: () => insertAtLineStart("1. "), title: "番号付きリスト" },
    { icon: Quote, action: () => insertAtLineStart("> "), title: "引用" },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      )}
      
      <div className="rounded-md border border-night-muted bg-night overflow-hidden">
        {/* ツールバー */}
        <div className="flex items-center justify-between border-b border-night-muted bg-night-soft px-2 py-1">
          <div className="flex items-center gap-1">
            {toolbarButtons.map(({ icon: Icon, action, title }, index) => (
              <button
                key={index}
                type="button"
                onClick={action}
                title={title}
                disabled={isPreview}
                className="rounded p-1.5 text-gray-400 hover:bg-night-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
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
            className="prose prose-invert max-w-none p-4 text-gray-100 min-h-[100px]"
            style={{ minHeight: `${rows * 1.5}rem` }}
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }}
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

