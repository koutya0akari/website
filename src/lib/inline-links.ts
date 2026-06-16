/**
 * インライン Markdown リンクのトークナイザ
 *
 * `math-callout` のような「生 HTML ブロック」の内側に書かれた本文は、
 * CommonMark の HTML ブロック規則により remark に Markdown として
 * 解釈されない（前後を空行で挟んでいないため）。そのため
 * `[RZ26](#ref-RasekhZhuFractured)` のようなリンク記法がそのまま
 * 文字列として残ってしまう。これは同ブロック内の `$$...$$` 数式が
 * クライアント側（DiaryBody）で描画されるのと同じ事情である。
 *
 * このモジュールは、テキストノードに残ったリンク記法を抽出して
 * クライアント側で `<a>` へ展開できるようにする。レンダリングは
 * DiaryBody 側で行い、ここでは純粋な字句解析のみを担う（テスト容易性）。
 */

// `[label](href)` — label/href に改行や明らかな区切りを含めない素朴な記法のみ対象。
const MD_LINK_PATTERN = /\[([^\]\n]+)\]\(([^\s)]+)\)/g;

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

const SAFE_RELATIVE_PREFIXES = ["#", "/", "./", "../"];
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** `javascript:` 等の危険なスキームを除外し、安全な href のみ許可する。 */
export function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed === "") return false;
  if (SAFE_RELATIVE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

/** テキストにリンク記法が含まれるかを判定する（global 状態を持たない）。 */
export function hasInlineLink(text: string): boolean {
  return new RegExp(MD_LINK_PATTERN.source).test(text);
}

/**
 * テキストを「素のテキスト」と「安全なリンク」のトークン列へ分解する。
 * 安全でない href のリンク記法はそのまま素のテキストとして残す。
 */
export function tokenizeInlineLinks(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex = new RegExp(MD_LINK_PATTERN.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [full, label, href] = match;
    if (!isSafeHref(href)) {
      // 危険な href はリンク化せず、後続のテキストへ取り込む。
      continue;
    }
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "link", label, href });
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}
