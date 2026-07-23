import { ImageResponse } from "next/og";
import { getChannel } from "@/lib/queries";

export const alt = "Directo en StreamLive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await getChannel(slug);
  const name = channel?.displayName ?? "StreamLive";
  const title = channel?.title ?? "Directos para todos";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0e0e10 0%, #1f1f23 100%)",
          color: "#efeff1",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "#eb0400",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ● EN DIRECTO
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, color: "#a970ff", fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 60, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 32, color: "#adadb8", fontWeight: 700 }}>
          ▶ Stream<span style={{ color: "#a970ff" }}>Live</span>
        </div>
      </div>
    ),
    size,
  );
}
