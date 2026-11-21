import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Drawer from '..';

const realTransition = { stubs: { transition: false } };

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

test('方向尺寸、遮罩关闭、ESC 与焦点恢复', async () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const w = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, title: '编辑', direction: 'ltr', size: 360 },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  const panel = document.querySelector('.i-drawer') as HTMLElement;
  expect(panel.classList.contains('is-ltr')).toBe(true);
  expect(panel.style.width).toBe('360px');
  expect(document.body.style.overflow).toBe('hidden');
  expect(panel.contains(document.activeElement)).toBe(true);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await vi.waitFor(() => expect(w.emitted('closed')).toHaveLength(1));
  expect(w.emitted('update:modelValue')?.[0]).toEqual([false]);
  await w.setProps({ modelValue: false });
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).toBe('');
  w.unmount();
});

test('支持 header/footer 插槽、自定义类与销毁关闭', async () => {
  const w = mount(Drawer, {
    attachTo: document.body,
    props: {
      modelValue: true,
      customClass: 'my-drawer',
      headerClass: 'my-header',
      bodyClass: 'my-body',
      footerClass: 'my-footer',
      modalClass: 'my-mask'
    },
    slots: {
      header: ({ titleId }: { titleId: string }) => h('div', { class: 'custom-header', id: titleId }, '定制头'),
      default: () => h('p', '正文'),
      footer: () => '脚注'
    }
  });
  await flushPromises();
  expect(document.querySelector('.i-drawer.my-drawer')).not.toBeNull();
  expect(document.querySelector('.custom-header')).not.toBeNull();
  expect(document.querySelector('.i-drawer__header.my-header')).not.toBeNull();
  expect(document.querySelector('.i-drawer__body.my-body')).not.toBeNull();
  expect(document.querySelector('.i-drawer__footer.my-footer')).not.toBeNull();
  expect(document.querySelector('.i-drawer__mask.my-mask')).not.toBeNull();
  w.unmount();

  const w2 = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, destroyOnClose: true },
    slots: { default: () => h('p', '销毁') }
  });
  await flushPromises();
  expect(document.querySelector('.i-drawer')).not.toBeNull();
  await w2.setProps({ modelValue: false });
  await vi.waitFor(() => expect(document.querySelector('.i-drawer')).toBeNull());
  w2.unmount();
});

test('beforeClose 可拦截，生命周期与 handleClose 符合 Dialog 语义', async () => {
  let done!: () => void;
  const w = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, beforeClose: (d: () => void) => (done = d), openDelay: 0, closeDelay: 0 },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(w.emitted('open')).toHaveLength(1);
  await vi.waitFor(() => expect(w.emitted('opened')).toHaveLength(1));
  expect(w.emitted('open-auto-focus')).toHaveLength(1);
  w.vm.handleClose();
  expect(w.emitted('close')).toBeUndefined();
  expect(w.emitted('update:modelValue')).toBeUndefined();
  done();
  await vi.waitFor(() => expect(w.emitted('update:modelValue')).toEqual([[false]]));
  await w.setProps({ modelValue: false });
  expect(w.emitted('closed')).toHaveLength(1);
  w.unmount();
});

test('支持无遮罩、自定义挂载、垂直方向与延迟开关', async () => {
  vi.useFakeTimers();
  const host = document.createElement('div');
  host.id = 'drawer-host';
  document.body.append(host);
  const w = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: false, modal: false, appendTo: '#drawer-host', direction: 'ttb', size: '40%', openDelay: 50, closeDelay: 30, lockScroll: false }
  });
  await w.setProps({ modelValue: true });
  expect(host.querySelector('.i-drawer')).toBeNull();
  vi.advanceTimersByTime(50);
  await flushPromises();
  const panel = host.querySelector('.i-drawer') as HTMLElement;
  expect(panel.classList.contains('is-ttb')).toBe(true);
  expect(panel.style.height).toBe('40%');
  expect(host.querySelector('.i-drawer__mask')).toBeNull();
  expect(host.querySelector('.i-drawer__wrapper')).not.toBeNull();
  expect(document.body.style.overflow).toBe('');
  await w.setProps({ modelValue: false });
  expect(host.querySelector('.i-drawer')).not.toBeNull();
  vi.advanceTimersByTime(30);
  await flushPromises();
  vi.useRealTimers();
  await vi.waitFor(() => expect((host.querySelector('.i-drawer__wrapper') as HTMLElement).style.display).toBe('none'));
  w.unmount();
});

test('可拖拽调整尺寸：鼠标拖拽、键盘、最小最大与事件', async () => {
  const w = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, direction: 'rtl', size: 360, resizable: { minSize: 200, maxSize: 500 } }
  });
  await flushPromises();
  const handle = document.querySelector('.i-drawer__resize-handle') as HTMLElement;
  expect(handle).not.toBeNull();
  expect(handle.getAttribute('role')).toBe('separator');
  expect(handle.getAttribute('aria-orientation')).toBe('vertical');
  expect(handle.getAttribute('aria-valuemin')).toBe('200');
  expect(handle.getAttribute('aria-valuemax')).toBe('500');
  // 鼠标向左拖 60px，宽度增至 420px。
  handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 500, button: 0 }));
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 440 }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await nextTick();
  expect((document.querySelector('.i-drawer') as HTMLElement).style.width).toBe('420px');
  expect(w.emitted('resize-start')).toHaveLength(1);
  expect(w.emitted('resize')?.[0]).toEqual([{ size: '420px' }]);
  expect(w.emitted('resize-end')).toHaveLength(1);
  // 键盘向右缩小 10px。
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  await nextTick();
  expect((document.querySelector('.i-drawer') as HTMLElement).style.width).toBe('410px');
  // Home 到最小，End 到最大，超出钳制。
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  await nextTick();
  expect((document.querySelector('.i-drawer') as HTMLElement).style.width).toBe('200px');
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  await nextTick();
  expect((document.querySelector('.i-drawer') as HTMLElement).style.width).toBe('500px');
  w.unmount();
});

test('无遮罩穿透、挂载目标与多实例滚动锁', async () => {
  const w = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, modal: false, modalPenetrable: true, appendToBody: true }
  });
  await flushPromises();
  const wrapper = document.querySelector('.i-drawer__wrapper') as HTMLElement;
  expect(wrapper.classList.contains('is-penetrable')).toBe(true);
  expect(document.body.querySelector('.i-drawer')).not.toBeNull();
  w.unmount();
  await flushPromises();

  const first = mount(Drawer, { attachTo: document.body, props: { modelValue: true } });
  await flushPromises();
  const second = mount(Drawer, { attachTo: document.body, props: { modelValue: true } });
  await flushPromises();
  expect(document.body.style.overflow).toBe('hidden');
  first.unmount();
  expect(document.body.style.overflow).toBe('hidden');
  second.unmount();
  expect(document.body.style.overflow).toBe('');
});

test('close-icon 支持字符串与组件，开关走过渡包装', async () => {
  const w = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, title: '编辑', closeIcon: '✕' },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(document.querySelector('.i-drawer__close')?.textContent).toBe('✕');
  await w.unmount();

  const CustomIcon = { render: () => h('span', { class: 'custom-close' }, '自定义') };
  const custom = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, title: '编辑', closeIcon: CustomIcon },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(document.querySelector('.i-drawer__close .custom-close')?.textContent).toBe('自定义');
  custom.unmount();
});

test('响应式关闭图标可换成另一个原始组件、函数或字符串且无代理警告', async () => {
  const icons = reactive<{ close: NonNullable<InstanceType<typeof Drawer>['$props']['closeIcon']> }>({
    close: { render: () => h('span', '原图标') }
  });
  const warn = vi.spyOn(console, 'warn');
  const wrapper = mount({ render: () => h(Drawer, { modelValue: true, closeIcon: icons.close }) }, {
    attachTo: document.body
  });
  try {
    const button = () => document.querySelector('.i-drawer__close');
    await flushPromises();
    expect(button()?.textContent).toBe('原图标');
    icons.close = { render: () => h('span', '替换后') };
    await nextTick();
    expect(button()?.textContent).toBe('替换后');
    icons.close = () => h('span', '函数图标');
    await nextTick();
    expect(button()?.textContent).toBe('函数图标');
    icons.close = '✕';
    await nextTick();
    expect(button()?.textContent).toBe('✕');
    expect(warn.mock.calls.flat().filter((message) => String(message).includes('made a reactive object'))).toEqual([]);
  } finally {
    wrapper.unmount();
    warn.mockRestore();
  }
});

test('公开关闭方法在实际离场后发出模型更新并销毁内容', async () => {
  const calls: string[] = [];
  const drawer = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: {
      modelValue: true,
      destroyOnClose: true,
      onOpen: () => calls.push('open'),
      onOpened: () => calls.push('opened'),
      onClose: () => calls.push('close'),
      onClosed: () => calls.push('closed'),
      'onUpdate:modelValue': () => calls.push('model')
    },
    slots: { default: () => h('button', '正文') }
  });
  try {
    await vi.waitFor(() => expect(calls).toEqual(['open', 'opened']));
    drawer.vm.handleClose();
    await nextTick();
    expect(calls).toEqual(['open', 'opened', 'close']);
    expect(document.querySelector('.i-drawer')?.textContent).toContain('正文');
    expect(document.body.style.overflow).toBe('hidden');
    await vi.waitFor(() => expect(calls).toEqual(['open', 'opened', 'close', 'closed', 'model']));
    expect(drawer.emitted('update:modelValue')).toEqual([[false]]);
    expect(document.querySelector('.i-drawer')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  } finally {
    drawer.unmount();
  }
});

test('关闭许可可取消，旧许可在模型改动与卸载后失效', async () => {
  const requests: ((cancel?: boolean) => void)[] = [];
  const update = vi.fn();
  const drawer = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, beforeClose: (done: () => void) => requests.push(done), 'onUpdate:modelValue': update }
  });
  try {
    await nextTick();
    drawer.vm.handleClose();
    requests[0](true);
    requests[0]();
    await nextTick();
    expect(drawer.emitted('close')).toBeUndefined();
    drawer.vm.handleClose();
    await drawer.setProps({ modelValue: false });
    await vi.waitFor(() => expect(drawer.emitted('closed')).toHaveLength(1));
    await drawer.setProps({ modelValue: true });
    requests[1]();
    await nextTick();
    expect(drawer.emitted('close')).toHaveLength(1);
    expect(drawer.emitted('update:modelValue')).toEqual([[false]]);
    drawer.vm.handleClose();
  } finally {
    drawer.unmount();
  }
  requests[2]();
  expect(update.mock.calls).toEqual([[false]]);
});

test('显式非 body 宿主优先于 append-to-body，后者仍可挂载至 body', async () => {
  const local = document.createElement('div');
  const custom = document.createElement('div');
  custom.id = 'drawer-custom';
  document.body.append(local, custom);
  const drawer = mount(Drawer, {
    attachTo: local,
    global: realTransition,
    props: { modelValue: true, appendTo: '#drawer-custom', appendToBody: true }
  });
  try {
    await nextTick();
    expect(custom.querySelector('.i-drawer')).not.toBeNull();
    await drawer.setProps({ appendTo: custom });
    expect(custom.querySelector('.i-drawer')).not.toBeNull();
    await drawer.setProps({ appendTo: 'body' });
    expect(document.querySelector('body > .i-drawer__mask')).not.toBeNull();
    await drawer.setProps({ appendToBody: false });
    expect(local.querySelector('.i-drawer')).not.toBeNull();
  } finally {
    drawer.unmount();
  }
});

test('初始设为打开时仍等待延迟，快速反向取消待执行的开关', async () => {
  vi.useFakeTimers();
  const drawer = mount(Drawer, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, openDelay: 100, closeDelay: 100, destroyOnClose: true }
  });
  try {
    expect(document.querySelector('.i-drawer')).toBeNull();
    await drawer.setProps({ modelValue: false });
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(drawer.emitted('open')).toBeUndefined();
    await drawer.setProps({ modelValue: true });
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(drawer.emitted('open')).toHaveLength(1);
    await drawer.setProps({ modelValue: false });
    await drawer.setProps({ modelValue: true });
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(drawer.emitted('close')).toBeUndefined();
    expect(document.querySelector('.i-drawer')).not.toBeNull();
  } finally {
    drawer.unmount();
  }
});
