import { siteConfig } from "@/lib/config";
import { THEME } from "@/lib/constants/theme";

/** Initials from the configured business name, e.g. "Demo Realty Jaipur" → "DR". */
export function brandInitials(): string {
  return (
    siteConfig.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "RE"
  );
}

/** JSX for next/og ImageResponse icons (app/icon.tsx, app/apple-icon.tsx). */
export function BrandMarkImage({ size, radius }: { size: number; radius: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME.brand600,
        color: THEME.gold300,
        borderRadius: radius,
        fontSize: size * 0.46,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      {brandInitials()}
    </div>
  );
}
