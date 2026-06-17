import { describe, it, expect } from "vitest";

import { renderMarkdownToHtml, normalizeLineEndings } from "@/lib/markdown-renderer";

describe("normalizeLineEndings", () => {
  it("converts CRLF and CR to LF", () => {
    expect(normalizeLineEndings("a\r\nb\rc")).toBe("a\nb\nc");
  });
});

describe("renderMarkdownToHtml", () => {
  it("renders basic GFM (headings, lists, bold)", () => {
    const html = renderMarkdownToHtml("# Title\n\n- **bold** item");
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>");
  });

  it("auto-assigns slug ids to headings (rehype-slug)", () => {
    const html = renderMarkdownToHtml("## Section One");
    expect(html).toContain('id="section-one"');
  });

  it("renders display math via KaTeX", () => {
    const html = renderMarkdownToHtml("$$a^2 + b^2 = c^2$$");
    expect(html).toContain("katex");
  });

  // These guard against a sanitization schema accidentally stripping the
  // custom rich-block markup. Keep them green when adding rehype-sanitize.
  it("preserves fold block markup end-to-end", () => {
    const html = renderMarkdownToHtml([":::fold 補足", "中身", ":::"].join("\n"));
    expect(html).toContain("md-fold");
    expect(html).toContain("<details");
    expect(html).toContain("<summary>");
  });

  it("preserves tabs block markup with data-tab-label", () => {
    const html = renderMarkdownToHtml(
      [":::tabs", "@tab A", "x", "@tab B", "y", ":::"].join("\n"),
    );
    expect(html).toContain("md-tabs");
    expect(html).toContain('data-tab-label="A"');
  });

  it("preserves inline spoiler spans", () => {
    const html = renderMarkdownToHtml("これは||秘密||です");
    expect(html).toContain("md-spoiler");
  });

  it("preserves a raw math-callout HTML block and its class modifier", () => {
    const html = renderMarkdownToHtml(
      ['<div class="math-callout math-callout--theorem">', "", "定理本文", "", "</div>"].join("\n"),
    );
    expect(html).toContain("math-callout");
    expect(html).toContain("math-callout--theorem");
  });

  it("preserves heading ids without a clobber prefix (anchor links / TOC)", () => {
    const html = renderMarkdownToHtml("## Section One");
    expect(html).toContain('id="section-one"');
    expect(html).not.toContain("user-content-");
  });

  it("preserves bibliography fragment links and ref-* anchor targets", () => {
    const html = renderMarkdownToHtml(
      [
        "See [BS13](#ref-BhattScholzeProEtale).",
        "",
        '<div id="ref-BhattScholzeProEtale">Bhatt-Scholze</div>',
      ].join("\n"),
    );

    expect(html).toContain('<a href="#ref-BhattScholzeProEtale">BS13</a>');
    expect(html).toContain('<div id="ref-BhattScholzeProEtale">Bhatt-Scholze</div>');
    expect(html).not.toContain("user-content-ref-BhattScholzeProEtale");
  });

  it("restores hyphen-namespaced cross-reference anchor targets (prop-/dfn-/thm-/rem-)", () => {
    for (const id of [
      "prop-compact-hausdorff-proetale-comparison",
      "dfn-2-9",
      "thm-main",
      "rem-2-24",
    ]) {
      const html = renderMarkdownToHtml(`<div id="${id}" class="math-callout">x</div>`);
      expect(html).toContain(`id="${id}"`);
      expect(html).not.toContain(`user-content-${id}`);
    }
  });

  it("keeps non-namespaced (single-word) raw HTML ids clobber-prefixed", () => {
    const html = renderMarkdownToHtml('<div id="location">content</div>');

    expect(html).toContain('id="user-content-location"');
  });

  it("allows iframes from allowed hosts (Google Maps embed)", () => {
    const html = renderMarkdownToHtml(
      '<iframe src="https://www.google.com/maps/d/embed?mid=abc123&ehbc=2E312F" width="640" height="480"></iframe>',
    );
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.google.com/maps/d/embed?mid=abc123');
    expect(html).toContain('width="640"');
  });

  it("strips iframes from disallowed hosts", () => {
    const html = renderMarkdownToHtml('<iframe src="https://evil.example.com/x"></iframe>\n\nhello');
    expect(html).not.toContain("<iframe");
    expect(html).toContain("hello");
  });

  it("strips non-map iframes from otherwise allowed hosts", () => {
    const html = renderMarkdownToHtml('<iframe src="https://www.google.com/search?q=maps"></iframe>\n\nhello');
    expect(html).not.toContain("<iframe");
    expect(html).toContain("hello");
  });

  it("strips non-https iframes even from allowed hosts", () => {
    const html = renderMarkdownToHtml('<iframe src="http://www.google.com/maps"></iframe>\n\nhi');
    expect(html).not.toContain("<iframe");
    expect(html).toContain("hi");
  });

  // Sanitization guards — these encode the security contract of the pipeline.
  it("strips <script> tags", () => {
    const html = renderMarkdownToHtml('<script>alert(1)</script>\n\nhello');
    expect(html).not.toContain("<script");
    expect(html).toContain("hello");
  });

  it("strips inline event handler attributes", () => {
    const html = renderMarkdownToHtml('<img src="https://example.com/x.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("strips javascript: URLs from links", () => {
    const html = renderMarkdownToHtml("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });
});
