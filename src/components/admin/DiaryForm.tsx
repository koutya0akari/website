"use client";

import { useState, useCallback } from "react";
import { RichEditor } from "./editor";
import { Save, Eye, Trash2 } from "lucide-react";

export interface DiaryFormData {
  title: string;
  slug: string;
  body: string;
  summary: string;
  folder: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string;
  heroImageUrl: string;
}

interface DiaryFormProps {
  initialData?: Partial<DiaryFormData>;
  onSubmit: (data: DiaryFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isNew?: boolean;
  previewBasePath?: string;
  formKey?: string;
}

export function DiaryForm({
  initialData,
  onSubmit,
  onDelete,
  isNew = true,
  previewBasePath = "/diary",
  formKey = "diary",
}: DiaryFormProps) {
  const [formData, setFormData] = useState<DiaryFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    body: initialData?.body || "",
    summary: initialData?.summary || "",
    folder: initialData?.folder || "",
    tags: initialData?.tags || [],
    status: initialData?.status || "draft",
    publishedAt:
      initialData?.publishedAt ||
      (initialData?.status === "published" ? new Date().toISOString().slice(0, 16) : ""),
    heroImageUrl: initialData?.heroImageUrl || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const formRef = useCallback((node: HTMLFormElement | null) => {
    if (node) node.dataset.form = formKey;
  }, [formKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorSave = useCallback(() => {
    // Trigger form submission programmatically
    const form = document.querySelector(`form[data-form="${formKey}"]`) as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
  }, [formKey]);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" data-form="diary">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Slug <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="flex-1 rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="post-slug"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="rounded-md border border-night-muted bg-night-soft px-4 py-2 text-sm text-gray-300 hover:bg-night-muted"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Body (Markdown / HTML)</label>
        <RichEditor
          value={formData.body}
          onChange={(value) => setFormData({ ...formData, body: value })}
          onSave={handleEditorSave}
          placeholder="記事の本文を入力してください..."
          minHeight={500}
          initialMode="markdown"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Summary</label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Brief summary of the post"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Folder</label>
          <input
            type="text"
            value={formData.folder}
            onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="e.g., tutorial, article"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Hero Image URL</label>
          <input
            type="url"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1 rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Add a tag and press Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-md bg-night-soft px-4 py-2 text-sm text-gray-300 hover:bg-night-muted"
          >
            Add Tag
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md bg-accent/10 px-3 py-1 text-sm text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-accent/80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="draft"
                checked={formData.status === "draft"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "draft" | "published" })
                }
                className="text-accent focus:ring-accent"
              />
              <span className="text-gray-300">Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="published"
                checked={formData.status === "published"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "draft" | "published" })
                }
                className="text-accent focus:ring-accent"
              />
              <span className="text-gray-300">Published</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Published At</label>
          <input
            type="datetime-local"
            value={formData.publishedAt}
            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-night-muted pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-accent px-6 py-2 font-medium text-night transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : isNew ? "Create Post" : "Update Post"}
          </button>

          {!isNew && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-md border border-red-500 px-6 py-2 font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>

        {formData.slug && (
          <a
            href={`${previewBasePath}/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent"
          >
            <Eye className="h-4 w-4" />
            Preview
          </a>
        )}
      </div>
    </form>
  );
}
