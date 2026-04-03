import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        define: {
          global: "globalThis",
        },
      },
    },
  },
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
