"use client";

import { useState, useEffect, useRef } from "react";
import { X, Link as LinkIcon, Image, Table, ExternalLink } from "lucide-react";
import type { LinkDialogData, ImageDialogData, TableDialogData } from "./editor-types";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-lg border border-night-muted bg-night-soft p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-night-muted hover:text-white"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Link Dialog
interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: LinkDialogData) => void;
  initialText?: string;
}

export function LinkDialog({ isOpen, onClose, onInsert, initialText = "" }: LinkDialogProps) {
  const [data, setData] = useState<LinkDialogData>({
    url: "",
    text: initialText,
    openInNewTab: true,
  });

  useEffect(() => {
    if (isOpen) {
      setData((prev) => ({ ...prev, text: initialText }));
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.url) {
      onInsert(data);
      setData({ url: "", text: "", openInNewTab: true });
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="リンクを挿入">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={data.url}
            onChange={(e) => setData({ ...data, url: e.target.value })}
            required
            autoFocus
            placeholder="https://example.com"
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">表示テキスト</label>
          <input
            type="text"
            value={data.text}
            onChange={(e) => setData({ ...data, text: e.target.value })}
            placeholder="リンクテキスト"
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="newTab"
            checked={data.openInNewTab}
            onChange={(e) => setData({ ...data, openInNewTab: e.target.checked })}
            className="rounded border-night-muted bg-night text-accent focus:ring-accent"
          />
          <label htmlFor="newTab" className="text-sm text-gray-300">
            新しいタブで開く
          </label>
        </div>

        {data.url && (
          <div className="rounded-md border border-night-muted bg-night p-3">
            <div className="mb-1 text-xs text-gray-400">プレビュー</div>
            <div className="flex items-center gap-2 text-accent">
              <LinkIcon className="h-4 w-4" />
              <span className="underline">{data.text || data.url}</span>
              {data.openInNewTab && <ExternalLink className="h-3 w-3" />}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-night-muted px-4 py-2 text-sm text-gray-300 hover:bg-night-muted"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!data.url}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            挿入
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// Image Dialog
interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: ImageDialogData) => void;
}

export function ImageDialog({ isOpen, onClose, onInsert }: ImageDialogProps) {
  const [data, setData] = useState<ImageDialogData>({
    url: "",
    alt: "",
    width: "",
    height: "",
  });
  const [previewError, setPreviewError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.url) {
      onInsert(data);
      setData({ url: "", alt: "", width: "", height: "" });
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="画像を挿入">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            画像URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={data.url}
            onChange={(e) => {
              setData({ ...data, url: e.target.value });
              setPreviewError(false);
            }}
            required
            autoFocus
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">代替テキスト (alt)</label>
          <input
            type="text"
            value={data.alt}
            onChange={(e) => setData({ ...data, alt: e.target.value })}
            placeholder="画像の説明"
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">幅 (オプション)</label>
            <input
              type="text"
              value={data.width}
              onChange={(e) => setData({ ...data, width: e.target.value })}
              placeholder="例: 400 または 100%"
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">高さ (オプション)</label>
            <input
              type="text"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              placeholder="例: 300 または auto"
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {data.url && (
          <div className="rounded-md border border-night-muted bg-night p-3">
            <div className="mb-2 text-xs text-gray-400">プレビュー</div>
            {previewError ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Image className="h-8 w-8" />
                <span className="text-sm">画像を読み込めません</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.url}
                alt={data.alt || "プレビュー"}
                onError={() => setPreviewError(true)}
                className="max-h-32 max-w-full rounded object-contain"
              />
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-night-muted px-4 py-2 text-sm text-gray-300 hover:bg-night-muted"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!data.url}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            挿入
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// Table Dialog
interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: TableDialogData) => void;
}

export function TableDialog({ isOpen, onClose, onInsert }: TableDialogProps) {
  const [data, setData] = useState<TableDialogData>({
    rows: 3,
    cols: 3,
    hasHeader: true,
    alignment: "left",
  });
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInsert(data);
    setData({ rows: 3, cols: 3, hasHeader: true, alignment: "left" });
    onClose();
  };

  const handleGridSelect = (row: number, col: number) => {
    setData({ ...data, rows: row + 1, cols: col + 1 });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="テーブルを挿入">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visual grid selector */}
        <div>
          <div className="mb-2 text-sm font-medium text-gray-300">
            サイズを選択: {data.rows} × {data.cols}
          </div>
          <div className="inline-block rounded-md border border-night-muted bg-night p-2">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(8, 1fr)` }}>
              {Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => {
                  const isSelected = row < data.rows && col < data.cols;
                  const isHovered = hoverCell && row <= hoverCell.row && col <= hoverCell.col;
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onClick={() => handleGridSelect(row, col)}
                      onMouseEnter={() => setHoverCell({ row, col })}
                      onMouseLeave={() => setHoverCell(null)}
                      className={`h-5 w-5 rounded border transition-colors ${
                        isSelected || isHovered
                          ? "border-accent bg-accent/30"
                          : "border-night-muted bg-night-soft hover:border-gray-500"
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">行数</label>
            <input
              type="number"
              min="1"
              max="20"
              value={data.rows}
              onChange={(e) => setData({ ...data, rows: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">列数</label>
            <input
              type="number"
              min="1"
              max="10"
              value={data.cols}
              onChange={(e) => setData({ ...data, cols: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasHeader"
            checked={data.hasHeader}
            onChange={(e) => setData({ ...data, hasHeader: e.target.checked })}
            className="rounded border-night-muted bg-night text-accent focus:ring-accent"
          />
          <label htmlFor="hasHeader" className="text-sm text-gray-300">
            ヘッダー行を含める
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">配置</label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setData({ ...data, alignment: align })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  data.alignment === align
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-night-muted text-gray-300 hover:border-gray-500"
                }`}
              >
                {align === "left" ? "左" : align === "center" ? "中央" : "右"}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-md border border-night-muted bg-night p-3 overflow-x-auto">
          <div className="mb-2 text-xs text-gray-400">プレビュー</div>
          <table className="w-full border-collapse text-sm">
            {data.hasHeader && (
              <thead>
                <tr>
                  {Array.from({ length: data.cols }).map((_, i) => (
                    <th
                      key={i}
                      className="border border-night-muted bg-night-soft px-2 py-1"
                      style={{ textAlign: data.alignment }}
                    >
                      ヘッダー
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {Array.from({ length: data.hasHeader ? data.rows - 1 : data.rows }).map((_, row) => (
                <tr key={row}>
                  {Array.from({ length: data.cols }).map((_, col) => (
                    <td
                      key={col}
                      className="border border-night-muted px-2 py-1"
                      style={{ textAlign: data.alignment }}
                    >
                      セル
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-night-muted px-4 py-2 text-sm text-gray-300 hover:bg-night-muted"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90"
          >
            挿入
          </button>
        </div>
      </form>
    </Dialog>
  );
}

