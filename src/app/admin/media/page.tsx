"use client";

import { useState, useEffect, useCallback } from "react";
import { FileUpload } from "@/components/admin/FileUpload";
import { Trash2, Copy, Check, Image, FileText, File, RefreshCw, FolderOpen } from "lucide-react";
import { clsx } from "clsx";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  type?: string;
  createdAt?: string;
}

const FOLDERS = [
  { id: "", label: "すべて" },
  { id: "uploads", label: "アップロード" },
  { id: "diary", label: "日記" },
  { id: "resources", label: "リソース" },
];

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/upload?folder=${selectedFolder}`);
      if (res.ok) {
        const { data } = await res.json();
        setFiles(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (path: string) => {
    if (!confirm("このファイルを削除しますか？")) return;

    setDeleting(path);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.path !== path));
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getFileIcon = (type?: string) => {
    if (type?.startsWith("image/")) {
      return <Image className="h-5 w-5" />;
    }
    if (type === "application/pdf") {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const isImage = (type?: string) => type?.startsWith("image/");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Media Library</h1>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-night-muted bg-night-soft px-4 py-2 text-sm text-gray-300 hover:bg-night-muted disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          更新
        </button>
      </div>

      {/* Upload section */}
      <div className="rounded-lg border border-night-muted bg-night-soft p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">ファイルをアップロード</h2>
        <FileUpload
          folder={selectedFolder || "uploads"}
          onUpload={() => fetchFiles()}
          showPreview={false}
        />
      </div>

      {/* Folder filter */}
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">フォルダ:</span>
        <div className="flex gap-1">
          {FOLDERS.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={clsx(
                "rounded-md px-3 py-1 text-sm transition-colors",
                selectedFolder === folder.id
                  ? "bg-accent text-night"
                  : "bg-night-muted text-gray-300 hover:bg-night-muted/80"
              )}
            >
              {folder.label}
            </button>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="rounded-lg border border-night-muted bg-night-soft">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            ファイルがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <div
                key={file.path}
                className="group relative overflow-hidden rounded-lg border border-night-muted bg-night transition-colors hover:border-accent/50"
              >
                {/* Preview */}
                <div className="aspect-square bg-night-muted">
                  {isImage(file.type) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-200" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>

                {/* Actions (on hover) */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="rounded-md bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80"
                    title="URLをコピー"
                  >
                    {copied === file.url ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file.path)}
                    disabled={deleting === file.path}
                    className="rounded-md bg-black/60 p-2 text-red-400 backdrop-blur-sm hover:bg-black/80 disabled:opacity-50"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Link to open */}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
