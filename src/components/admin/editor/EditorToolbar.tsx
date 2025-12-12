"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Link,
  Image,
  Table,
  Smile,
  Minus,
  Palette,
  Highlighter,
  IndentIncrease,
  IndentDecrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Eye,
  EyeOff,
  Columns,
  RefreshCw,
  Moon,
  Sun,
  Maximize,
  ChevronDown,
} from "lucide-react";
import type { EditorMode, ViewMode } from "./editor-types";
import { PRESET_COLORS, COMMON_EMOJIS } from "./editor-utils";

interface EditorToolbarProps {
  mode: EditorMode;
  viewMode: ViewMode;
  isDark: boolean;
  isFullscreen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onFormat: (format: string) => void;
  onHeading: (level: number) => void;
  onLink: () => void;
  onImage: () => void;
  onTable: () => void;
  onColor: (color: string, isBackground: boolean) => void;
  onEmoji: (emoji: string) => void;
  onIndent: (increase: boolean) => void;
  onAlign: (alignment: "left" | "center" | "right") => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onModeToggle: () => void;
  onThemeToggle: () => void;
  onFullscreenToggle: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function Dropdown({ trigger, children, isOpen, onToggle, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={onToggle} className="toolbar-btn">
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-night-muted bg-night-soft shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  onClick,
  isActive,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`toolbar-btn ${isActive ? "bg-accent/20 text-accent" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-6 w-px bg-night-muted" />;
}

export function EditorToolbar({
  mode,
  viewMode,
  isDark,
  isFullscreen,
  canUndo,
  canRedo,
  onFormat,
  onHeading,
  onLink,
  onImage,
  onTable,
  onColor,
  onEmoji,
  onIndent,
  onAlign,
  onUndo,
  onRedo,
  onSave,
  onViewModeChange,
  onModeToggle,
  onThemeToggle,
  onFullscreenToggle,
}: EditorToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const closeDropdown = () => setOpenDropdown(null);

  const handleColorSelect = (color: string, isBackground: boolean) => {
    onColor(color, isBackground);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 10);
    });
    closeDropdown();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-night-muted bg-night-soft/50 p-2">
      {/* Save & History */}
      <ToolbarButton icon={<Save className="h-4 w-4" />} label="保存" shortcut="Ctrl+S" onClick={onSave} />
      <ToolbarButton icon={<Undo className="h-4 w-4" />} label="元に戻す" shortcut="Ctrl+Z" onClick={onUndo} disabled={!canUndo} />
      <ToolbarButton icon={<Redo className="h-4 w-4" />} label="やり直し" shortcut="Ctrl+Shift+Z" onClick={onRedo} disabled={!canRedo} />

      <Separator />

      {/* Text formatting */}
      <ToolbarButton icon={<Bold className="h-4 w-4" />} label="太字" shortcut="Ctrl+B" onClick={() => onFormat("bold")} />
      <ToolbarButton icon={<Italic className="h-4 w-4" />} label="斜体" shortcut="Ctrl+I" onClick={() => onFormat("italic")} />
      <ToolbarButton icon={<Underline className="h-4 w-4" />} label="下線" shortcut="Ctrl+U" onClick={() => onFormat("underline")} />
      <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} label="取り消し線" onClick={() => onFormat("strikethrough")} />

      {/* Color pickers */}
      <Dropdown
        isOpen={openDropdown === "textColor"}
        onToggle={() => setOpenDropdown(openDropdown === "textColor" ? null : "textColor")}
        onClose={closeDropdown}
        trigger={
          <>
            <Palette className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </>
        }
      >
        <div className="p-3 w-64">
          <div className="mb-2 text-xs text-gray-400">文字色</div>
          <div className="grid grid-cols-10 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color, false)}
                className="h-5 w-5 rounded border border-night-muted hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          {recentColors.length > 0 && (
            <>
              <div className="mt-3 mb-2 text-xs text-gray-400">最近使用した色</div>
              <div className="flex gap-1">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color, false)}
                    className="h-5 w-5 rounded border border-night-muted hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Dropdown>

      <Dropdown
        isOpen={openDropdown === "bgColor"}
        onToggle={() => setOpenDropdown(openDropdown === "bgColor" ? null : "bgColor")}
        onClose={closeDropdown}
        trigger={
          <>
            <Highlighter className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </>
        }
      >
        <div className="p-3 w-64">
          <div className="mb-2 text-xs text-gray-400">背景色</div>
          <div className="grid grid-cols-10 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color, true)}
                className="h-5 w-5 rounded border border-night-muted hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </Dropdown>

      <Separator />

      {/* Headings */}
      <Dropdown
        isOpen={openDropdown === "heading"}
        onToggle={() => setOpenDropdown(openDropdown === "heading" ? null : "heading")}
        onClose={closeDropdown}
        trigger={
          <>
            <Heading className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </>
        }
      >
        <div className="py-1">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => { onHeading(level); closeDropdown(); }}
              className="block w-full px-4 py-2 text-left hover:bg-night-muted"
              style={{ fontSize: `${1.5 - level * 0.15}rem` }}
            >
              見出し {level}
            </button>
          ))}
        </div>
      </Dropdown>

      <ToolbarButton icon={<Minus className="h-4 w-4" />} label="区切り線" onClick={() => onFormat("hr")} />
      <ToolbarButton icon={<Quote className="h-4 w-4" />} label="引用" onClick={() => onFormat("quote")} />

      <Separator />

      {/* Lists */}
      <ToolbarButton icon={<List className="h-4 w-4" />} label="箇条書きリスト" onClick={() => onFormat("ul")} />
      <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} label="番号付きリスト" onClick={() => onFormat("ol")} />
      <ToolbarButton icon={<CheckSquare className="h-4 w-4" />} label="チェックリスト" onClick={() => onFormat("task")} />

      <Separator />

      {/* Code */}
      <ToolbarButton icon={<Code className="h-4 w-4" />} label="インラインコード" shortcut="Ctrl+`" onClick={() => onFormat("code")} />
      <ToolbarButton icon={<FileCode className="h-4 w-4" />} label="コードブロック" shortcut="Ctrl+Shift+`" onClick={() => onFormat("codeBlock")} />

      <Separator />

      {/* Insert */}
      <ToolbarButton icon={<Link className="h-4 w-4" />} label="リンク挿入" shortcut="Ctrl+K" onClick={onLink} />
      <ToolbarButton icon={<Image className="h-4 w-4" />} label="画像挿入" onClick={onImage} />
      <ToolbarButton icon={<Table className="h-4 w-4" />} label="テーブル挿入" onClick={onTable} />

      {/* Emoji */}
      <Dropdown
        isOpen={openDropdown === "emoji"}
        onToggle={() => setOpenDropdown(openDropdown === "emoji" ? null : "emoji")}
        onClose={closeDropdown}
        trigger={
          <>
            <Smile className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </>
        }
      >
        <div className="p-3 w-72 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-10 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onEmoji(emoji); closeDropdown(); }}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-night-muted text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </Dropdown>

      <Separator />

      {/* Indent & Align */}
      <ToolbarButton icon={<IndentIncrease className="h-4 w-4" />} label="インデント追加" onClick={() => onIndent(true)} />
      <ToolbarButton icon={<IndentDecrease className="h-4 w-4" />} label="インデント削除" onClick={() => onIndent(false)} />
      <ToolbarButton icon={<AlignLeft className="h-4 w-4" />} label="左寄せ" onClick={() => onAlign("left")} />
      <ToolbarButton icon={<AlignCenter className="h-4 w-4" />} label="中央寄せ" onClick={() => onAlign("center")} />
      <ToolbarButton icon={<AlignRight className="h-4 w-4" />} label="右寄せ" onClick={() => onAlign("right")} />

      <Separator />

      {/* View modes */}
      <ToolbarButton
        icon={<EyeOff className="h-4 w-4" />}
        label="エディターのみ"
        onClick={() => onViewModeChange("editor")}
        isActive={viewMode === "editor"}
      />
      <ToolbarButton
        icon={<Eye className="h-4 w-4" />}
        label="プレビューのみ"
        onClick={() => onViewModeChange("preview")}
        isActive={viewMode === "preview"}
      />
      <ToolbarButton
        icon={<Columns className="h-4 w-4" />}
        label="サイドバイサイド"
        shortcut="Ctrl+Shift+P"
        onClick={() => onViewModeChange("split")}
        isActive={viewMode === "split"}
      />

      <Separator />

      {/* Mode & Theme */}
      <ToolbarButton
        icon={<RefreshCw className="h-4 w-4" />}
        label={mode === "markdown" ? "HTMLモードへ切替" : "Markdownモードへ切替"}
        onClick={onModeToggle}
      />
      <ToolbarButton
        icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        label={isDark ? "ライトモード" : "ダークモード"}
        onClick={onThemeToggle}
      />
      <ToolbarButton
        icon={<Maximize className="h-4 w-4" />}
        label="フルスクリーン"
        shortcut="Ctrl+Shift+Enter"
        onClick={onFullscreenToggle}
        isActive={isFullscreen}
      />

      {/* Mode indicator */}
      <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
        <span className="rounded bg-night-muted px-2 py-1">{mode === "markdown" ? "Markdown" : "HTML"}</span>
      </div>
    </div>
  );
}

