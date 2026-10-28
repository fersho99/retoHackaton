import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  // La tarjeta lee estos archivos desde el servidor
  outputFileTracingIncludes: {
    "/api/tarjeta": [
      "./assets/fonts/*.woff",
      "./public/data/cube.json",
      "./public/img/compartir-fondo.jpg",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
