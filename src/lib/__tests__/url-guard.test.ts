import { describe, it, expect } from "vitest";

import { isBlockedHostname, parsePublicHttpUrl } from "@/lib/url-guard";

describe("isBlockedHostname", () => {
  it("blocks localhost aliases", () => {
    expect(isBlockedHostname("localhost")).toBe(true);
    expect(isBlockedHostname("LOCALHOST")).toBe(true);
    expect(isBlockedHostname("foo.localhost")).toBe(true);
    expect(isBlockedHostname("printer.local")).toBe(true);
  });

  it("blocks loopback and unspecified addresses", () => {
    expect(isBlockedHostname("127.0.0.1")).toBe(true);
    expect(isBlockedHostname("127.1.2.3")).toBe(true);
    expect(isBlockedHostname("0.0.0.0")).toBe(true);
    expect(isBlockedHostname("::1")).toBe(true);
    expect(isBlockedHostname("[::1]")).toBe(true);
    expect(isBlockedHostname("::")).toBe(true);
  });

  it("blocks private IPv4 ranges", () => {
    expect(isBlockedHostname("10.0.0.1")).toBe(true);
    expect(isBlockedHostname("192.168.1.1")).toBe(true);
    expect(isBlockedHostname("172.16.0.1")).toBe(true);
    expect(isBlockedHostname("172.31.255.255")).toBe(true);
    expect(isBlockedHostname("169.254.169.254")).toBe(true);
  });

  it("does not block the public parts of the 172.x space", () => {
    expect(isBlockedHostname("172.15.0.1")).toBe(false);
    expect(isBlockedHostname("172.32.0.1")).toBe(false);
  });

  it("blocks the CGNAT range 100.64.0.0/10", () => {
    expect(isBlockedHostname("100.64.0.1")).toBe(true);
    expect(isBlockedHostname("100.127.255.255")).toBe(true);
    expect(isBlockedHostname("100.63.0.1")).toBe(false);
    expect(isBlockedHostname("100.128.0.1")).toBe(false);
  });

  it("blocks private IPv6 prefixes", () => {
    expect(isBlockedHostname("fc00::1")).toBe(true);
    expect(isBlockedHostname("fd12:3456::1")).toBe(true);
    expect(isBlockedHostname("fe80::1")).toBe(true);
  });

  it("allows public hostnames", () => {
    expect(isBlockedHostname("example.com")).toBe(false);
    expect(isBlockedHostname("www.akari0koutya.com")).toBe(false);
    expect(isBlockedHostname("93.184.216.34")).toBe(false);
  });
});

describe("parsePublicHttpUrl", () => {
  it("accepts public http/https URLs", () => {
    expect(parsePublicHttpUrl("https://example.com/page")?.hostname).toBe("example.com");
    expect(parsePublicHttpUrl("http://example.com")?.protocol).toBe("http:");
  });

  it("rejects non-http protocols", () => {
    expect(parsePublicHttpUrl("file:///etc/passwd")).toBeNull();
    expect(parsePublicHttpUrl("ftp://example.com")).toBeNull();
    expect(parsePublicHttpUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects blocked hosts and malformed URLs", () => {
    expect(parsePublicHttpUrl("http://localhost:3000")).toBeNull();
    expect(parsePublicHttpUrl("http://192.168.0.1/admin")).toBeNull();
    expect(parsePublicHttpUrl("not a url")).toBeNull();
  });
});
