import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        vue(),
        jsx(),
        dts({
            tsconfigPath: "tsconfig.build.json",
            include: [
                "package/index.ts",
                "src/utils/create.ts",
                "src/utils/with-install.ts",
                "src/utils/overlay-stack.ts",
                "src/utils/use-floating.ts",
                "package/{button,button-group,row,col,config-provider,input,select,select-option,checkbox,switch,form,form-item,table,pagination,dialog,message,icon,space,divider,empty,loading,tag,tooltip,popconfirm,message-box,container,header,aside,main,footer,link}/**/*.{ts,tsx}"
            ],
            exclude: ["**/__test__/**"],
            outDir: "es"
        })
    ],
    build: {
        lib: { entry: "package/index.ts" },
        rollupOptions: {
            external: ["vue"],
            output: [
                {
                    format: "es",
                    dir: "es",
                    preserveModules: true,
                    entryFileNames: "[name].js",
                    assetFileNames: "[name][extname]"
                },
                {
                    format: "cjs",
                    dir: "lib",
                    preserveModules: true,
                    entryFileNames: "[name].cjs",
                    exports: "named",
                    assetFileNames: "[name][extname]"
                }
            ]
        }
    }
});
