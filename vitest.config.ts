import { defineConfig } from 'vitest/config';
import vitePluginVue from '@vitejs/plugin-vue';
import vitePluginJsx from '@vitejs/plugin-vue-jsx';


export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.[jt]s?(x)' , "package/**/*.spec.[jt]s?(x)"],
    restoreMocks: true,
    experimentalVmThreads: true,
    transformMode: {
      web: [/.[tj]sx$/]
    }
  },
  plugins: [vitePluginVue(), vitePluginJsx()],
});