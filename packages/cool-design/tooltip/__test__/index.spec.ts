import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Tooltip from '..';
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});
test('聚焦显示纯文本说明，Esc 隐藏并解除关联，禁用不显示', async () => {
  vi.useFakeTimers();
  const w = mount(Tooltip, {
    props: { content: '<b>说明</b>' },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('focusin');
  await flushPromises();
  const tip = document.querySelector('[role="tooltip"]')!;
  expect(tip.textContent).toBe('<b>说明</b>');
  expect(tip.querySelector('b')).toBeNull();
  expect(w.get('button').attributes('aria-describedby')).toBe(tip.id);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(w.get('button').attributes('aria-describedby')).toBeUndefined();
  await w.setProps({ disabled: true });
  await w.get('button').trigger('focusin');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
test('视口顶部放不下时翻转，滚动更新坐标，卸载移除监听和 DOM', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('i-tooltip__trigger')
      ? { x: 100, y: 2, left: 100, top: 2, right: 160, bottom: 22, width: 60, height: 20, toJSON() {} }
      : { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40, toJSON() {} };
  });
  const remove = vi.spyOn(window, 'removeEventListener');
  const w = mount(Tooltip, {
    props: { content: '说明', placement: 'top', offset: 8 },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('focusin');
  await flushPromises();
  const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(tip.dataset.placement).toBe('bottom');
  expect(tip.style.top).toBe('30px');
  window.dispatchEvent(new Event('scroll'));
  await flushPromises();
  expect(tip.style.left).toBe('80px');
  w.unmount();
  wrappers.pop();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(remove.mock.calls.some((call) => call[0] === 'scroll')).toBe(true);
});

test('支持 click 触发、延迟和浅色主题', async () => {
  vi.useFakeTimers();
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'click', showAfter: 20, effect: 'light' },
    slots: { default: () => h('span', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('span').trigger('click');
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  vi.advanceTimersByTime(20);
  await flushPromises();
  expect(document.querySelector('.i-tooltip--light')).not.toBeNull();
});

test('支持 contextmenu、raw content、箭头和自定义样式', async () => {
  const w = mount(Tooltip, {
    props: { content: '<b>说明</b>', rawContent: true, trigger: 'contextmenu', showArrow: true, popperClass: 'custom-tip', popperStyle: { color: 'red' } },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
  w.get('button').element.dispatchEvent(event);
  await flushPromises();
  expect(event.defaultPrevented).toBe(true);
  expect(document.querySelector('.custom-tip b')).not.toBeNull();
  expect(document.querySelector('.i-tooltip__arrow')).not.toBeNull();
});

test('自定义 z-index 的 Tooltip 仍可通过 Esc 关闭', async () => {
  vi.useFakeTimers();
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'click', zIndex: 3000 },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

test('click 模式被 Esc 关闭后可以再次打开', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'click' },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test('enterable 模式允许从触发元素移入浮层', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'hover', enterable: true },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('.i-tooltip__trigger').trigger('mouseenter');
  await flushPromises();
  const tip = document.querySelector<HTMLElement>('[role="tooltip"]');
  expect(tip).not.toBeNull();
  await w.get('button').trigger('mouseleave');
  await tip!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test('支持只提供 getBoundingClientRect 的虚拟触发器', async () => {
  const virtualRef = { getBoundingClientRect: () => ({ x: 100, y: 100, left: 100, top: 100, right: 160, bottom: 120, width: 60, height: 20, toJSON() {} }) as DOMRect };
  const w = mount(Tooltip, {
    props: { content: '说明', virtualTriggering: true, virtualRef, visible: true },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test('生命周期事件只在可见状态变化时触发一次', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'hover', hideAfter: 0 },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('.i-tooltip__trigger').trigger('mouseenter');
  await w.get('.i-tooltip__trigger').trigger('mouseenter');
  await flushPromises();
  expect(w.emitted('before-show')).toHaveLength(1);
  expect(w.emitted('show')).toHaveLength(1);
  await w.get('.i-tooltip__trigger').trigger('mouseleave');
  await w.get('.i-tooltip__trigger').trigger('mouseleave');
  await flushPromises();
  expect(w.emitted('before-hide')).toHaveLength(1);
  expect(w.emitted('hide')).toHaveLength(1);
});

test('虚拟触发的受控 Tooltip 不因外部点击关闭', async () => {
  const virtualRef = { getBoundingClientRect: () => ({ x: 100, y: 100, left: 100, top: 100, right: 160, bottom: 120, width: 60, height: 20, toJSON() {} }) as DOMRect };
  const w = mount(Tooltip, {
    props: { content: '说明', virtualTriggering: true, virtualRef, visible: true },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test('支持受控 visible 和实例 show/hide', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', visible: false },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  (w.vm as unknown as { show: () => void }).show();
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  await w.setProps({ visible: true });
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test.each([
  ['top-start', 'center', 'top'],
  ['top-end', 'center', 'top'],
  ['bottom-start', 'center', 'bottom'],
  ['bottom-end', 'center', 'bottom'],
  ['left-start', 'left', 'start'],
  ['left-end', 'left', 'end'],
  ['right-start', 'right', 'start'],
  ['right-end', 'right', 'end']
] as const)('支持 %s 对齐方向和箭头位置', async (placement, horizontal, vertical) => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('i-tooltip__trigger')
      ? { x: 300, y: 300, left: 300, top: 300, right: 360, bottom: 320, width: 60, height: 20, toJSON() {} }
      : { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40, toJSON() {} };
  });
  const w = mount(Tooltip, {
    props: { content: '说明', placement, showArrow: true, offset: 12 },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('focusin');
  await flushPromises();
  const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  const arrow = tip.querySelector<HTMLElement>('.i-tooltip__arrow')!;
  expect(tip.dataset.placement).toBe(placement);
  expect(arrow.dataset.horizontal).toBe(horizontal);
  expect(arrow.dataset.vertical).toBe(vertical);
});
