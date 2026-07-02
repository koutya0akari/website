// 閲覧数カウントの重複防止まわりの純粋ロジック。
// /api/diary/view は未認証 POST から service-role RPC を叩くため、
// RPC に渡す前の slug 検証と、cookie による同一ブラウザの再カウント抑止を行う。

const SLUG_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

export function isValidDiarySlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

// slug は英数と - _ のみなので cookie 名としてそのまま安全に使える
export function viewCookieName(slug: string): string {
  return `v_${slug}`;
}

export const VIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h
