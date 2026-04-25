import type { EditorMode, FormatOptions, LinkDialogData, ImageDialogData, TableDialogData } from "./editor-types";
import { FORMAT_MAP } from "./editor-types";
import { renderMarkdownToHtml } from "@/lib/markdown-renderer";

const BLOCK_LINE_PREFIXES = new Set(["- ", "1. ", "- [ ] ", "> "]);

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function wrapSelection(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  defaultText = "",
) {
  const before = content.substring(0, selectionStart);
  const selected = content.substring(selectionStart, selectionEnd);
  const after = content.substring(selectionEnd);
  const text = selected || defaultText;
  const newText = `${prefix}${text}${suffix}`;

  return {
    newContent: before + newText + after,
    newCursorPos: selectionStart + prefix.length + text.length,
  };
}

function toggleLineFormat(line: string, format: FormatOptions): string {
  if (line.startsWith(format.prefix)) {
    const withoutPrefix = line.substring(format.prefix.length);
    if (format.suffix && withoutPrefix.endsWith(format.suffix)) {
      return withoutPrefix.substring(0, withoutPrefix.length - format.suffix.length);
    }
    return withoutPrefix;
  }

  const textContent = line || format.defaultText || "";
  return `${format.prefix}${textContent}${format.suffix}`;
}

/**
 * Apply format to selected text or insert at cursor
 */
export function applyFormat(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: FormatOptions
): { newContent: string; newCursorPos: number } {
  if (format.blockLevel) {
    const lineStart = content.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
    const adjustedSelectionEnd =
      selectionEnd > selectionStart && content[selectionEnd - 1] === "\n"
        ? selectionEnd - 1
        : selectionEnd;
    const nextLineBreak = content.indexOf("\n", adjustedSelectionEnd);
    const lineEnd = adjustedSelectionEnd === selectionStart
      ? content.indexOf("\n", selectionStart)
      : nextLineBreak;
    const blockEnd = lineEnd === -1 ? content.length : lineEnd;
    const beforeLine = content.substring(0, lineStart);
    const lineAndSelection = content.substring(lineStart, blockEnd);
    const afterContent = content.substring(blockEnd);
    const lines = lineAndSelection.split("\n");
    const isMultiLineFormat = BLOCK_LINE_PREFIXES.has(format.prefix);

    const formattedLines = lines.map((line, index) => {
      if (!isMultiLineFormat && index > 0) {
        return line;
      }

      if (index > 0 && line.trim() === "") {
        return line;
      }

      return toggleLineFormat(line, format);
    });

    const newLineContent = formattedLines.join("\n");
    const newContent = beforeLine + newLineContent + afterContent;
    const newCursorPos = beforeLine.length + newLineContent.length;

    return { newContent, newCursorPos };
  }

  return wrapSelection(
    content,
    selectionStart,
    selectionEnd,
    format.prefix,
    format.suffix,
    format.defaultText || "",
  );
}

/**
 * Get format options for a given format type and editor mode
 */
export function getFormat(mode: EditorMode, formatType: string): FormatOptions | undefined {
  return FORMAT_MAP[mode]?.[formatType];
}

/**
 * Generate link markup
 */
export function generateLink(mode: EditorMode, data: LinkDialogData): string {
  if (mode === "markdown") {
    return `[${data.text || "リンク"}](${data.url})`;
  } else {
    const target = data.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${escapeAttribute(data.url)}"${target}>${escapeHtml(data.text || "リンク")}</a>`;
  }
}

/**
 * Generate image markup
 */
export function generateImage(mode: EditorMode, data: ImageDialogData): string {
  if (mode === "markdown") {
    return `![${data.alt || "画像"}](${data.url})`;
  } else {
    const width = data.width ? ` width="${escapeAttribute(data.width)}"` : "";
    const height = data.height ? ` height="${escapeAttribute(data.height)}"` : "";
    return `<img src="${escapeAttribute(data.url)}" alt="${escapeAttribute(data.alt || "画像")}"${width}${height}>`;
  }
}

/**
 * Generate table markup
 */
export function generateTable(mode: EditorMode, data: TableDialogData): string {
  const { rows, cols, hasHeader, alignment } = data;

  if (mode === "markdown") {
    let table = "";

    if (hasHeader) {
      table += "|" + Array(cols).fill(" ヘッダー ").join("|") + "|\n";
      const alignChar = alignment === "center" ? ":---:" : alignment === "right" ? "---:" : "---";
      table += "|" + Array(cols).fill(` ${alignChar} `).join("|") + "|\n";
    }

    const dataRows = hasHeader ? rows - 1 : rows;
    for (let i = 0; i < dataRows; i++) {
      table += "|" + Array(cols).fill(" セル ").join("|") + "|\n";
    }

    return table;
  } else {
    let table = "<table>\n";

    if (hasHeader) {
      table += "  <thead>\n    <tr>\n";
      table += Array.from({ length: cols }, () => "      <th>ヘッダー</th>\n").join("");
      table += "    </tr>\n  </thead>\n";
    }

    table += "  <tbody>\n";
    const dataRows = hasHeader ? rows - 1 : rows;
    for (let i = 0; i < dataRows; i++) {
      table += "    <tr>\n";
      for (let j = 0; j < cols; j++) {
        const style = alignment !== "left" ? ` style="text-align: ${alignment}"` : "";
        table += `      <td${style}>セル</td>\n`;
      }
      table += "    </tr>\n";
    }
    table += "  </tbody>\n</table>";

    return table;
  }
}

/**
 * Generate color styled text
 */
export function generateColorText(
  mode: EditorMode,
  text: string,
  color: string,
  isBackground: boolean
): string {
  const property = isBackground ? "background-color" : "color";

  if (mode === "markdown") {
    return `<span style="${property}: ${escapeAttribute(color)}">${escapeHtml(text)}</span>`;
  } else {
    return `<span style="${property}: ${escapeAttribute(color)}">${escapeHtml(text)}</span>`;
  }
}

/**
 * Add indentation to selected lines
 */
export function addIndent(content: string, selectionStart: number, selectionEnd: number): {
  newContent: string;
  newSelectionStart: number;
  newSelectionEnd: number;
} {
  const before = content.substring(0, selectionStart);
  const selected = content.substring(selectionStart, selectionEnd);
  const after = content.substring(selectionEnd);

  // Find line start
  const lineStart = before.lastIndexOf("\n") + 1;
  const linesBefore = before.substring(lineStart);

  // Indent each line in selection
  const indentedLines = (linesBefore + selected).split("\n").map((line) => "  " + line);
  const newSelected = indentedLines.join("\n");

  const newContent = before.substring(0, lineStart) + newSelected + after;
  const addedChars = indentedLines.length * 2;

  return {
    newContent,
    newSelectionStart: selectionStart + 2,
    newSelectionEnd: selectionEnd + addedChars,
  };
}

/**
 * Remove indentation from selected lines
 */
export function removeIndent(content: string, selectionStart: number, selectionEnd: number): {
  newContent: string;
  newSelectionStart: number;
  newSelectionEnd: number;
} {
  const before = content.substring(0, selectionStart);
  const selected = content.substring(selectionStart, selectionEnd);
  const after = content.substring(selectionEnd);

  // Find line start
  const lineStart = before.lastIndexOf("\n") + 1;
  const linesBefore = before.substring(lineStart);

  // Remove indent from each line
  let removedChars = 0;
  const unindentedLines = (linesBefore + selected).split("\n").map((line) => {
    if (line.startsWith("  ")) {
      removedChars += 2;
      return line.substring(2);
    } else if (line.startsWith("\t")) {
      removedChars += 1;
      return line.substring(1);
    }
    return line;
  });
  const newSelected = unindentedLines.join("\n");

  const newContent = before.substring(0, lineStart) + newSelected + after;

  return {
    newContent,
    newSelectionStart: Math.max(lineStart, selectionStart - 2),
    newSelectionEnd: Math.max(lineStart, selectionEnd - removedChars),
  };
}

/**
 * Apply text alignment (HTML only)
 */
export function applyAlignment(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  alignment: "left" | "center" | "right"
): string {
  const before = content.substring(0, selectionStart);
  const selected = content.substring(selectionStart, selectionEnd) || "テキスト";
  const after = content.substring(selectionEnd);

  const style = alignment === "left" ? "" : ` style="text-align: ${alignment}"`;
  return `${before}<div${style}>${selected}</div>${after}`;
}

export function markdownToHtml(markdown: string): string {
  try {
    return renderMarkdownToHtml(markdown);
  } catch (error) {
    console.error("[Editor] Failed to render Markdown preview:", error);
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }
}

/**
 * Debounce function for preview updates
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Common emoji list for emoji picker
 */
export const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
  "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋",
  "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
  "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
  "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
  "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓",
  "👍", "👎", "👏", "🙌", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘",
  "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
  "⭐", "🌟", "✨", "💫", "🔥", "💯", "✅", "❌", "⚠️", "💡",
];

/**
 * Preset colors for color picker
 */
export const PRESET_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
];
