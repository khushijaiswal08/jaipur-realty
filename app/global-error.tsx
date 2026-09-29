"use client";

// Last-resort boundary when the root layout itself fails. Must render its own <html>/<body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1rem", textAlign: "center", color: "#1b2638" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
        <p style={{ marginTop: "0.75rem" }}>Please refresh the page or try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1.5rem", padding: "0.6rem 1.2rem", borderRadius: "0.75rem", border: "1px solid #c9d3e1", background: "#fff", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
