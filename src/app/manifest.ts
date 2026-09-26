import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Хайран — Азтай уут",
    short_name: "Хайран",
    description: "Хайран Юм · ол → захиал → ав. Улаанбаатар.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EF",
    theme_color: "#0B3D2E",
    lang: "mn",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
