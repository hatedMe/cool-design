import { createApp, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { version as packageVersion } from '../../../package.json';
import UI, * as components from '../index';

describe('公开入口', () => {
  test('全量安装和单独安装使用相同组件', () => {
    const app = createApp({});
    app.use(UI);
    expect(components.Button).toBeDefined();
    expect(app.component('i-button')).toBe(components.Button);
    expect(app.component('i-row')).toBe(components.Row);
    expect(app.component('i-col')).toBe(components.Col);
    expect(components.Rate).toBeDefined();
    expect(app.component('i-rate')).toBe(components.Rate);
    expect(UI.version).toBe(packageVersion);

    const container = document.createElement('div');
    const standalone = createApp({ render: () => h(components.Rate, { modelValue: 3 }) });
    standalone.use(components.Rate);
    expect(standalone.component('i-rate')).toBe(components.Rate);
    standalone.mount(container);
    expect(container.querySelector('[role="slider"]')).toBeTruthy();
    expect(container.querySelectorAll('.i-rate__item')).toHaveLength(5);
  });

  test('全量安装注册全局服务属性', () => {
    const app = createApp({});
    app.use(UI);
    const properties = app.config.globalProperties as Record<string, unknown>;
    expect(typeof properties.$message).toBe('function');
    expect(typeof properties.$notify).toBe('function');
    expect(typeof properties.$msgbox).toBe('function');
    expect(typeof properties.$alert).toBe('function');
    expect(typeof properties.$confirm).toBe('function');
    expect(typeof properties.$prompt).toBe('function');
    expect(typeof properties.$loading).toBe('function');

    // $message 携带应用上下文，可正常弹出并关闭。
    (properties.$message as (options: { message: string; duration: number }) => { close(): void })({
      message: '全局提示',
      duration: 0
    });
    expect(document.body.textContent).toContain('全局提示');
    (components.ElMessage.closeAll as () => void)();
    expect(document.body.textContent).not.toContain('全局提示');
  });
});
