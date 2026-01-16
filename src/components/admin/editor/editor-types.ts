// Editor mode types
export type EditorMode = "markdown" | "html";
export type ViewMode = "editor" | "preview" | "split";

// Toolbar button types
export interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export interface ToolbarGroup {
  id: string;
  buttons: ToolbarButton[];
}

// Dialog types
export interface LinkDialogData {
  url: string;
  text: string;
  openInNewTab: boolean;
}

export interface ImageDialogData {
  url: string;
  alt: string;
  width?: string;
  height?: string;
}

export interface TableDialogData {
  rows: number;
  cols: number;
  hasHeader: boolean;
  alignment: "left" | "center" | "right";
}

// Editor state
export interface EditorState {
  content: string;
  mode: EditorMode;
  viewMode: ViewMode;
  isDark: boolean;
  isFullscreen: boolean;
  undoStack: string[];
  redoStack: string[];
  selection: {
    start: number;
    end: number;
    text: string;
  } | null;
}

// Format insertion helpers
export interface FormatOptions {
  prefix: string;
  suffix: string;
  defaultText?: string;
  blockLevel?: boolean;
}

export const FORMAT_MAP: Record<EditorMode, Record<string, FormatOptions>> = {
  markdown: {
    bold: { prefix: "**", suffix: "**", defaultText: "太字テキスト" },
    italic: { prefix: "*", suffix: "*", defaultText: "斜体テキスト" },
    underline: { prefix: "<u>", suffix: "</u>", defaultText: "下線テキスト" },
    strikethrough: { prefix: "~~", suffix: "~~", defaultText: "取り消し線" },
    code: { prefix: "`", suffix: "`", defaultText: "コード" },
    codeBlock: { prefix: "```\n", suffix: "\n```", defaultText: "コードブロック" },
    link: { prefix: "[", suffix: "](url)", defaultText: "リンクテキスト" },
    image: { prefix: "![", suffix: "](url)", defaultText: "画像の説明" },
    quote: { prefix: "> ", suffix: "", defaultText: "引用テキスト", blockLevel: true },
    h1: { prefix: "# ", suffix: "", defaultText: "見出し1", blockLevel: true },
    h2: { prefix: "## ", suffix: "", defaultText: "見出し2", blockLevel: true },
    h3: { prefix: "### ", suffix: "", defaultText: "見出し3", blockLevel: true },
    h4: { prefix: "#### ", suffix: "", defaultText: "見出し4", blockLevel: true },
    h5: { prefix: "##### ", suffix: "", defaultText: "見出し5", blockLevel: true },
    h6: { prefix: "###### ", suffix: "", defaultText: "見出し6", blockLevel: true },
    ul: { prefix: "- ", suffix: "", defaultText: "リスト項目", blockLevel: true },
    ol: { prefix: "1. ", suffix: "", defaultText: "リスト項目", blockLevel: true },
    task: { prefix: "- [ ] ", suffix: "", defaultText: "タスク", blockLevel: true },
    hr: { prefix: "\n---\n", suffix: "", defaultText: "" },
  },
  html: {
    bold: { prefix: "<strong>", suffix: "</strong>", defaultText: "太字テキスト" },
    italic: { prefix: "<em>", suffix: "</em>", defaultText: "斜体テキスト" },
    underline: { prefix: "<u>", suffix: "</u>", defaultText: "下線テキスト" },
    strikethrough: { prefix: "<del>", suffix: "</del>", defaultText: "取り消し線" },
    code: { prefix: "<code>", suffix: "</code>", defaultText: "コード" },
    codeBlock: { prefix: "<pre><code>\n", suffix: "\n</code></pre>", defaultText: "コードブロック" },
    link: { prefix: '<a href="url">', suffix: "</a>", defaultText: "リンクテキスト" },
    image: { prefix: '<img src="url" alt="', suffix: '">', defaultText: "画像の説明" },
    quote: { prefix: "<blockquote>", suffix: "</blockquote>", defaultText: "引用テキスト", blockLevel: true },
    h1: { prefix: "<h1>", suffix: "</h1>", defaultText: "見出し1", blockLevel: true },
    h2: { prefix: "<h2>", suffix: "</h2>", defaultText: "見出し2", blockLevel: true },
    h3: { prefix: "<h3>", suffix: "</h3>", defaultText: "見出し3", blockLevel: true },
    h4: { prefix: "<h4>", suffix: "</h4>", defaultText: "見出し4", blockLevel: true },
    h5: { prefix: "<h5>", suffix: "</h5>", defaultText: "見出し5", blockLevel: true },
    h6: { prefix: "<h6>", suffix: "</h6>", defaultText: "見出し6", blockLevel: true },
    ul: { prefix: "<ul>\n  <li>", suffix: "</li>\n</ul>", defaultText: "リスト項目", blockLevel: true },
    ol: { prefix: "<ol>\n  <li>", suffix: "</li>\n</ol>", defaultText: "リスト項目", blockLevel: true },
    task: { prefix: '<input type="checkbox"> ', suffix: "", defaultText: "タスク", blockLevel: true },
    hr: { prefix: "\n<hr>\n", suffix: "", defaultText: "" },
  },
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS: Record<string, { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }> = {
  bold: { key: "b", ctrl: true },
  italic: { key: "i", ctrl: true },
  underline: { key: "u", ctrl: true },
  save: { key: "s", ctrl: true },
  undo: { key: "z", ctrl: true },
  redo: { key: "z", ctrl: true, shift: true },
  link: { key: "k", ctrl: true },
  code: { key: "`", ctrl: true },
  codeBlock: { key: "`", ctrl: true, shift: true },
  preview: { key: "p", ctrl: true, shift: true },
  fullscreen: { key: "Enter", ctrl: true, shift: true },
};

