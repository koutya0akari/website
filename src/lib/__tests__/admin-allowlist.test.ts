import { describe, it, expect } from "vitest";

import { isAllowedAdminEmail } from "@/lib/admin-allowlist";

describe("isAllowedAdminEmail", () => {
  it("allows an email present in the allowlist", () => {
    expect(isAllowedAdminEmail("admin@example.com", "admin@example.com")).toBe(true);
  });

  it("supports comma-separated lists with whitespace", () => {
    const list = " a@example.com , b@example.com ,c@example.com";
    expect(isAllowedAdminEmail("b@example.com", list)).toBe(true);
    expect(isAllowedAdminEmail("c@example.com", list)).toBe(true);
    expect(isAllowedAdminEmail("d@example.com", list)).toBe(false);
  });

  it("compares case-insensitively", () => {
    expect(isAllowedAdminEmail("Admin@Example.COM", "admin@example.com")).toBe(true);
    expect(isAllowedAdminEmail("admin@example.com", "ADMIN@EXAMPLE.COM")).toBe(true);
  });

  it("denies everyone when the allowlist is unset or empty (fail-closed)", () => {
    expect(isAllowedAdminEmail("admin@example.com", undefined)).toBe(false);
    expect(isAllowedAdminEmail("admin@example.com", "")).toBe(false);
    expect(isAllowedAdminEmail("admin@example.com", " , ,")).toBe(false);
  });

  it("denies missing or empty emails", () => {
    expect(isAllowedAdminEmail(undefined, "admin@example.com")).toBe(false);
    expect(isAllowedAdminEmail(null, "admin@example.com")).toBe(false);
    expect(isAllowedAdminEmail("", "admin@example.com")).toBe(false);
    expect(isAllowedAdminEmail("   ", "admin@example.com")).toBe(false);
  });

  it("requires an exact entry match, not a substring", () => {
    expect(isAllowedAdminEmail("admin@example.com", "notadmin@example.com")).toBe(false);
    expect(isAllowedAdminEmail("admin@example.co", "admin@example.com")).toBe(false);
  });
});
