import { defineConfig } from 'vitest/config';
import vitePluginVue from '@vitejs/plugin-vue';
import vitePluginJsx from '@vitejs/plugin-vue-jsx';


export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.[jt]s?(x)' , "test/**/*.spec.[jt]s?(x)"],
    restoreMocks: true,
    experimentalVmThreads: true
  },
  plugins: [vitePluginVue(), vitePluginJsx()],
});