import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
export default defineConfig({
  root: "examples",
  plugins: [vue(), jsx()],
  server: { host: "127.0.0.1" },
  build: { outDir: "../dist/examples", emptyOutDir: true }
});
