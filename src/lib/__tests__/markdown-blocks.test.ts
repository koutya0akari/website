import { describe, it, expect } from "vitest";

import { preprocessRichBlocks } from "@/lib/markdown-blocks";

describe("preprocessRichBlocks — fold", () => {
  it("expands :::fold into a <details class=\"md-fold\"> with the title in <summary>", () => {
    const out = preprocessRichBlocks([":::fold タイトル", "中身", ":::"].join("\n"));
    expect(out).toContain('<details class="md-fold">');
    expect(out).toContain("<summary>タイトル</summary>");
    expect(out).toContain("中身");
    expect(out).toContain("</details>");
  });

  it("falls back to a default summary when no title is given", () => {
    const out = preprocessRichBlocks([":::fold", "本文", ":::"].join("\n"));
    expect(out).toContain("<summary>詳細</summary>");
  });
});

describe("preprocessRichBlocks — hide", () => {
  it("expands :::hide into a <details class=\"md-hide\"> with a spoiler default summary", () => {
    const out = preprocessRichBlocks([":::hide", "秘密", ":::"].join("\n"));
    expect(out).toContain('<details class="md-hide">');
    expect(out).toContain("<summary>クリックして表示</summary>");
  });

  it("accepts the [タイトル] bracket form", () => {
    const out = preprocessRichBlocks([":::hide [答え]", "42", ":::"].join("\n"));
    expect(out).toContain("<summary>答え</summary>");
  });
});

describe("preprocessRichBlocks — tabs", () => {
  it("expands :::tabs into md-tabs with one md-tab per @tab", () => {
    const out = preprocessRichBlocks(
      [":::tabs", "@tab A", "a content", "@tab B", "b content", ":::"].join("\n"),
    );
    expect(out).toContain('<div class="md-tabs" data-md-tabs>');
    expect(out).toContain('data-tab-label="A"');
    expect(out).toContain('data-tab-label="B"');
    expect(out).toContain("a content");
    expect(out).toContain("b content");
  });
});

describe("preprocessRichBlocks — inline spoiler", () => {
  it("wraps ||text|| in a md-spoiler span", () => {
    const out = preprocessRichBlocks("これは||秘密||です");
    expect(out).toContain('<span class="md-spoiler" tabindex="0">秘密</span>');
  });

  it("does not match || followed by whitespace (avoids GFM empty table cells)", () => {
    const out = preprocessRichBlocks("a || b || c");
    expect(out).not.toContain("md-spoiler");
  });
});

describe("preprocessRichBlocks — safety / non-destructive cases", () => {
  it("never transforms content inside a fenced code block", () => {
    const out = preprocessRichBlocks(
      ["```", ":::fold x", "||not a spoiler||", ":::", "```"].join("\n"),
    );
    expect(out).not.toContain("md-fold");
    expect(out).not.toContain("md-spoiler");
    expect(out).toContain(":::fold x");
  });

  it("detects an indented :::fold (e.g. inside a math-callout HTML block)", () => {
    const out = preprocessRichBlocks(
      ['<div class="math-callout">', "  :::fold 補足", "  詳細", "  :::", "</div>"].join("\n"),
    );
    expect(out).toContain('<details class="md-fold">');
    expect(out).toContain("<summary>補足</summary>");
  });

  it("leaves an unclosed :::fold untouched", () => {
    const input = [":::fold タイトル", "閉じが無い"].join("\n");
    const out = preprocessRichBlocks(input);
    expect(out).toContain(":::fold タイトル");
    expect(out).not.toContain("md-fold");
  });

  it("escapes HTML metacharacters in a fold title", () => {
    const out = preprocessRichBlocks([':::fold <b>x</b>', "y", ":::"].join("\n"));
    expect(out).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(out).not.toContain("<summary><b>x</b></summary>");
  });
});
