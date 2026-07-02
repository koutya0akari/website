// 管理者として許可するメールアドレスの判定。
// 認証（Supabase ユーザーであること）とは別に、認可として ADMIN_EMAILS との照合を行う。
// allowlist 未設定は「全員拒否」に倒す（fail-closed）。
export function isAllowedAdminEmail(
  email: string | null | undefined,
  allowlist: string | undefined,
): boolean {
  if (!email || !allowlist) return false;

  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  return allowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}
