import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Drawer from '..';

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
    props: { modelValue: true, destroyOnClose: true },
    slots: { default: () => h('p', '销毁') }
  });
  await flushPromises();
  expect(document.querySelector('.i-drawer')).not.toBeNull();
  await w2.setProps({ modelValue: false });
  await nextTick();
  expect(document.querySelector('.i-drawer')).toBeNull();
  w2.unmount();
});

test('beforeClose 可拦截，生命周期与 handleClose 符合 Dialog 语义', async () => {
  let done!: () => void;
  const w = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, beforeClose: (d: () => void) => (done = d), openDelay: 0, closeDelay: 0 },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(w.emitted('open')).toHaveLength(1);
  expect(w.emitted('opened')).toHaveLength(1);
  expect(w.emitted('open-auto-focus')).toHaveLength(1);
  (w.vm as unknown as { handleClose: () => void }).handleClose();
  expect(w.emitted('close')).toHaveLength(1);
  expect(w.emitted('update:modelValue')).toBeUndefined();
  done();
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
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
  expect((host.querySelector('.i-drawer__wrapper') as HTMLElement).style.display).toBe('none');
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
