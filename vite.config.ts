import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [vue(), jsx()],
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
