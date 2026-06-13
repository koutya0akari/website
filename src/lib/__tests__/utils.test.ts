import { describe, it, expect } from "vitest";

import { cn, formatDate, stripHtml, createExcerpt, escapeHtml } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});

describe("formatDate", () => {
  it("formats an ISO date with the default pattern", () => {
    expect(formatDate("2026-01-05T00:00:00.000Z", "yyyy.MM.dd")).toBe("2026.01.05");
  });

  it("honours a custom pattern", () => {
    expect(formatDate("2026-01-05T00:00:00.000Z", "yyyy/MM")).toBe("2026/01");
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("stripHtml", () => {
  it("removes tags but keeps text content", () => {
    expect(stripHtml("<p>hello <strong>world</strong></p>")).toBe("hello world");
  });
});

describe("createExcerpt", () => {
  it("returns the plain text untouched when under the limit", () => {
    expect(createExcerpt("<p>short</p>")).toBe("short");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    const long = "x".repeat(200);
    const result = createExcerpt(long, 10);
    expect(result).toBe(`${"x".repeat(10)}…`);
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML-sensitive characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });
});
