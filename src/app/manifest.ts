import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "xale — Surprise Bag",
    short_name: "xale",
    description:
      "Surprise Bag: ол → захиал → ав. Улаанбаатар.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4EF",
    theme_color: "#0B3D2E",
    lang: "mn",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
