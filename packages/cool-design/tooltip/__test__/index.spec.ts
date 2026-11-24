import { mount, flushPromises } from '@vue/test-utils';
import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import { idKey } from '../../../hooks/use-id';
import { namespaceKey } from '../../../hooks/use-namespace';
import Tooltip from '..';
const wrappers: ReturnType<typeof mount>[] = [];
const mockLayout = (anchorRect: () => DOMRect) => {
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
    return this === document.documentElement ? 1024 : 0;
  });
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return this === document.documentElement ? 768 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.getBoundingClientRect().width;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.getBoundingClientRect().height;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.parentElement?.classList.contains('i-tooltip__trigger')) return anchorRect();
    if (this.classList.contains('i-tooltip')) return new DOMRect(0, 0, 100, 40);
    if (this.classList.contains('i-tooltip__arrow')) return new DOMRect(0, 0, 8, 8);
    return new DOMRect();
  });
};

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
    props: { content: '<b>说明</b>', transition: { css: false } },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body,
    global: { stubs: { transition: false } }
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

test('插槽触发器保留显式 ID，持久面板的 ID 避开冲突并响应命名空间变化', async () => {
  const namespace = ref('brand');
  const triggerId = ref('brand-id-41-2-tooltip');
  const description = ref('caller-help');
  const onClick = vi.fn();
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'click', persistent: true, hideAfter: 0, transition: { css: false } },
    slots: { default: () => h('button', {
      id: triggerId.value, title: '原始标题', class: 'caller', style: { color: 'red' },
      'aria-describedby': description.value, onClick
    }, '打开') },
    attachTo: document.body,
    global: { provide: { [idKey]: { prefix: 41, current: 2 }, [namespaceKey]: namespace }, stubs: { transition: false } }
  });
  wrappers.push(w);
  const button = w.get<HTMLButtonElement>('button');
  const panel = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  const assertDescription = (id: string) => {
    expect(panel.id).toBe(id);
    expect(document.getElementById(id)).toBe(panel);
    expect(button.attributes('aria-describedby')).toBe(`${description.value} ${id}`);
  };
  expect(button.attributes('aria-describedby')).toBe('caller-help');
  button.element.focus();
  await button.trigger('click');
  assertDescription('brand-id-41-2-tooltip-fallback');
  expect(button.attributes('id')).toBe(triggerId.value);
  expect(button.attributes('title')).toBe('原始标题');
  expect(button.classes()).toContain('caller');
  expect(button.element.style.color).toBe('red');
  expect(onClick).toHaveBeenCalledTimes(1);
  triggerId.value = 'caller-target';
  await flushPromises();
  assertDescription('brand-id-41-2-tooltip');
  const help = document.createElement('span');
  help.id = 'brand-id-41-2-tooltip';
  document.body.append(help);
  description.value = `caller-help ${help.id}`;
  await nextTick();
  assertDescription('brand-id-41-2-tooltip-fallback');
  expect(document.getElementById(help.id)).toBe(help);
  namespace.value = 'other';
  await nextTick();
  assertDescription('other-id-41-2-tooltip');
  expect(document.activeElement).toBe(button.element);
  await button.trigger('click');
  expect(button.attributes('aria-describedby')).toBe(description.value);
  expect(panel.getAttribute('aria-hidden')).toBe('true');
});

test('虚拟引用更换锚点或 ID 时，只清理当前浮层添加的说明引用', async () => {
  const namespace = ref('i');
  const first = document.createElement('button');
  const second = document.createElement('button');
  first.id = 'i-id-43-0-tooltip';
  first.setAttribute('aria-describedby', 'first-help');
  second.setAttribute('aria-describedby', 'second-help');
  document.body.append(first, second);
  const w = mount(Tooltip, {
    props: { content: '说明', visible: true, persistent: true, virtualTriggering: true, virtualRef: first },
    attachTo: document.body,
    global: { provide: { [idKey]: { prefix: 43, current: 0 }, [namespaceKey]: namespace }, stubs: { transition: false } }
  });
  wrappers.push(w);
  await flushPromises();
  const panel = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(panel.id).toBe('i-id-43-0-tooltip-fallback');
  expect(first.getAttribute('aria-describedby')).toBe(`first-help ${panel.id}`);
  first.id = 'caller-target';
  await flushPromises();
  expect(panel.id).toBe('i-id-43-0-tooltip');
  expect(first.getAttribute('aria-describedby')).toBe(`first-help ${panel.id}`);
  namespace.value = 'brand';
  await nextTick();
  const help = document.createElement('span');
  help.id = 'i-id-43-0-tooltip';
  document.body.append(help);
  second.setAttribute('aria-describedby', `second-help ${help.id}`);
  await w.setProps({ virtualRef: second });
  expect(first.getAttribute('aria-describedby')).toBe('first-help');
  namespace.value = 'i';
  await nextTick();
  expect(panel.id).toBe('i-id-43-0-tooltip-fallback');
  expect(document.getElementById(help.id)).toBe(help);
  expect(second.getAttribute('aria-describedby')).toBe(`second-help ${help.id} ${panel.id}`);
  await w.setProps({ visible: false });
  expect(second.getAttribute('aria-describedby')).toBe(`second-help ${help.id}`);
});

test('外部虚拟锚点在水合前已存在时，保留面板并更新冲突 ID', async () => {
  const id = 'i-id-123-0-tooltip';
  document.body.innerHTML = `
    <button id="${id}" aria-describedby="help">锚点</button><p id="help">帮助</p>
    <main><!--[--><!--teleport start--><!--teleport end--><!--]--></main>
    <aside id="host"><div id="${id}" class="i-tooltip i-tooltip--dark" role="tooltip" aria-hidden="true"
      style="position:absolute;visibility:hidden;display:none;" data-placement="bottom"><!----><div class="i-tooltip__content">说明</div></div><!--teleport anchor--></aside>`;
  const anchor = document.querySelector('button')!;
  const panel = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  const visible = ref(true);
  const onOpen = vi.fn();
  const onClose = vi.fn();
  const onVisibleChange = vi.fn();
  const app = createSSRApp({ setup: () => () => h(Tooltip, {
    appendTo: '#host', content: '说明', persistent: true, showArrow: false,
    transition: { css: false }, visible: visible.value, virtualTriggering: true, virtualRef: anchor,
    onOpen, onClose, onVisibleChange
  }) });
  app.provide(idKey, { prefix: 123, current: 0 });
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  app.mount('main');
  try {
    await flushPromises();
    expect(document.querySelector('[role="tooltip"]')).toBe(panel);
    expect(document.getElementById(id)).toBe(anchor);
    expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    expect(anchor.getAttribute('aria-describedby')).toBe('help ' + panel.id);
    expect(panel.getAttribute('aria-hidden')).toBeNull();
    expect(panel.style.display).not.toBe('none');
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(onVisibleChange.mock.calls).toEqual([[true]]);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    visible.value = false;
    await nextTick();
    expect(anchor.getAttribute('aria-describedby')).toBe('help');
    visible.value = true;
    await nextTick();
    expect(document.getElementById(panel.id)).toBe(panel);
    expect(anchor.getAttribute('aria-describedby')).toBe('help ' + panel.id);
  } finally {
    app.unmount();
  }
  expect(anchor.getAttribute('aria-describedby')).toBe('help');
});

test.each([
  { visible: true, appear: false, initial: ['open', 'visible:true'] },
  { visible: true, appear: true, initial: ['open', 'visible:true', 'before-show', 'appear', 'show'] },
  { visible: false, appear: false, initial: [] }
])('普通挂载保留虚拟浮层的进入过渡和事件（visible=$visible, appear=$appear）', async ({ visible, appear, initial }) => {
  document.body.innerHTML = '<button>锚点</button><main></main><aside id="host"></aside>';
  const anchor = document.querySelector('button')!;
  const open = ref(visible);
  const events: string[] = [];
  const app = createApp({ setup: () => () => h(Tooltip, {
    appendTo: '#host', content: '说明', persistent: true, visible: open.value,
    virtualTriggering: true, virtualRef: anchor,
    transition: { css: false, appear, onAppear: () => events.push('appear'), onEnter: () => events.push('enter') },
    onOpen: () => events.push('open'), onClose: () => events.push('close'),
    onVisibleChange: (value: boolean) => events.push(`visible:${value}`),
    onBeforeShow: () => events.push('before-show'), onShow: () => events.push('show'),
    onBeforeHide: () => events.push('before-hide'), onHide: () => events.push('hide')
  }) });
  app.mount('main');
  try {
    await nextTick();
    expect(events.splice(0)).toEqual(initial);
    if (visible) {
      open.value = false;
      await nextTick();
      expect(events.splice(0)).toEqual(['close', 'visible:false', 'before-hide', 'hide']);
    }
    open.value = true;
    await nextTick();
    expect(events).toEqual(['open', 'visible:true', 'before-show', 'enter', 'show']);
  } finally {
    app.unmount();
  }
});
test('视口顶部放不下时翻转，滚动更新坐标，卸载移除监听和 DOM', async () => {
  let anchorLeft = 100;
  mockLayout(() => new DOMRect(anchorLeft, 2, 60, 20));
  const remove = vi.spyOn(window, 'removeEventListener');
  const w = mount(Tooltip, {
    props: { content: '说明', placement: 'top', offset: 8, gpuAcceleration: false },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('focusin');
  await flushPromises();
  const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(tip.dataset.placement).toBe('bottom');
  expect(tip.style.top).toBe('30px');
  anchorLeft = 140;
  window.dispatchEvent(new Event('scroll'));
  await flushPromises();
  expect(tip.style.left).toBe('120px');
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
    props: { content: '说明', trigger: 'click', zIndex: 3000, transition: { css: false } },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body,
    global: { stubs: { transition: false } }
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
    props: { content: '说明', trigger: 'hover', hideAfter: 0, transition: { css: false } },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body,
    global: { stubs: { transition: false } }
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
  mockLayout(() => new DOMRect(300, 300, 60, 20));
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

test('支持数组触发方式，hover 与 click 均可打开', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: ['hover', 'click'], hideAfter: 0, transition: { css: false } },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body,
    global: { stubs: { transition: false } }
  });
  wrappers.push(w);
  await w.get('.i-tooltip__trigger').trigger('mouseenter');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  await w.get('.i-tooltip__trigger').trigger('mouseleave');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
});

test('persistent 保留隐藏后的浮层节点', async () => {
  const w = mount(Tooltip, {
    props: { content: '说明', trigger: 'click', persistent: true, hideAfter: 0 },
    slots: { default: () => h('button', '帮助') },
    attachTo: document.body
  });
  wrappers.push(w);
  const initial = document.querySelector<HTMLElement>('[role="tooltip"]');
  expect(initial?.style.display).toBe('none');
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  await w.get('button').trigger('click');
  await flushPromises();
  const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(tip).toBe(initial);
  expect(tip.style.display).toBe('none');
  expect(tip.getAttribute('aria-hidden')).toBe('true');
});
