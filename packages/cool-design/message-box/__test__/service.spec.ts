import { flushPromises } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, ref } from 'vue';
import ConfigProvider from '../../config-provider';
import { getAppConfig } from '../../config-provider/context';
import MessageBox, { useMessageBox, type MessageBoxAction, type MessageBoxInstance } from '..';

afterEach(() => {
  document.body.innerHTML = '';
});

test('alert 确认 resolve，关闭 reject close', async () => {
  const p = MessageBox.alert('内容', '标题');
  await flushPromises();
  expect(document.querySelector('.i-message-box')).not.toBeNull();
  // alert 默认无取消按钮
  expect(document.querySelector('[data-message-box-cancel]')).toBeNull();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await expect(p).resolves.toBe('confirm');
  expect(document.querySelector('.i-message-box')).toBeNull();

  const p2 = MessageBox.alert('内容', '标题');
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  // 默认不区分 cancel/close，关闭归并为 cancel
  await expect(p2).rejects.toBe('cancel');
});

test('distinguishCancelAndClose 区分 cancel 与 close', async () => {
  const p1 = MessageBox.confirm('确定吗？', '确认');
  await flushPromises();
  document.querySelector<HTMLButtonElement>('[data-message-box-cancel]')!.click();
  await expect(p1).rejects.toBe('cancel');

  const p2 = MessageBox.confirm('确定吗？', '确认');
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await expect(p2).rejects.toBe('cancel');

  const p3 = MessageBox.confirm('确定吗？', '确认', { distinguishCancelAndClose: true });
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await expect(p3).rejects.toBe('close');
});

test('prompt 返回输入值并校验', async () => {
  const p = MessageBox.prompt('请输入名字', '提示', { inputValue: '初始' });
  await flushPromises();
  const input = document.querySelector('.i-message-box input') as HTMLInputElement;
  expect(input).not.toBeNull();
  expect(input.value).toBe('初始');
  input.value = '小明';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await flushPromises();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await expect(p).resolves.toEqual({ value: '小明', action: 'confirm' });

  const p2 = MessageBox.prompt('请输入邮箱', '提示', {
    inputPattern: /@/,
    inputErrorMessage: '邮箱不合法'
  });
  await flushPromises();
  const input2 = document.querySelector('.i-message-box input') as HTMLInputElement;
  input2.value = '无效';
  input2.dispatchEvent(new Event('input', { bubbles: true }));
  await flushPromises();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await flushPromises();
  expect(document.querySelector('.i-message-box__error')!.textContent).toBe('邮箱不合法');
  expect(document.querySelector('.i-message-box')).not.toBeNull();
  // 修正后可确认
  input2.value = 'a@b.com';
  input2.dispatchEvent(new Event('input', { bubbles: true }));
  await flushPromises();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await expect(p2).resolves.toEqual({ value: 'a@b.com', action: 'confirm' });
});

test('支持 HTML、按钮与 beforeClose', async () => {
  const beforeClose = vi.fn((action: MessageBoxAction, instance: MessageBoxInstance, done: () => void) => {
    void action;
    void instance;
    done();
  });
  const p = MessageBox.confirm('<b>加粗</b>', '标题', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '好的',
    cancelButtonText: '算了',
    confirmButtonType: 'success',
    showCancelButton: true,
    center: true,
    beforeClose
  });
  await flushPromises();
  expect(document.querySelector('.i-message-box b')).not.toBeNull();
  expect(document.body.textContent).toContain('好的');
  expect(document.body.textContent).toContain('算了');
  expect(document.querySelector('.i-message-box.is-center')).not.toBeNull();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await expect(p).resolves.toBe('confirm');
  expect(beforeClose).toHaveBeenCalled();
  expect(beforeClose.mock.calls[0][0]).toBe('confirm');
});

test('局部消息框与应用服务分别继承配置，打开期间保留应用根配置', async () => {
  const namespace = ref('inner');
  let services!: ReturnType<typeof useMessageBox>;
  const Child = defineComponent({
    setup() {
      services = useMessageBox();
      return () => null;
    }
  });
  const app = createApp(() => h(ConfigProvider, { namespace: 'outer' }, () =>
    h(ConfigProvider, { namespace: namespace.value, size: 'small' }, () => h(Child))));
  const host = document.body.appendChild(document.createElement('div'));
  app.use(MessageBox).mount(host);
  const local = services.prompt('local').catch(action => action);
  const global = app.config.globalProperties.$alert('global').catch(() => {});
  try {
    await flushPromises();
    expect(getAppConfig(app._context)?.namespace).toBe('outer');
    const input = document.querySelector('.inner-message-box__input');
    expect(input).toBeTruthy();
    expect(document.querySelector('.outer-message-box')?.textContent).toContain('global');
    namespace.value = 'updated';
    await flushPromises();
    expect(document.querySelector('.updated-message-box__input')).toBe(input);
  } finally {
    MessageBox.close();
    await Promise.all([local, global]);
    app.unmount();
    host.remove();
  }
});

test('应用级消息框随根配置注册、替换和注销更新', async () => {
  const mounted = ref(false);
  const key = ref(0);
  const namespace = ref('first');
  const app = createApp(() => mounted.value ? h(ConfigProvider, { key: key.value, namespace: namespace.value }) : null);
  const other = createApp(() => h(ConfigProvider, { namespace: 'other' }));
  app.use(MessageBox).mount(document.createElement('div'));
  other.use(MessageBox).mount(document.createElement('div'));
  const pending = [
    app.config.globalProperties.$alert('已有').catch(() => {}),
    other.config.globalProperties.$alert('其他应用').catch(() => {})
  ];
  const messages = (ns: string) => Array.from(document.querySelectorAll(`.${ns}-message-box__message`), el => el.textContent);
  try {
    await flushPromises();
    expect(messages('i')).toEqual(['已有']);
    mounted.value = true;
    await flushPromises();
    expect(messages('first')).toEqual(['已有']);
    namespace.value = 'updated';
    await flushPromises();
    expect(messages('updated')).toEqual(['已有']);
    namespace.value = 'replacement';
    key.value++;
    await flushPromises();
    pending.push(app.config.globalProperties.$alert('新开').catch(() => {}));
    await flushPromises();
    expect(messages('replacement')).toEqual(['已有', '新开']);
    mounted.value = false;
    await flushPromises();
    expect(messages('i')).toEqual(['已有', '新开']);
    mounted.value = true;
    await flushPromises();
    expect(messages('replacement')).toEqual(['已有', '新开']);
    expect(messages('other')).toEqual(['其他应用']);
  } finally {
    MessageBox.close();
    await Promise.all(pending);
    app.unmount();
    other.unmount();
  }
});
