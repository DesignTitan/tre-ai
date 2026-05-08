import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tre.ai — field rep tool",
    short_name: "tre.ai",
    description: "Land in any city. See the owners most likely thinking about an exit.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F1EC",
    theme_color: "#F4F1EC",
    categories: ["business", "productivity"],
  };
}
