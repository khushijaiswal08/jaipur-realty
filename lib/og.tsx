import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";
import { THEME } from "@/lib/constants/theme";
import { brandInitials } from "@/lib/brand-mark";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  demo?: boolean;
}

/** Branded 1200×630 social card (SPEC §31). Text only — reliable for every listing, no photo fetches. */
export function ogImage({ eyebrow, title, subtitle, highlight, demo }: OgCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${THEME.brand900} 0%, ${THEME.brand600} 100%)`,
          borderBottom: `10px solid ${THEME.gold500}`,
          color: "#ffffff",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: THEME.gold500,
              color: THEME.brand900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {brandInitials()}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{siteConfig.name}</div>
          {demo ? (
            <div style={{ marginLeft: "auto", fontSize: 22, padding: "6px 16px", borderRadius: 999, border: "2px dashed #fbbf24", color: "#fbbf24" }}>DEMO</div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {eyebrow ? <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: THEME.gold300 }}>{eyebrow}</div> : null}
          <div style={{ fontSize: title.length > 60 ? 54 : 66, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 30, color: "#c9d3e1" }}>{subtitle}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {highlight ? <div style={{ fontSize: 44, fontWeight: 700 }}>{highlight}</div> : <div />}
          <div style={{ fontSize: 24, color: THEME.ink300 }}>{siteConfig.siteUrl.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
