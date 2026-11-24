import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    jsx(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      // 组件范围用通配整体纳入，不逐目录列举；与 tsconfig.build.json 的 include 是同一份范围，调整时两处同步。
      include: [
        'packages/cool-design/index.ts',
        'packages/cool-design/hooks.ts',
        'packages/cool-design/*/**/*.{ts,tsx}',
        'packages/hooks/**/*.ts',
        'src/utils/create.ts',
        'src/utils/with-install.ts',
        'src/utils/overlay-stack.ts',
        'src/utils/use-floating.ts'
      ],
      exclude: ['**/__test__/**'],
      outDir: 'es'
    })
  ],
  build: {
    lib: {
      entry: {
        'packages/cool-design/index': 'packages/cool-design/index.ts',
        'packages/cool-design/hooks': 'packages/cool-design/hooks.ts',
        ...Object.fromEntries(readdirSync('packages/cool-design').sort()
          .map((name) => 'packages/cool-design/' + name + '/index')
          .filter((entry) => existsSync(entry + '.ts'))
          .map((entry) => [entry, entry + '.ts']))
      }
    },
    rollupOptions: {
      // 运行时依赖保持外部引用，不打包进产物。
      external: (id: string) =>
        id === 'vue' || id === 'dayjs' || id.startsWith('dayjs/') || id === 'async-validator' ||
        id === '@ctrl/tinycolor' || id === '@popperjs/core',
      output: [
        {
          format: 'es',
          dir: 'es',
          preserveModules: true,
          entryFileNames: '[name].js',
          assetFileNames: '[name][extname]'
        },
        {
          format: 'cjs',
          dir: 'lib',
          preserveModules: true,
          entryFileNames: '[name].cjs',
          exports: 'named',
          assetFileNames: '[name][extname]'
        }
      ]
    }
  }
});
