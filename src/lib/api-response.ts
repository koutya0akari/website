import { NextResponse } from "next/server";

/**
 * Standard JSON error response for API routes.
 *
 * Logs the underlying cause server-side (where including details is safe) and
 * returns only a generic message to the client, so internal details — database
 * error messages, stack traces — are never leaked in the HTTP response.
 *
 * @param message Client-facing, non-sensitive message.
 * @param status  HTTP status code.
 * @param cause   Optional underlying error to log server-side (never returned).
 * @param scope   Log prefix, e.g. "API" or "Upload".
 */
export function apiError(
  message: string,
  status: number,
  cause?: unknown,
  scope = "API",
): NextResponse {
  if (cause !== undefined) {
    console.error(`[${scope}] ${message}:`, cause);
  }
  return NextResponse.json({ error: message }, { status });
}
