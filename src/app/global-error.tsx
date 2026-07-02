"use client";

// ルートレイアウト自体が失敗した場合の最終フォールバック。
// 自前の <html>/<body> を描画する必要があるため globals.css は当てにしない。
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 600 }}>問題が発生しました</h1>
          <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.7)" }}>
            一時的なエラーの可能性があります。再試行してください。
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            再試行する
          </button>
        </div>
      </body>
    </html>
  );
}
