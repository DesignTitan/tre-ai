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
          background: "#F4F1EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            border: "3px solid #1F4E5F",
            borderRadius: "50%",
            position: "absolute",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            width: 84,
            height: 84,
            border: "3px solid #1F4E5F",
            borderRadius: "50%",
            position: "absolute",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid #101418",
            borderRadius: "50%",
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <div
          style={{
            width: 18,
            height: 18,
            background: "#101418",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
