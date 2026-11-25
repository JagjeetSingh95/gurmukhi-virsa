import { ImageResponse } from "next/og";

export const alt = "Gurmukhi Virsa — Gurmukhi, Paath and Sikh heritage, made for kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text: the default OG font has no Gurmukhi glyphs.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 60,
          padding: 80,
          background: "linear-gradient(180deg,#FFF4E8 0%,#FFFAF3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="320" height="320" viewBox="0 0 100 100">
          <circle cx="50" cy="52" r="44" fill="#C9661A" />
          <circle cx="50" cy="52" r="37" fill="#EE9A3C" />
          <circle cx="29" cy="30" r="10" fill="#FFD49A" />
          <circle cx="71" cy="30" r="10" fill="#FFD49A" />
          <circle cx="29" cy="30" r="5" fill="#F3AE68" />
          <circle cx="71" cy="30" r="5" fill="#F3AE68" />
          <circle cx="50" cy="56" r="28" fill="#FFD49A" />
          <ellipse cx="50" cy="67" rx="14" ry="10" fill="#FFF0D6" />
          <ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="#7A3E0E" />
          <circle cx="40" cy="53" r="3.6" fill="#3A2210" />
          <circle cx="60" cy="53" r="3.6" fill="#3A2210" />
          <path d="M44 70 Q50 76 56 70" stroke="#7A3E0E" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#A94C0C" }}>Gurmukhi Virsa</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#2A2018", lineHeight: 1.1 }}>
            Gurmukhi, Paath and Sikh heritage — made for kids.
          </div>
          <div style={{ fontSize: 28, color: "#6E6155" }}>Paath free forever · No ads · No tracking</div>
        </div>
      </div>
    ),
    size,
  );
}
