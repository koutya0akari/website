"use client";

import { useState } from "react";
import { Save, Trash2, ExternalLink } from "lucide-react";

export interface ResourceFormData {
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  externalUrl: string;
}

interface ResourceFormProps {
  initialData?: Partial<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isNew?: boolean;
}

const CATEGORY_SUGGESTIONS = ["スライド", "PDF", "論文", "ノート", "ツール", "その他"];

export function ResourceForm({ initialData, onSubmit, onDelete, isNew = true }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    fileUrl: initialData?.fileUrl || "",
    externalUrl: initialData?.externalUrl || "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("この資料を削除しますか？")) return;

    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="資料のタイトル"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">説明</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="資料の説明"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">カテゴリ</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          list="category-suggestions"
          className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="カテゴリを入力または選択"
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">ファイルURL</label>
          <input
            type="url"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="https://example.com/file.pdf"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">外部URL</label>
          <input
            type="url"
            value={formData.externalUrl}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Preview */}
      {(formData.fileUrl || formData.externalUrl) && (
        <div className="rounded-md border border-night-muted bg-night-soft p-4">
          <div className="mb-2 text-sm font-medium text-gray-300">プレビュー</div>
          <a
            href={formData.fileUrl || formData.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-accent hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {formData.title || "リンクを開く"}
          </a>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-night-muted pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-accent px-6 py-2 font-medium text-night transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : isNew ? "作成" : "更新"}
          </button>

          {!isNew && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-md border border-red-500 px-6 py-2 font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "削除中..." : "削除"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

