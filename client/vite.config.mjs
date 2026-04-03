import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  oxc: {
    include: /src\/.*\.(js|jsx)$/,
    jsx: {
      runtime: "classic",
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
});
