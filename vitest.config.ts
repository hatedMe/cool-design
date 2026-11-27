import { defineConfig } from 'vitest/config';
import vitePluginVue from '@vitejs/plugin-vue';
import vitePluginJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.[jt]s?(x)', 'packages/hooks/**/*.spec.[jt]s?(x)', 'packages/cool-design/**/*.spec.[jt]s?(x)', 'examples/**/*.spec.[jt]s?(x)'],
    restoreMocks: true,
    // 限制并行的 jsdom 和模块转换任务，避免高核机器冷启动时挤占测试时间。
    maxThreads: 4,
    minThreads: 2,
    experimentalVmThreads: true
  },
  plugins: [vitePluginVue(), vitePluginJsx()]
});
