import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4ECDD",
        }}
      >
        <svg width="132" height="88" viewBox="0 0 48 32" fill="none">
          <rect
            x="1.75"
            y="1.75"
            width="44.5"
            height="28.5"
            rx="14.25"
            stroke="#D94A26"
            strokeWidth="3.2"
          />
          <rect x="12" y="12.5" width="3.4" height="7" rx="1.7" fill="#D94A26" />
          <rect x="18.2" y="8.5" width="3.4" height="15" rx="1.7" fill="#D94A26" />
          <rect x="24.4" y="10.5" width="3.4" height="11" rx="1.7" fill="#D94A26" />
          <rect x="30.6" y="7" width="3.4" height="18" rx="1.7" fill="#D94A26" />
          <rect x="36.8" y="12.5" width="3.4" height="7" rx="1.7" fill="#D94A26" />
        </svg>
      </div>
    ),
    size
  );
}
