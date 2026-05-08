import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 188,
            height: 188,
            border: "4px solid #1F4E5F",
            borderRadius: "50%",
            position: "absolute",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            width: 120,
            height: 120,
            border: "4px solid #1F4E5F",
            borderRadius: "50%",
            position: "absolute",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            width: 64,
            height: 64,
            border: "4px solid #101418",
            borderRadius: "50%",
            position: "absolute",
          }}
        />
        <div
          style={{
            width: 26,
            height: 26,
            background: "#101418",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
