import { ImageResponse } from "next/og";

export const alt = "Saarthi Classes: psychology for Class 11, 12 and CUET-UG with Dravina Gupta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#164A2E", color: "#FBF8F1", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 30, color: "#F0BE4F", fontWeight: 600, letterSpacing: 4 }}>SAARTHI CLASSES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 1.02, maxWidth: 1000 }}>Psychology that finally clicks.</div>
          <div style={{ display: "flex", fontSize: 32, color: "rgba(251,248,241,0.75)" }}>Class 11 · Class 12 · CUET-UG · Free live workshops</div>
        </div>
        <div style={{ display: "flex", width: 420, height: 10, borderRadius: 10, background: "#E6A520" }} />
      </div>
    ),
    size
  );
}
