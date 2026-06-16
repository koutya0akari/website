import { describe, it, expect } from "vitest";

import { hasInlineLink, isSafeHref, tokenizeInlineLinks } from "@/lib/inline-links";

describe("hasInlineLink", () => {
  it("detects markdown link syntax", () => {
    expect(hasInlineLink("詳しくは [RZ26](#ref-RasekhZhuFractured) を参照")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(hasInlineLink("ふつうの文章。脚注 [1] など")).toBe(false);
  });
});

describe("isSafeHref", () => {
  it("allows in-page fragment anchors", () => {
    expect(isSafeHref("#ref-RasekhZhuFractured")).toBe(true);
  });

  it("allows relative and absolute http(s)/mailto urls", () => {
    expect(isSafeHref("/diary/foo")).toBe(true);
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("mailto:a@b.com")).toBe(true);
  });

  it("rejects javascript: and empty hrefs", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("   ")).toBe(false);
  });
});

describe("tokenizeInlineLinks", () => {
  it("splits a bibliography reference link out of surrounding text", () => {
    const tokens = tokenizeInlineLinks("詳しくは、[RZ26](#ref-RasekhZhuFractured) などを参照のこと。");
    expect(tokens).toEqual([
      { type: "text", value: "詳しくは、" },
      { type: "link", label: "RZ26", href: "#ref-RasekhZhuFractured" },
      { type: "text", value: " などを参照のこと。" },
    ]);
  });

  it("handles multiple links in one text run", () => {
    const tokens = tokenizeInlineLinks("[A](#ref-A) と [B](#ref-B)");
    expect(tokens).toEqual([
      { type: "link", label: "A", href: "#ref-A" },
      { type: "text", value: " と " },
      { type: "link", label: "B", href: "#ref-B" },
    ]);
  });

  it("returns a single text token when there is no link", () => {
    expect(tokenizeInlineLinks("リンクなし")).toEqual([{ type: "text", value: "リンクなし" }]);
  });

  it("keeps unsafe-href link syntax as literal text", () => {
    expect(tokenizeInlineLinks("[x](javascript:alert(1))")).toEqual([
      { type: "text", value: "[x](javascript:alert(1))" },
    ]);
  });
});
