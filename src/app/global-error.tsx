"use client";

/**
 * Kök layout'un kendisi render sırasında hata verirse devreye girer
 * (normal error.tsx'in yakalayamadığı en üst seviye). Kendi <html>/<body>'sini
 * render etmek ZORUNDA — çünkü layout'un yerine geçer.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏍️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Bir şeyler ters gitti
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin; sorun sürerse
            bizimle iletişime geçin.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#FFD700",
              color: "#000",
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: "#FFD700", fontSize: 13 }}>
              Ana sayfaya dön
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
