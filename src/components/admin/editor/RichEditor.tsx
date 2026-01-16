"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { EditorMode, ViewMode, LinkDialogData, ImageDialogData, TableDialogData } from "./editor-types";
import { KEYBOARD_SHORTCUTS } from "./editor-types";
import {
  applyFormat,
  getFormat,
  generateLink,
  generateImage,
  generateTable,
  generateColorText,
  addIndent,
  removeIndent,
  applyAlignment,
  markdownToHtml,
  debounce,
} from "./editor-utils";
import { EditorToolbar } from "./EditorToolbar";
import { LinkDialog, ImageDialog, TableDialog } from "./EditorDialogs";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  minHeight?: number;
  initialMode?: EditorMode;
}

export function RichEditor({
  value,
  onChange,
  onSave,
  placeholder = "ここに入力...",
  minHeight = 400,
  initialMode = "markdown",
}: RichEditorProps) {
  // State
  const [mode, setMode] = useState<EditorMode>(initialMode);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isDark, setIsDark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);

  // ダイアログを開く前の選択範囲を保存
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number; text: string }>({
    start: 0,
    end: 0,
    text: "",
  });

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preview update with debounce
  const updatePreview = useCallback(
    debounce((content: string, editorMode: EditorMode) => {
      if (editorMode === "markdown") {
        setPreviewHtml(markdownToHtml(content));
      } else {
        setPreviewHtml(content);
      }
    }, 150),
    []
  );

  useEffect(() => {
    updatePreview(value, mode);
  }, [value, mode, updatePreview]);

  // Undo/Redo management
  const pushToUndoStack = useCallback((content: string) => {
    setUndoStack((prev) => [...prev.slice(-50), content]);
    setRedoStack([]);
  }, []);

  // Get selection
  const getSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: "" };
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
    };
  }, []);

  // Set cursor position
  const setCursorPosition = useCallback((pos: number) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }
  }, []);

  // Apply format to selection
  const handleFormat = useCallback(
    (formatType: string) => {
      const format = getFormat(mode, formatType);
      if (!format) return;

      const selection = getSelection();
      pushToUndoStack(value);

      const { newContent, newCursorPos } = applyFormat(
        value,
        selection.start,
        selection.end,
        format
      );

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(newCursorPos));
    },
    [mode, value, onChange, getSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle heading
  const handleHeading = useCallback(
    (level: number) => {
      handleFormat(`h${level}`);
    },
    [handleFormat]
  );

  // Handle link insertion
  const handleLink = useCallback(() => {
    // ダイアログを開く前に選択範囲を保存
    const selection = getSelection();
    setSavedSelection(selection);
    setLinkDialogOpen(true);
  }, [getSelection]);

  const handleLinkInsert = useCallback(
    (data: LinkDialogData) => {
      // 保存した選択範囲を使用
      pushToUndoStack(value);

      const linkMarkup = generateLink(mode, data);
      const newContent =
        value.substring(0, savedSelection.start) + linkMarkup + value.substring(savedSelection.end);

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(savedSelection.start + linkMarkup.length));
    },
    [mode, value, onChange, savedSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle image insertion
  const handleImage = useCallback(() => {
    // ダイアログを開く前に選択範囲を保存
    const selection = getSelection();
    setSavedSelection(selection);
    setImageDialogOpen(true);
  }, [getSelection]);

  const handleImageInsert = useCallback(
    (data: ImageDialogData) => {
      // 保存した選択範囲を使用
      pushToUndoStack(value);

      const imageMarkup = generateImage(mode, data);
      const newContent =
        value.substring(0, savedSelection.start) + imageMarkup + value.substring(savedSelection.end);

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(savedSelection.start + imageMarkup.length));
    },
    [mode, value, onChange, savedSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle table insertion
  const handleTable = useCallback(() => {
    // ダイアログを開く前に選択範囲を保存
    const selection = getSelection();
    setSavedSelection(selection);
    setTableDialogOpen(true);
  }, [getSelection]);

  const handleTableInsert = useCallback(
    (data: TableDialogData) => {
      // 保存した選択範囲を使用
      pushToUndoStack(value);

      const tableMarkup = generateTable(mode, data);
      const newContent =
        value.substring(0, savedSelection.start) + "\n" + tableMarkup + "\n" + value.substring(savedSelection.end);

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(savedSelection.start + tableMarkup.length + 2));
    },
    [mode, value, onChange, savedSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle color
  const handleColor = useCallback(
    (color: string, isBackground: boolean) => {
      const selection = getSelection();
      if (!selection.text) return;

      pushToUndoStack(value);
      const coloredText = generateColorText(mode, selection.text, color, isBackground);
      const newContent =
        value.substring(0, selection.start) + coloredText + value.substring(selection.end);

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(selection.start + coloredText.length));
    },
    [mode, value, onChange, getSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle emoji
  const handleEmoji = useCallback(
    (emoji: string) => {
      const selection = getSelection();
      pushToUndoStack(value);

      const newContent =
        value.substring(0, selection.start) + emoji + value.substring(selection.end);

      onChange(newContent);
      requestAnimationFrame(() => setCursorPosition(selection.start + emoji.length));
    },
    [value, onChange, getSelection, pushToUndoStack, setCursorPosition]
  );

  // Handle indent
  const handleIndent = useCallback(
    (increase: boolean) => {
      const selection = getSelection();
      pushToUndoStack(value);

      if (increase) {
        const result = addIndent(value, selection.start, selection.end);
        onChange(result.newContent);
      } else {
        const result = removeIndent(value, selection.start, selection.end);
        onChange(result.newContent);
      }
    },
    [value, onChange, getSelection, pushToUndoStack]
  );

  // Handle alignment
  const handleAlign = useCallback(
    (alignment: "left" | "center" | "right") => {
      const selection = getSelection();
      pushToUndoStack(value);

      const newContent = applyAlignment(value, selection.start, selection.end, alignment);
      onChange(newContent);
    },
    [value, onChange, getSelection, pushToUndoStack]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevContent = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, value]);
    onChange(prevContent);
  }, [undoStack, value, onChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextContent = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, value]);
    onChange(nextContent);
  }, [redoStack, value, onChange]);

  // Save
  const handleSave = useCallback(() => {
    onSave?.();
  }, [onSave]);

  // View mode change
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  // Mode toggle
  const handleModeToggle = useCallback(() => {
    setMode((prev) => (prev === "markdown" ? "html" : "markdown"));
  }, []);

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const [action, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          switch (action) {
            case "bold":
            case "italic":
            case "underline":
            case "code":
            case "codeBlock":
              handleFormat(action);
              break;
            case "save":
              handleSave();
              break;
            case "undo":
              handleUndo();
              break;
            case "redo":
              handleRedo();
              break;
            case "link":
              handleLink();
              break;
            case "preview":
              handleViewModeChange(viewMode === "split" ? "editor" : "split");
              break;
            case "fullscreen":
              handleFullscreenToggle();
              break;
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFormat, handleSave, handleUndo, handleRedo, handleLink, handleViewModeChange, handleFullscreenToggle, viewMode]);

  // Split resize handling
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(20, Math.min(80, newPosition)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Sync scroll between editor and preview
  const handleEditorScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    if (!textarea || !preview || viewMode !== "split") return;

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  }, [viewMode]);

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      pushToUndoStack(value);
      onChange(newValue);
    },
    [value, onChange, pushToUndoStack]
  );

  // Container classes
  const containerClasses = `
    flex flex-col rounded-lg border border-night-muted overflow-hidden
    ${isDark ? "bg-night" : "bg-white"}
    ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}
  `;

  const editorClasses = `
    w-full h-full resize-none p-4 font-mono text-sm focus:outline-none
    ${isDark ? "bg-night text-gray-100" : "bg-white text-gray-900"}
    ${isDark ? "placeholder-gray-500" : "placeholder-gray-400"}
  `;

  const previewClasses = `
    prose prose-invert max-w-none p-4 overflow-y-auto
    ${isDark ? "bg-night-soft" : "bg-gray-50"}
  `;

  return (
    <>
      <div ref={containerRef} className={containerClasses}>
        <EditorToolbar
          mode={mode}
          viewMode={viewMode}
          isDark={isDark}
          isFullscreen={isFullscreen}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onFormat={handleFormat}
          onHeading={handleHeading}
          onLink={handleLink}
          onImage={handleImage}
          onTable={handleTable}
          onColor={handleColor}
          onEmoji={handleEmoji}
          onIndent={handleIndent}
          onAlign={handleAlign}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onViewModeChange={handleViewModeChange}
          onModeToggle={handleModeToggle}
          onThemeToggle={handleThemeToggle}
          onFullscreenToggle={handleFullscreenToggle}
        />

        <div className="flex flex-1 overflow-hidden" style={{ minHeight: `${minHeight}px` }}>
          {/* Editor pane */}
          {viewMode !== "preview" && (
            <div
              className="flex flex-col overflow-hidden"
              style={{ width: viewMode === "split" ? `${splitPosition}%` : "100%" }}
            >
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleContentChange}
                onScroll={handleEditorScroll}
                placeholder={placeholder}
                className={editorClasses}
                spellCheck={false}
                aria-label="エディター"
              />
            </div>
          )}

          {/* Resize handle */}
          {viewMode === "split" && (
            <div
              className={`w-1 cursor-col-resize bg-night-muted hover:bg-accent/50 transition-colors ${
                isDragging ? "bg-accent" : ""
              }`}
              onMouseDown={handleDragStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="リサイズハンドル"
            />
          )}

          {/* Preview pane */}
          {viewMode !== "editor" && (
            <div
              ref={previewRef}
              className={previewClasses}
              style={{ width: viewMode === "split" ? `${100 - splitPosition}%` : "100%" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              aria-label="プレビュー"
            />
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-night-muted px-4 py-1 text-xs text-gray-400">
          <div>
            {value.length} 文字 | {value.split(/\n/).length} 行
          </div>
          <div className="flex items-center gap-4">
            <span>Ctrl+S 保存</span>
            <span>Ctrl+Shift+P プレビュー切替</span>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onInsert={handleLinkInsert}
        initialText={savedSelection.text}
      />
      <ImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onInsert={handleImageInsert}
      />
      <TableDialog
        isOpen={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        onInsert={handleTableInsert}
      />

      {/* Toolbar button styles */}
      <style jsx global>{`
        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.5rem;
          border-radius: 0.25rem;
          color: #9ca3af;
          transition: all 0.15s ease;
        }
        .toolbar-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.1);
          color: #f3f4f6;
        }
        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

