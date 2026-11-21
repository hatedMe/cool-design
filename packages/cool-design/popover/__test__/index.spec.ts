import { mount, flushPromises } from '@vue/test-utils';
import { h, nextTick } from 'vue';
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

test.each(['click', 'contextmenu'] as const)('虚拟 %s 触发器在点击外部后请求关闭', async (trigger) => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const requests: boolean[] = [];
  const w = mount(Popover, {
    props: {
      content: '说明', trigger, virtualTriggering: true, virtualRef: anchor,
      visible: false, hideAfter: 0,
      'onUpdate:visible': (value: boolean) => {
        requests.push(value);
        void w.setProps({ visible: value });
      }
    },
    attachTo: document.body
  });
  wrappers.push(w);
  anchor.dispatchEvent(new MouseEvent(trigger, { bubbles: true, cancelable: true }));
  await flushPromises();
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  await flushPromises();
  expect(requests).toEqual([true, false]);
  expect(panel()?.getAttribute('aria-hidden')).toBe('true');
});

test('默认保留隐藏节点，键盘触发后复用节点并返回真实 Popper 引用', async () => {
  const w = mount(Popover, {
    props: { content: '说明', trigger: 'click', hideAfter: 0 },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body
  });
  wrappers.push(w);
  const initial = panel();
  expect(initial?.style.display).toBe('none');
  expect(initial?.style.width).toBe('150px');
  const anchor = w.get('button').element;
  const key = new KeyboardEvent('keydown', { code: 'NumpadEnter', bubbles: true, cancelable: true });
  anchor.dispatchEvent(key);
  await flushPromises();
  expect(key.defaultPrevented).toBe(true);
  expect(panel()).toBe(initial);
  expect(initial?.style.display).not.toBe('none');
  const popper = w.vm.popperRef!;
  expect(popper.triggerRef).toBe(anchor);
  expect(popper.contentRef).toBe(initial);
  expect(popper.popperInstanceRef?.state.elements.popper).toBe(initial);
  const computeStyles = popper.popperInstanceRef?.state.orderedModifiers.find((modifier) => modifier.name === 'computeStyles');
  expect(computeStyles?.options?.gpuAcceleration).toBe(false);
  const instance = popper.popperInstanceRef;
  await w.setProps({ popperOptions: { modifiers: [{ name: 'computeStyles', options: { gpuAcceleration: true } }] } });
  await flushPromises();
  expect(popper.popperInstanceRef).toBe(instance);
  expect(instance?.state.orderedModifiers.find((modifier) => modifier.name === 'computeStyles')?.options?.gpuAcceleration).toBe(true);
});

test('默认插槽的 hide 即时请求关闭，离场完成才销毁并补发可见性事件', async () => {
  const order: string[] = [];
  let finishLeave: (() => void) | undefined;
  const w = mount(Popover, {
    props: {
      trigger: 'click',
      persistent: false,
      transition: {
        css: false,
        onEnter: (_, done) => { order.push('enter'); done(); },
        onLeave: (_, done) => { order.push('leave'); finishLeave = done; }
      },
      onBeforeEnter: () => order.push('before-enter'),
      onAfterEnter: () => order.push('after-enter'),
      onBeforeLeave: () => order.push('before-leave'),
      onAfterLeave: () => order.push('after-leave'),
      'onUpdate:visible': (value: boolean) => order.push(String(value))
    },
    slots: {
      reference: () => h('button', '查看'),
      default: (scope) => h('button', { id: 'hide', onClick: scope?.hide }, '关闭')
    },
    attachTo: document.body,
    global: { stubs: { transition: false } }
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(order).toEqual(['true', 'before-enter', 'enter', 'after-enter']);
  const initial = panel();
  const instance = w.vm.popperRef?.popperInstanceRef;
  expect(instance).toBeDefined();
  initial?.querySelector<HTMLButtonElement>('#hide')?.click();
  await nextTick();
  expect(order).toEqual(['true', 'before-enter', 'enter', 'after-enter', 'false', 'before-leave', 'leave']);
  expect(panel()).toBe(initial);
  expect(w.vm.popperRef?.popperInstanceRef).toBe(instance);
  finishLeave?.();
  await flushPromises();
  expect(order.slice(-2)).toEqual(['false', 'after-leave']);
  expect(panel()).toBeNull();
  expect(w.vm.popperRef?.popperInstanceRef).toBeUndefined();
});

test('虚拟锚点替换解绑旧键盘监听，并使用真实宿主及 modifier', async () => {
  const host = document.createElement('div');
  const first = document.createElement('button');
  const second = document.createElement('button');
  document.body.append(host, first, second);
  const w = mount(Popover, {
    props: {
      virtualTriggering: true, virtualRef: first, appendTo: host, content: '说明', trigger: 'click',
      triggerKeys: ['KeyK'], hideAfter: 0, arrowOffset: 17,
      popperOptions: { strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] }
    },
    attachTo: document.body,
    global: { stubs: { transition: false } }
  });
  wrappers.push(w);
  const press = (target: HTMLElement) => {
    const event = new KeyboardEvent('keydown', { code: 'KeyK', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
  expect(press(first)).toBe(true);
  await flushPromises();
  const initial = w.vm.popperRef?.popperInstanceRef;
  expect(initial?.state.elements.reference).toBe(first);
  expect(initial?.state.orderedModifiers.find((modifier) => modifier.name === 'arrow')?.options?.padding).toBe(17);
  expect(panel()?.parentElement).toBe(host);
  expect(panel()?.style.position).toBe('fixed');
  await w.setProps({ virtualRef: second, showArrow: false });
  await flushPromises();
  expect(w.vm.popperRef?.popperInstanceRef).not.toBe(initial);
  expect(w.vm.popperRef?.popperInstanceRef?.state.elements.reference).toBe(second);
  expect(panel()?.querySelector('.i-popover__arrow')).toBeNull();
  expect(press(first)).toBe(false);
  expect(press(second)).toBe(true);
});

test('click 触发显示标题与内容，生命周期事件按序触发', async () => {
  const w = mount(Popover, {
    props: { title: '标题', content: '补充说明', trigger: 'click', hideAfter: 0, transition: { css: false } },
    slots: { reference: () => h('button', '查看') },
    attachTo: document.body,
    global: { stubs: { transition: false } }
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
  expect(panel()?.style.display).toBe('none');
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
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
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
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
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
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
  await w.setProps({ disabled: true, trigger: 'click' });
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()?.style.display).toBe('none');
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
  expect(panel()?.style.display).not.toBe('none');
  await w.get('button').trigger('keydown', { code: 'Enter' });
  expect(w.emitted('update:visible')).toBeUndefined();
  w.vm.hide();
  await flushPromises();
  expect(w.emitted('update:visible')).toContainEqual([false]);
  expect(panel()?.style.display).not.toBe('none');
  await w.setProps({ visible: null, trigger: 'click' });
  await w.get('button').trigger('click');
  await flushPromises();
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(panel()?.style.display).toBe('none');
  await w.get('button').trigger('click');
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  vi.advanceTimersByTime(200);
  await flushPromises();
  expect(panel()?.style.display).toBe('none');
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
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
  const exposed = w.vm;
  expect(typeof exposed.updatePopper).toBe('function');
  expect(exposed.updatePopper).toBe(exposed.update);
  vi.advanceTimersByTime(150);
  await flushPromises();
  expect(panel()?.style.display).toBe('none');
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
  expect(panel()?.getAttribute('aria-hidden')).toBeNull();
  expect(['bottom', 'top', 'right']).toContain(panel()?.dataset.placement);
});
