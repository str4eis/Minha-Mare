import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minha Maré",
    short_name: "Minha Maré",
    description: "Anote vendas e gastos da maré.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#7E22CE",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
