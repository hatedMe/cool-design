import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
    plugins: [vue(), vitePluginJsx()],

    build: {
        rollupOptions: {
            external: ['vue'],
            input: "package/index.ts",
            output: [
                {
                    format: "es",
                    entryFileNames: "[name].mjs",
                    preserveModules: true,
                    dir: "es",
                },
                {
                    format: "cjs",
                    entryFileNames: "[name].js",
                    preserveModules: true,
                    dir: "lib",
                },
            ]
        },
        lib: {
            entry: "package/index.ts",
            name: "cool-design",
            fileName: (format) => `cool-design.${format}.js`,
            formats: ["es", "umd", "cjs"],
        },
    }
})