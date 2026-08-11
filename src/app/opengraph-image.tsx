import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.name} - developer, student, engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gruvbox (dark) — matches the site theme.
const C = {
  bg: "#1d2021",
  surface: "#282828",
  border: "#3c3836",
  ink: "#ebdbb2",
  muted: "#a89984",
  faint: "#7c6f64",
  accent: "#fabd2f",
  accentStrong: "#fe8019",
};

const rocket = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="7" fill="${C.bg}"/><path d="M16 25c-1.9 0-3.4-2.2-3.4-4.1 0-1.2 1.5-2.3 3.4-2.3s3.4 1.1 3.4 2.3C19.4 22.8 17.9 25 16 25z" fill="${C.accentStrong}"/><path d="M16 23.6c-1 0-1.8-1.3-1.8-2.4 0-.7.8-1.3 1.8-1.3s1.8.6 1.8 1.3c0 1.1-.8 2.4-1.8 2.4z" fill="${C.accent}"/><path d="M16 5c3 2.4 4.6 6 4.6 9.9v3.7l-2.2 1.8h-4.8l-2.2-1.8v-3.7C11.4 11 13 7.4 16 5z" fill="${C.ink}"/><path d="M11.4 15.6l-2.6 2.6v-4.1l2.6-1.5v3z" fill="${C.accentStrong}"/><path d="M20.6 15.6l2.6 2.6v-4.1l-2.6-1.5v3z" fill="${C.accentStrong}"/><circle cx="16" cy="12.3" r="1.9" fill="#076678"/></svg>`;

export default async function OgImage() {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: C.bg,
          backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          fontFamily: "monospace",
          color: C.ink,
        }}
      >
        {/* top: prompt + rocket */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, color: C.faint }}>
            <span style={{ color: C.accentStrong }}>$</span>
            <span style={{ marginLeft: 14 }}>whoami</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={112}
            height={112}
            alt=""
            src={`data:image/svg+xml;utf8,${encodeURIComponent(rocket)}`}
          />
        </div>

        {/* middle: name + headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontFamily: "sans-serif",
            }}
          >
            <span style={{ color: C.ink }}>{first}</span>
            <span style={{ color: C.muted }}>{last}</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              color: C.muted,
              fontFamily: "sans-serif",
            }}
          >
            {profile.headline.trim()}
          </div>
        </div>

        {/* bottom: url + tags */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <span style={{ color: C.accent }}>{profile.url.replace("https://", "")}</span>
          <div style={{ display: "flex", gap: 16, color: C.faint }}>
            {["Next.js", "TypeScript", "Canvas"].map((t) => (
              <span
                key={t}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  borderRadius: 8,
                  padding: "6px 16px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
