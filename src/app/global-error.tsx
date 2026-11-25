"use client";
// N.9.3 Last-resort error page (root layout failed). Plain HTML — no app styles guaranteed.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#FFFAF3", color: "#2A2420", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
          <p>Please try again. Your progress is safe.</p>
          <button type="button" onClick={() => retry()} style={{ padding: "12px 24px", borderRadius: 12, border: 0, background: "#E07B1F", color: "#fff", fontWeight: 800, fontSize: 16 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
