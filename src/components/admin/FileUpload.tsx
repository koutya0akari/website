"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, FileText, Loader2, Check, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface UploadedFile {
  path: string;
  url: string;
  fileName: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onUpload?: (file: UploadedFile) => void;
  onUrlChange?: (url: string) => void;
  value?: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  hint?: string;
  showPreview?: boolean;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function FileUpload({
  onUpload,
  onUrlChange,
  value = "",
  folder = "uploads",
  accept = "image/*,application/pdf,.zip",
  maxSize = 10,
  className,
  label,
  hint,
  showPreview = true,
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`ファイルサイズが大きすぎます。最大 ${maxSize}MB まで。`);
        setStatus("error");
        return;
      }

      setStatus("uploading");
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "アップロードに失敗しました");
        }

        setCurrentUrl(data.data.url);
        setStatus("success");
        onUpload?.(data.data);
        onUrlChange?.(data.data.url);

        // Reset status after a moment
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "アップロードに失敗しました");
        setStatus("error");
      }
    },
    [folder, maxSize, onUpload, onUrlChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUrlInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setCurrentUrl(url);
      onUrlChange?.(url);
    },
    [onUrlChange]
  );

  const clearFile = useCallback(() => {
    setCurrentUrl("");
    setError(null);
    setStatus("idle");
    onUrlChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onUrlChange]);

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <Image className="h-5 w-5" />;
    }
    if (ext === "pdf") {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const isImage = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-accent bg-accent/10"
            : "border-night-muted bg-night hover:border-accent/50",
          status === "error" && "border-red-500/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {status === "uploading" ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="text-sm text-gray-400">アップロード中...</span>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="h-8 w-8 text-green-500" />
            <span className="text-sm text-green-400">アップロード完了</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-400">
              クリックまたはドラッグ&ドロップでアップロード
            </span>
            <span className="text-xs text-gray-500">
              最大 {maxSize}MB（画像、PDF、ZIP）
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={currentUrl}
            onChange={handleUrlInputChange}
            placeholder="URLを入力またはファイルをアップロード"
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 pr-10 text-gray-100 placeholder-gray-500 focus:border-accent focus:outline-none"
          />
          {currentUrl && (
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-night-muted hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {showPreview && currentUrl && (
        <div className="mt-2 rounded-lg border border-night-muted bg-night-soft p-3">
          {isImage(currentUrl) ? (
            <div className="flex items-start gap-3">
              <img
                src={currentUrl}
                alt="Preview"
                className="h-20 w-20 rounded-md object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-gray-300">{currentUrl}</p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-accent hover:underline"
                >
                  新しいタブで開く
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-night text-gray-400">
                {getFileIcon(currentUrl)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-gray-300">{currentUrl}</p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-accent hover:underline"
                >
                  新しいタブで開く
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
