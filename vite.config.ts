import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite que el servidor sea accesible desde fuera del contenedor
    port: 5173, // Puerto que estás exponiendo en el docker-compose
    watch: {
      usePolling: true, // Necesario para que Vite detecte cambios dentro del contenedor
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
})
