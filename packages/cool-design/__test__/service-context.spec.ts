import { afterEach, expect, test } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { idKey, useId } from '../../hooks/use-id';
import CoolDesign, { ConfigProvider, ElMessage, ElMessageBox, Notify } from '..';

afterEach(() => {
  ElMessage.closeAll();
  Notify.closeAll();
  document.body.innerHTML = '';
});

test('全量和单独安装的服务分别使用所属应用的配置及最新层级', async () => {
  const base = ref(5000);
  const a = createApp({
    render: () => h(ConfigProvider, { zIndex: base.value, message: { showClose: true } })
  });
  const b = createApp({ render: () => h(ConfigProvider, { zIndex: 9000 }) });
  a.use(CoolDesign);
  b.use(ElMessage).use(Notify);
  a.mount(document.body.appendChild(document.createElement('div')));
  b.mount(document.body.appendChild(document.createElement('div')));
  let aMounted = true;
  try {
    (a.config.globalProperties.$message as typeof ElMessage).success({ message: 'A', duration: 0 });
    (b.config.globalProperties.$message as typeof ElMessage)({ message: 'B', duration: 0 });
    const messages = [...document.querySelectorAll<HTMLElement>('.i-message-container')];
    expect(messages).toHaveLength(2);
    expect(messages[0].querySelector('button')).not.toBeNull();
    expect(messages[1].querySelector('button')).toBeNull();
    expect(Number.parseInt(messages[1].style.top)).toBeGreaterThan(Number.parseInt(messages[0].style.top));
    expect(Number(messages[0].style.zIndex)).toBeGreaterThan(5000);
    expect(Number(messages[1].style.zIndex)).toBeGreaterThan(9000);

    base.value = 6000;
    await nextTick();
    const notify = a.config.globalProperties.$notify as typeof Notify;
    notify.success({ title: '新层级', duration: 0 });
    notify({ title: '应用 B', duration: 0 }, b._context);
    notify({ title: '无应用', duration: 0 }, null);
    const layers = [...document.querySelectorAll<HTMLElement>('.i-notification-container')]
      .map((node) => Number(node.style.zIndex));
    expect(layers[0]).toBeGreaterThan(6000);
    expect(layers[0]).toBeLessThan(9000);
    expect(layers[1]).toBeGreaterThan(9000);
    expect(layers[2]).toBeLessThan(6000);
    const aMessage = a.config.globalProperties.$message as typeof ElMessage;
    const bMessage = b.config.globalProperties.$message as typeof ElMessage;
    const group = { message: '重复文本', duration: 0, grouping: true };
    expect(aMessage(group)).toBe(aMessage(group));
    expect(bMessage(group)).not.toBe(aMessage(group));
    aMessage.closeAll();
    notify.closeAll();
    expect(document.querySelectorAll('.i-message-container')).toHaveLength(2);
    expect(document.querySelectorAll('.i-notification-container')).toHaveLength(2);
    a.unmount();
    aMounted = false;
    ElMessage({ message: '卸载后', duration: 0 }, a._context);
    const remaining = [...document.querySelectorAll<HTMLElement>('.i-message-container')];
    expect(Number(remaining.at(-1)?.style.zIndex)).toBeLessThan(5000);
  } finally {
    if (aMounted) a.unmount();
    b.unmount();
  }
});

test('同方位服务各自使用显式层级并在关闭后移除容器和重排', () => {
  const low = ElMessage({ message: '低', duration: 0, zIndex: 0, placement: 'bottom-right' });
  const first = document.querySelector<HTMLElement>('.i-message-container')!;
  Object.defineProperty(first, 'offsetHeight', { value: 24 });
  const high = ElMessage({ message: '高', duration: 0, zIndex: 7000, placement: 'bottom-right' });
  const messages = [...document.querySelectorAll<HTMLElement>('body > .i-message-container')];
  expect(messages.map((node) => node.style.zIndex)).toEqual(['0', '7000']);
  expect(messages[1].style.bottom).toBe('52px');
  low.close();
  expect(messages[1].style.bottom).toBe('20px');
  high.close();
  expect(document.querySelector('.i-message-container')).toBeNull();

  const notification = Notify({ title: '提示', duration: 0, zIndex: 0, position: 'bottom-left' });
  expect(document.querySelector<HTMLElement>('body > .i-notification-container')?.style.zIndex).toBe('0');
  notification.close();
  expect(document.querySelector('.i-notification-container')).toBeNull();
});

test('并存服务各自生成可解析的 ID，保留应用后续控件的序号', async () => {
  const app = createApp(() => null);
  const state = { prefix: 13, current: 2 };
  app.provide(idKey, state);
  const host = document.body.appendChild(document.createElement('div'));
  app.mount(host);
  const pending = [null, null, app._context].map(context =>
    ElMessageBox.alert('内容', '标题', {}, context).catch(action => action));
  const text = ref('初始');
  const content = h({ setup() {
    const id = useId();
    return () => h('span', { id: id.value }, text.value);
  } });
  const handle = ElMessage({ message: content, duration: 0 }, app._context);
  try {
    await nextTick();
    const dialogs = [...document.querySelectorAll('[role=dialog]')];
    expect(dialogs).toHaveLength(3);
    const ids = dialogs.map(dialog => dialog.getAttribute('aria-describedby')!);
    expect(new Set(ids).size).toBe(3);
    dialogs.forEach((dialog, index) => expect(dialog.contains(document.getElementById(ids[index]))).toBe(true));
    expect(state.current).toBe(2);
    const node = content.el;
    expect(node?.textContent).toBe('初始');
    text.value = '更新';
    await nextTick();
    expect(content.el).toBe(node);
    expect(node?.textContent).toBe('更新');
  } finally {
    handle.close();
    ElMessageBox.close();
    await Promise.all(pending);
    app.unmount();
    host.remove();
  }
});
