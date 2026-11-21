import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import MessageBox, { MessageBoxComponent, useMessageBox } from '..';
import ConfigProvider from '../../config-provider';
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  document.body.innerHTML = '';
});
test('异步确认失败保留窗口和错误，处理中禁止重复确认与关闭，重试成功', async () => {
  let reject!: (reason: Error) => void;
  const beforeConfirm = vi
    .fn()
    .mockImplementationOnce(() => new Promise((_, fail) => (reject = fail)))
    .mockResolvedValueOnce(true);
  const w = mount(MessageBoxComponent, {
    props: { modelValue: true, title: '删除用户', message: '<b>不可恢复</b>', beforeConfirm },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(w.text()).toContain('<b>不可恢复</b>');
  expect(w.find('b').exists()).toBe(false);
  await w.get('[data-message-box-confirm]').trigger('click');
  await w.get('[data-message-box-confirm]').trigger('click');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  expect(beforeConfirm).toHaveBeenCalledTimes(1);
  expect(w.emitted('cancel')).toBeUndefined();
  reject(new Error('删除失败，请重试'));
  await flushPromises();
  expect(w.get('[role="alert"]').text()).toBe('删除失败，请重试');
  expect(w.emitted('confirm')).toBeUndefined();
  await w.get('[data-message-box-confirm]').trigger('click');
  await flushPromises();
  expect(w.emitted('confirm')).toHaveLength(1);
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
});
test('函数确认与取消都返回明确结果并独立卸载', async () => {
  const first = MessageBox.confirm('确认删除？', '删除确认');
  await flushPromises();
  document.querySelector<HTMLButtonElement>('[data-message-box-confirm]')!.click();
  await expect(first).resolves.toBe('confirm');
  expect(document.querySelector('.i-message-box')).toBeNull();
  const second = MessageBox.confirm('确认删除？', undefined, { distinguishCancelAndClose: true });
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await expect(second).rejects.toBe('close');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});
test('Escape 等待 MessageBox 的关闭许可，并保留 Provider 过渡', async () => {
  let finish!: () => void;
  const events: string[] = [];
  const open = ref(true);
  const w = mount(ConfigProvider, {
    attachTo: document.body,
    global: { stubs: { transition: false } },
    props: { dialog: { transition: { css: false, onBeforeLeave: () => events.push('leave') } } },
    slots: { default: () => h(MessageBoxComponent, {
      modelValue: open.value,
      beforeClose: (action, _instance, done) => { events.push(action); finish = done; },
      onClose: () => events.push('close-event'),
      'onUpdate:modelValue': (value: boolean) => { open.value = value; }
    }) }
  });
  wrappers.push(w);
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  expect(events).toEqual(['close']);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  finish();
  await flushPromises();
  expect(events).toEqual(['close', 'close-event', 'leave']);
  expect(document.querySelector('.i-message-box')).toBeNull();
});
test('移除 Provider 过渡立即释放已关闭 MessageBox 的遮罩、焦点与滚动锁', async () => {
  let finishLeave!: () => void;
  const afterLeave = vi.fn();
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const open = ref(true);
  const w = mount(ConfigProvider, {
    attachTo: document.body,
    global: { stubs: { transition: false } },
    props: { dialog: { transition: {
      css: false,
      onLeave: (_: Element, done: () => void) => { finishLeave = done; },
      onAfterLeave: [afterLeave]
    } } },
    slots: { default: () => h(MessageBoxComponent, {
      modelValue: open.value,
      'onUpdate:modelValue': (value: boolean) => { open.value = value; }
    }) }
  });
  wrappers.push(w);
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  expect(open.value).toBe(false);
  expect(finishLeave).toBeTypeOf('function');
  expect(document.body.style.overflow).toBe('hidden');
  await w.setProps({ dialog: undefined });
  expect(document.querySelector('.i-message-box')).toBeNull();
  expect(document.querySelector<HTMLElement>('.i-dialog__mask')?.style.display).toBe('none');
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(trigger);
  finishLeave();
  expect(afterLeave).not.toHaveBeenCalled();
  expect(w.getComponent(MessageBoxComponent).emitted('close')).toHaveLength(1);
  expect(w.getComponent(MessageBoxComponent).emitted('update:modelValue')).toEqual([[false]]);
});
test('组合式调用继承响应式主题，调用者卸载取消并清理弹窗', async () => {
  let result: Promise<'confirm'> | undefined;
  const dark = ref(true);
  const Child = defineComponent({
    setup() {
      const box = useMessageBox();
      return () =>
        h(
          'button',
          {
            onClick: () => {
              result = box.confirm('确认操作？');
            }
          },
          '打开'
        );
    }
  });
  const w = mount(
    defineComponent({
      setup: () => () => h(ConfigProvider, { theme: dark.value ? 'dark' : 'light' }, () => h(Child))
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  const provider = document.querySelector('.i-message-box')!.closest('.i-config-provider')!;
  expect(provider.getAttribute('data-theme')).toBe('dark');
  dark.value = false;
  await flushPromises();
  expect(provider.getAttribute('data-theme')).toBe('light');
  // 提前附加原生捕获，避免拒绝发生在断言附加之前被判定为未处理
  result?.catch(() => {});
  const assertion = expect(result).rejects.toBe('cancel');
  w.unmount();
  wrappers.pop();
  await assertion;
  expect(document.querySelector('.i-message-box')).toBeNull();
});

test('支持消息类型样式', async () => {
  const w = mount(MessageBoxComponent, {
    props: { modelValue: true, type: 'error', message: '失败' },
    attachTo: document.body
  });
  await flushPromises();
  expect(document.querySelector('.i-message-box--error')).not.toBeNull();
  w.unmount();
});

test('MessageBox 可直接调用并支持 close() 关闭全部', async () => {
  const first = MessageBox({ message: '第一个', title: '直接调用' });
  const second = MessageBox.alert('第二个', '直接调用');
  await flushPromises();
  expect(document.querySelectorAll('.i-message-box').length).toBe(2);
  MessageBox.close();
  await expect(first).rejects.toBe('cancel');
  await expect(second).rejects.toBe('cancel');
  expect(document.querySelector('.i-message-box')).toBeNull();
});
