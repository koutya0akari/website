// og-proxy などサーバー側から外部 URL を fetch する際の SSRF ガード。
// ホスト名文字列ベースの判定なので、DNS が私設 IP を返すケースまでは防げない。
// リダイレクト先も含め、fetch する URL は毎回ここを通すこと。

export function parsePublicHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (isBlockedHostname(parsed.hostname)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    normalized === "localhost" ||
    normalized === "::" ||
    normalized === "::1" ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".localhost")
  ) {
    return true;
  }

  // 0.0.0.0/8, 127.0.0.0/8, 10.0.0.0/8, 169.254.0.0/16 (link-local)
  if (
    /^0\./.test(normalized) ||
    /^127\./.test(normalized) ||
    /^10\./.test(normalized) ||
    /^169\.254\./.test(normalized)
  ) {
    return true;
  }

  if (/^192\.168\./.test(normalized)) {
    return true;
  }

  // 172.16.0.0/12
  const private172Match = normalized.match(/^172\.(\d{1,3})\./);
  if (private172Match) {
    const secondOctet = Number(private172Match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  // 100.64.0.0/10 (CGNAT)
  const cgnatMatch = normalized.match(/^100\.(\d{1,3})\./);
  if (cgnatMatch) {
    const secondOctet = Number(cgnatMatch[1]);
    if (secondOctet >= 64 && secondOctet <= 127) return true;
  }

  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}
