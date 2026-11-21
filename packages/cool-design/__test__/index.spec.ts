import { createApp, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { version as packageVersion } from '../../../package.json';
import UI, * as components from '../index';

describe('公开入口', () => {
  test('根入口提供可调用的消息确认框服务，安装时注册声明式组件', async () => {
    const result = components.MessageBox.confirm('确认提交');
    await flushPromises();
    document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
    await expect(result).resolves.toBe('confirm');
    await flushPromises();
    const app = createApp({});
    app.use(UI);
    expect(app.component('i-message-box')).toBe(components.MessageBoxComponent);
    const wrapper = mount(components.MessageBox, {
      props: { modelValue: true, message: '声明式仍可用' }, attachTo: document.body
    });
    await flushPromises();
    expect(document.body.querySelector('.i-message-box')?.textContent).toContain('声明式仍可用');
    wrapper.unmount();
    const callableResult = components.ElMessageBox({ message: '函数调用仍可用' });
    const rejected = expect(callableResult).rejects.toBe('cancel');
    components.ElMessageBox.close();
    await rejected;
    await flushPromises();
  });
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
