import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  root: "doc",
  base: "./",
  plugins: [vue(), jsx()],
  server: { host: "127.0.0.1" },
  build: { outDir: "../dist/docs", emptyOutDir: true }
});
