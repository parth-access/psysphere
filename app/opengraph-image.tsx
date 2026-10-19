import { ImageResponse } from "next/og";

export const alt = "Saarthi Classes: psychology for Class 11, 12 and CUET-UG with Dravina Gupta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1C2541", color: "#FAF6EF", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 32, color: "#E3962B", fontWeight: 600 }}>Saarthi Classes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700, maxWidth: 950 }}>A calm guide through your psychology exam year.</div>
          <div style={{ fontSize: 32, color: "#C9CEDB" }}>Class 11 · Class 12 · CUET-UG · Free live workshops</div>
        </div>
        <svg width="1056" height="60" viewBox="0 0 1056 60">
          <path d="M4 52 C 240 52, 300 8, 528 8 S 860 50, 1052 20" fill="none" stroke="#2E3A5F" strokeWidth="4" />
          <path d="M4 52 C 240 52, 300 8, 528 8" fill="none" stroke="#FAF6EF" strokeWidth="4" />
          <circle cx="528" cy="8" r="8" fill="#E3962B" />
        </svg>
      </div>
    ),
    size
  );
}
