/**
 * リッチブロックのプリプロセッサ
 *
 * 日記 / 数学メモ / メモの本文で、折り畳み・タブ・隠し(スポイラー)を
 * 簡単な `:::` 記法で書けるようにするための前処理。
 *
 * Markdown を unified(remark) に渡す前に、これらの記法を生の HTML
 * （前後を空行で挟んだブロック）へ展開する。空行で挟むことで、内側は
 * そのまま Markdown として解釈される（CommonMark の HTML ブロック規則）。
 *
 * サーバー(記事ページ)とエディタープレビューの両方から呼ばれるため、
 * server-only にはしない。
 *
 * 記法:
 *
 *   折り畳み:
 *     :::fold タイトル
 *     折り畳む内容（Markdown 可）
 *     :::
 *
 *   タブ:
 *     :::tabs
 *     @tab タブ1
 *     1つ目の内容
 *     @tab タブ2
 *     2つ目の内容
 *     :::
 *
 *   隠し(ブロック):
 *     :::hide タイトル(省略可)
 *     クリックで表示される内容
 *     :::
 *
 *   隠し(インライン): ||隠したいテキスト||
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 行頭から最大 width 文字分の空白を取り除く。 */
function dedent(line: string, width: number): string {
  let index = 0;
  while (index < width && index < line.length && (line[index] === " " || line[index] === "\t")) {
    index += 1;
  }
  return line.slice(index);
}

/** `タイトル` / `[タイトル]` のどちらの書き方でも中身を取り出す。 */
function normalizeTitle(raw: string): string {
  const trimmed = raw.trim();
  const bracket = trimmed.match(/^\[(.*)\]$/);
  return (bracket ? bracket[1] : trimmed).trim();
}

/** インラインスポイラー `||...||` を span へ展開する。 */
function replaceInlineSpoiler(line: string): string {
  // `||` を含まない 1 文字以上を、前後が空白でないように囲んだ場合のみ対象。
  // GFM テーブルの `||`（空セル）に誤反応しないようにしている。
  return line.replace(
    /\|\|(?!\s)([^|]+?)(?<!\s)\|\|/g,
    (_match, inner: string) => `<span class="md-spoiler" tabindex="0">${inner}</span>`,
  );
}

type ContainerKind = "fold" | "hide" | "tabs";

function buildFold(title: string, body: string[]): string[] {
  const summary = escapeHtml(title) || "詳細";
  return [
    `<details class="md-fold">`,
    `<summary>${summary}</summary>`,
    "",
    ...body,
    "",
    `</details>`,
  ];
}

function buildHide(title: string, body: string[]): string[] {
  const summary = escapeHtml(title) || "クリックして表示";
  return [
    `<details class="md-hide">`,
    `<summary>${summary}</summary>`,
    "",
    ...body,
    "",
    `</details>`,
  ];
}

function buildTabs(body: string[]): string[] {
  const panels: { label: string; lines: string[] }[] = [];
  let current: { label: string; lines: string[] } | null = null;

  for (const line of body) {
    const tabMatch = line.match(/^\s*@tab\s+(.*)$/);
    if (tabMatch) {
      current = { label: tabMatch[1].trim() || `タブ${panels.length + 1}`, lines: [] };
      panels.push(current);
      continue;
    }
    if (current) {
      current.lines.push(line);
    }
  }

  if (panels.length === 0) {
    return body;
  }

  const out: string[] = [`<div class="md-tabs" data-md-tabs>`, ""];
  for (const panel of panels) {
    out.push(`<div class="md-tab" data-tab-label="${escapeHtml(panel.label)}">`, "");
    // 前後の空行を整理してから本文を入れる
    const trimmed = [...panel.lines];
    while (trimmed.length && trimmed[0].trim() === "") trimmed.shift();
    while (trimmed.length && trimmed[trimmed.length - 1].trim() === "") trimmed.pop();
    out.push(...trimmed, "", `</div>`, "");
  }
  out.push(`</div>`);
  return out;
}

export function preprocessRichBlocks(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];

  let inCodeFence = false;
  let fenceChar = "";

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // フェンス付きコードブロックの内側は一切加工しない
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inCodeFence) {
        inCodeFence = true;
        fenceChar = marker;
      } else if (marker === fenceChar) {
        inCodeFence = false;
      }
      output.push(line);
      i += 1;
      continue;
    }
    if (inCodeFence) {
      output.push(line);
      i += 1;
      continue;
    }

    // 行頭の空白を許容する（math-callout などの HTML ブロック内でインデントして
    // 書かれた場合でも検出できるようにする）
    const openMatch = line.match(/^(\s*):::(fold|hide|tabs)\s*(.*)$/);
    if (openMatch) {
      const indent = openMatch[1] ?? "";
      const kind = openMatch[2] as ContainerKind;
      const title = normalizeTitle(openMatch[3] ?? "");

      // 対応する閉じ `:::` までを本文として収集する。
      // 開始マーカーのインデント分だけ各行を de-indent し、内側を素の
      // Markdown として解釈できるようにする。
      const body: string[] = [];
      let j = i + 1;
      let closed = false;
      while (j < lines.length) {
        if (lines[j].trim() === ":::") {
          closed = true;
          break;
        }
        body.push(dedent(lines[j], indent.length));
        j += 1;
      }

      if (!closed) {
        // 閉じが無い場合はそのまま出力（壊さない）
        output.push(line);
        i += 1;
        continue;
      }

      const processedBody = body.map(replaceInlineSpoiler);
      const expanded =
        kind === "fold"
          ? buildFold(title, processedBody)
          : kind === "hide"
            ? buildHide(title, processedBody)
            : buildTabs(processedBody);

      // ブロックが他の要素と確実に分離されるよう前後へ空行を入れる
      if (output.length && output[output.length - 1].trim() !== "") {
        output.push("");
      }
      output.push(...expanded, "");
      i = j + 1;
      continue;
    }

    output.push(replaceInlineSpoiler(line));
    i += 1;
  }

  return output.join("\n");
}
