import type { EditorMode, FormatOptions, LinkDialogData, ImageDialogData, TableDialogData } from "./editor-types";
import { FORMAT_MAP } from "./editor-types";

/**
 * Apply format to selected text or insert at cursor
 */
export function applyFormat(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: FormatOptions
): { newContent: string; newCursorPos: number } {
  const before = content.substring(0, selectionStart);
  const selected = content.substring(selectionStart, selectionEnd);
  const after = content.substring(selectionEnd);

  const textToWrap = selected || format.defaultText || "";
  const newText = `${format.prefix}${textToWrap}${format.suffix}`;

  const newContent = before + newText + after;
  const newCursorPos = selectionStart + format.prefix.length + textToWrap.length;

  return { newContent, newCursorPos };
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
    return `<a href="${data.url}"${target}>${data.text || "リンク"}</a>`;
  }
}

/**
 * Generate image markup
 */
export function generateImage(mode: EditorMode, data: ImageDialogData): string {
  if (mode === "markdown") {
    return `![${data.alt || "画像"}](${data.url})`;
  } else {
    const width = data.width ? ` width="${data.width}"` : "";
    const height = data.height ? ` height="${data.height}"` : "";
    return `<img src="${data.url}" alt="${data.alt || "画像"}"${width}${height}>`;
  }
}

/**
 * Generate table markup
 */
export function generateTable(mode: EditorMode, data: TableDialogData): string {
  const { rows, cols, hasHeader, alignment } = data;

  if (mode === "markdown") {
    let table = "";

    // Header row
    if (hasHeader) {
      table += "|" + Array(cols).fill(" ヘッダー ").join("|") + "|\n";
      // Separator with alignment
      const alignChar = alignment === "center" ? ":---:" : alignment === "right" ? "---:" : "---";
      table += "|" + Array(cols).fill(` ${alignChar} `).join("|") + "|\n";
    }

    // Data rows
    const dataRows = hasHeader ? rows - 1 : rows;
    for (let i = 0; i < dataRows; i++) {
      table += "|" + Array(cols).fill(" セル ").join("|") + "|\n";
    }

    return table;
  } else {
    let table = "<table>\n";

    if (hasHeader) {
      table += "  <thead>\n    <tr>\n";
      for (let j = 0; j < cols; j++) {
        table += `      <th>ヘッダー</th>\n`;
      }
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
    // Markdown doesn't support colors natively, use HTML span
    return `<span style="${property}: ${color}">${text}</span>`;
  } else {
    return `<span style="${property}: ${color}">${text}</span>`;
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

/**
 * Parse Markdown to HTML for preview (basic implementation)
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first (except for intentional HTML)
  // html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || "plaintext"}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Unordered lists
  html = html.replace(/^- \[ \] (.+)$/gm, '<li><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<li><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Line breaks
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<h[1-6]>)/g, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");
  html = html.replace(/<p>(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");
  html = html.replace(/<p>(<hr>)<\/p>/g, "$1");
  html = html.replace(/<p>(<li>)/g, "<ul>$1");
  html = html.replace(/(<\/li>)<\/p>/g, "$1</ul>");

  return html;
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

