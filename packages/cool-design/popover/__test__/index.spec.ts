import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Popover from '..';

const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const panel = () => document.querySelector<HTMLElement>('.i-popover');

test('click 触发显示标题与内容，生命周期事件按序触发', async () => {
  const w = mount(Popover, {
    props: { title: '标题', content: '补充说明', trigger: 'click', hideAfter: 0 },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()?.textContent).toContain('标题');
  expect(panel()?.textContent).toContain('补充说明');
  expect(w.emitted('before-enter')).toHaveLength(1);
  expect(w.emitted('show')).toHaveLength(1);
  expect(w.emitted('after-enter')).toHaveLength(1);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()).toBeNull();
  expect(w.emitted('before-leave')).toHaveLength(1);
  expect(w.emitted('hide')).toHaveLength(1);
  expect(w.emitted('after-leave')).toHaveLength(1);
});

test.each([
  ['hover', 'mouseenter'],
  ['focus', 'focusin']
] as const)('%s 触发可显示', async (trigger, event) => {
  const w = mount(Popover, {
    props: { content: '说明', trigger, hideAfter: 0 },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('.i-popover__trigger').trigger(event);
  await flushPromises();
  expect(panel()).not.toBeNull();
});

test('默认使用 hover 触发', async () => {
  const w = mount(Popover, {
    props: { content: '说明', hideAfter: 0 },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('.i-popover__trigger').trigger('mouseenter');
  await flushPromises();
  expect(panel()).not.toBeNull();
});

test('contextmenu 触发阻止默认行为，disabled 禁止显示', async () => {
  const w = mount(Popover, {
    props: { content: '说明', trigger: 'contextmenu' },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
  w.get('button').element.dispatchEvent(event);
  await flushPromises();
  expect(event.defaultPrevented).toBe(true);
  expect(panel()).not.toBeNull();
  await w.setProps({ disabled: true, trigger: 'click' });
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()).toBeNull();
});

test('受控 visible、外部点击与 Esc 关闭', async () => {
  vi.useFakeTimers();
  const w = mount(Popover, {
    props: { content: '说明', visible: false },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.setProps({ visible: true });
  await flushPromises();
  expect(panel()).not.toBeNull();
  (w.vm as unknown as { hide: () => void }).hide();
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(w.emitted('update:visible')).toContainEqual([false]);
  await w.setProps({ visible: null, trigger: 'click' });
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()).not.toBeNull();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(panel()).toBeNull();
  await w.get('button').trigger('click');
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(panel()).toBeNull();
});

test('支持默认插槽内容、宽度、定位与虚拟触发', async () => {
  const virtualRef = {
    getBoundingClientRect: () =>
      ({ x: 300, y: 300, left: 300, top: 300, right: 360, bottom: 320, width: 60, height: 20, toJSON() {} }) as DOMRect
  };
  const w = mount(Popover, {
    props: { placement: 'top', width: 240, virtualTriggering: true, virtualRef, visible: true },
    slots: { default: () => h('p', '虚拟内容') },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  const target = panel()!;
  expect(target.dataset.placement).toBe('top');
  expect(target.style.width).toBe('240px');
  expect(target.textContent).toContain('虚拟内容');
});

test('兼容旧用法：默认插槽为触发器，content 插槽为内容', async () => {
  const w = mount(Popover, {
    props: { trigger: 'click', hideAfter: 0 },
    slots: { default: () => h('button', '查看'), content: () => h('p', '插槽内容') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()?.textContent).toContain('插槽内容');
});

test('auto-close 打开后自动关闭，updatePopper 等价于 update', async () => {
  vi.useFakeTimers();
  const w = mount(Popover, {
    props: { content: '自动关闭', trigger: 'click', hideAfter: 0, autoClose: 100 },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()).not.toBeNull();
  const exposed = w.vm as unknown as { updatePopper: () => void; update: () => void };
  expect(typeof exposed.updatePopper).toBe('function');
  expect(exposed.updatePopper).toBe(exposed.update);
  vi.advanceTimersByTime(150);
  await flushPromises();
  expect(panel()).toBeNull();
  vi.useRealTimers();
});

test('fallback-placements 传入浮层候选位置', async () => {
  const w = mount(Popover, {
    props: { content: '说明', hideAfter: 0, placement: 'bottom', fallbackPlacements: ['top', 'right'] },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('.i-popover__trigger').trigger('mouseenter');
  await flushPromises();
  expect(panel()).not.toBeNull();
  expect(['bottom', 'top', 'right']).toContain(panel()?.dataset.placement);
});