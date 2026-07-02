// サーバー側で KaTeX 描画済みの要素に付けるクラス。
// KaTeXProvider（クライアントの auto-render）はこのクラスの中をスキャンしない。
// server/client 両方から import されるため、"use client" モジュールには置かない。
export const KATEX_PRERENDERED_CLASS = "katex-prerendered";
