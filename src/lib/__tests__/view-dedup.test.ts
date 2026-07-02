import { describe, it, expect } from "vitest";

import { isValidDiarySlug, viewCookieName } from "@/lib/view-dedup";

describe("isValidDiarySlug", () => {
  it("accepts alphanumeric slugs with hyphens and underscores", () => {
    expect(isValidDiarySlug("tokyo-2025-d-module")).toBe(true);
    expect(isValidDiarySlug("condensed_mathematics_seminar_note_1")).toBe(true);
    expect(isValidDiarySlug("a")).toBe(true);
  });

  it("rejects empty and over-long slugs", () => {
    expect(isValidDiarySlug("")).toBe(false);
    expect(isValidDiarySlug("a".repeat(200))).toBe(true);
    expect(isValidDiarySlug("a".repeat(201))).toBe(false);
  });

  it("rejects slugs with path separators, spaces, or control characters", () => {
    expect(isValidDiarySlug("../etc/passwd")).toBe(false);
    expect(isValidDiarySlug("foo/bar")).toBe(false);
    expect(isValidDiarySlug("foo bar")).toBe(false);
    expect(isValidDiarySlug("foo;bar")).toBe(false);
    expect(isValidDiarySlug("日本語")).toBe(false);
  });
});

describe("viewCookieName", () => {
  it("prefixes the slug", () => {
    expect(viewCookieName("my-post")).toBe("v_my-post");
  });
});
