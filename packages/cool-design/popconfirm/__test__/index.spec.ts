import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, KeepAlive, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Popconfirm, { type PopconfirmInstance } from '..';
import Dialog from '../../dialog';
import ConfigProvider from '../../config-provider';
const global = { stubs: { transition: false } };
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  vi.useRealTimers();
  document.body.innerHTML = '';
});
test('确认只触发一次，外部点击视为取消并支持受控关闭', async () => {
  const w = mount(Popconfirm, {
    props: { title: '删除用户？', hideAfter: 0, transition: { css: false } },
    slots: { default: () => h('button', '删除') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain('删除用户？');
  const confirm = document.querySelector<HTMLButtonElement>('[data-popconfirm-confirm]')!;
  confirm.click();
  confirm.click();
  await flushPromises();
  expect(w.emitted('confirm')).toHaveLength(1);
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  await w.get('button').trigger('click');
  await flushPromises();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  await flushPromises();
  expect(w.emitted('cancel')).toHaveLength(1);
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  await w.setProps({ modelValue: true });
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).not.toBeNull();
  await w.setProps({ modelValue: false });
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).toBeNull();
});
test('弹窗内气泡确认的 Esc 仅关最上层，焦点恢复且继承主题宿主', async () => {
  const open = ref(true);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(ConfigProvider, { theme: 'dark' }, () =>
          h(Dialog, { modelValue: open.value, transition: { css: false }, 'onUpdate:modelValue': (v: boolean) => (open.value = v) }, () =>
            h(Popconfirm, { title: '确认删除？', transition: { css: false } }, () => h('button', { id: 'delete-trigger' }, '删除'))
          )
        )
    }),
    { attachTo: document.body, global }
  );
  wrappers.push(w);
  await flushPromises();
  const trigger = document.querySelector<HTMLButtonElement>('#delete-trigger')!;
  trigger.focus();
  trigger.click();
  await flushPromises();
  expect(document.querySelector('.i-overlay-host .i-popconfirm')).not.toBeNull();
  expect(document.activeElement).toBe(document.querySelector('.i-popconfirm'));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  expect(open.value).toBe(true);
  expect(document.activeElement).toBe(trigger);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushPromises();
  expect(open.value).toBe(false);
});

test('受控气泡实际关闭后恢复焦点，确认取消和 Esc 均有效', async () => {
  const open = ref(false);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(Popconfirm, { modelValue: open.value, hideAfter: 0, transition: { css: false }, 'onUpdate:modelValue': (value: boolean) => (open.value = value) }, () =>
          h('button', { id: 'controlled-trigger' }, '删除')
        )
    }),
    { attachTo: document.body, global }
  );
  wrappers.push(w);
  const trigger = w.get('button').element as HTMLButtonElement;
  for (const action of ['escape', 'cancel', 'confirm']) {
    trigger.focus();
    trigger.click();
    await flushPromises();
    if (action === 'escape') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    else
      document
        .querySelector<HTMLButtonElement>(action === 'confirm' ? '[data-popconfirm-confirm]' : '.i-popconfirm button')!
        .click();
    await flushPromises();
    expect(open.value).toBe(false);
    expect(document.activeElement).toBe(trigger);
  }
});
test('同一次遮罩手势只关闭气泡，下一次才关闭底层弹窗', async () => {
  const open = ref(true);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(ConfigProvider, {}, () =>
          h(Dialog, { modelValue: open.value, transition: { css: false }, 'onUpdate:modelValue': (value: boolean) => (open.value = value) }, () =>
            h(Popconfirm, { title: '确认？', transition: { css: false } }, () => h('button', { id: 'mask-trigger' }, '删除'))
          )
        )
    }),
    { attachTo: document.body, global }
  );
  wrappers.push(w);
  await flushPromises();
  document.querySelector<HTMLButtonElement>('#mask-trigger')!.click();
  await flushPromises();
  const mask = document.querySelector('.i-dialog__mask')!;
  mask.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  await flushPromises();
  mask.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  expect(open.value).toBe(true);
  mask.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  mask.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  await flushPromises();
  expect(open.value).toBe(false);
});

test('支持按钮类型、隐藏图标和面板宽度', async () => {
  const w = mount(Popconfirm, {
    props: { hideIcon: true, width: 280, confirmButtonType: 'danger', cancelButtonType: 'plain' },
    slots: { default: () => h('button', '删除') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  const panel = document.querySelector<HTMLElement>('.i-popconfirm')!;
  expect(panel.querySelector('.i-popconfirm__icon')).toBeNull();
  expect(panel.style.width).toBe('280px');
});

test('支持 reference 触发器、图标插槽与深色主题', async () => {
  const w = mount(Popconfirm, {
    props: { title: '删除？', effect: 'dark', iconColor: 'red' },
    slots: { reference: () => h('button', '删除'), icon: () => h('em', { class: 'custom-icon' }, '!') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  const panel = document.querySelector('.i-popconfirm')!;
  expect(panel.classList.contains('i-popconfirm--dark')).toBe(true);
  expect(panel.querySelector('.custom-icon')).not.toBeNull();
});

test('支持自定义图标、actions 插槽与非 Teleport 渲染', async () => {
  const w = mount(Popconfirm, {
    props: { icon: 'icon-delete', iconColor: 'red', teleported: false },
    slots: { default: () => h('button', '删除'), actions: () => h('button', { class: 'custom-action' }, '知道了') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  const panel = w.get('.i-popconfirm');
  expect(panel.get('.i-icon').attributes('style')).toContain('red');
  expect(panel.find('.custom-action').exists()).toBe(true);
  expect(panel.find('[data-popconfirm-confirm]').exists()).toBe(false);
});

test('actions 插槽接收 confirm/cancel 作用域并可触发内部行为', async () => {
  interface PopconfirmActionsScope {
    confirm: (event?: MouseEvent) => void;
    cancel: (event?: MouseEvent) => void;
  }
  let scope: PopconfirmActionsScope | undefined;
  const w = mount(Popconfirm, {
    props: { title: '删除？', hideAfter: 0, transition: { css: false } },
    slots: {
      default: () => h('button', '删除'),
      actions: (actionsScope: PopconfirmActionsScope) => {
        scope = actionsScope;
        return h('button', { class: 'custom-action' }, '知道了');
      }
    },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(typeof scope?.confirm).toBe('function');
  expect(typeof scope?.cancel).toBe('function');
  scope?.confirm();
  await flushPromises();
  expect(w.emitted('confirm')).toHaveLength(1);
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  await w.get('button').trigger('click');
  await flushPromises();
  scope?.cancel();
  await flushPromises();
  expect(w.emitted('cancel')).toHaveLength(1);
  expect(document.querySelector('.i-popconfirm')).toBeNull();
});

test('hideAfter 确认后延迟自动关闭，persistent 保留隐藏节点', async () => {
  vi.useFakeTimers();
  const w = mount(Popconfirm, {
    props: { hideAfter: 100, persistent: true, transition: { css: false } },
    slots: { default: () => h('button', '删除') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).not.toBeNull();
  document.querySelector<HTMLButtonElement>('[data-popconfirm-confirm]')!.click();
  await flushPromises();
  expect(w.emitted('confirm')).toHaveLength(1);
  expect(w.emitted('cancel')).toBeUndefined();
  expect(document.querySelector('.i-popconfirm')).not.toBeNull();
  vi.advanceTimersByTime(100);
  await flushPromises();
  const kept = document.querySelector<HTMLElement>('.i-popconfirm')!;
  expect(kept.style.display).toBe('none');
  vi.useRealTimers();
});

test.each(['confirm', 'cancel'] as const)('默认 %s 先发送原始事件，经过 200ms 后请求关闭', async (action) => {
  vi.useFakeTimers();
  const history: unknown[] = [];
  const w = mount(Popconfirm, {
    props: {
      transition: { css: false },
      onConfirm: (event?: MouseEvent) => history.push(event),
      onCancel: (event?: MouseEvent) => history.push(event),
      'onUpdate:modelValue': (value: boolean) => history.push(value)
    },
    slots: { reference: () => h('button', '打开') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  const button = document.querySelector(action === 'confirm' ? '[data-popconfirm-confirm]' : '.i-popconfirm button')!;
  const event = new MouseEvent('click', { bubbles: true });
  button.dispatchEvent(event);
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(history).toEqual([true, event]);
  await vi.advanceTimersByTimeAsync(199);
  expect(history).toEqual([true, event]);
  await vi.advanceTimersByTimeAsync(1);
  expect(history).toEqual([true, event, false]);
  expect(document.querySelector('.i-popconfirm')).toBeNull();
});

test('键盘打开后面板可聚焦，公开 hide 走延时且暴露真实定位实例', async () => {
  vi.useFakeTimers();
  const host = document.createElement('aside');
  document.body.append(host);
  const w = mount(Popconfirm, {
    props: {
      appendTo: host,
      triggerKeys: ['KeyK'],
      showArrow: false,
      persistent: true,
      hideAfter: 40,
      popperOptions: { strategy: 'fixed' },
      transition: { css: false }
    },
    slots: { reference: () => h('button', '打开') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  const panel = host.querySelector<HTMLElement>('.i-popconfirm');
  expect(panel?.style.display).toBe('none');
  const trigger = w.get('button');
  (trigger.element as HTMLElement).focus();
  await trigger.trigger('keydown', { code: 'Enter', key: 'Enter' });
  expect(panel?.style.display).toBe('none');
  await trigger.trigger('keydown', { code: 'KeyK', key: 'k' });
  await flushPromises();
  expect(document.activeElement).toBe(panel);
  expect(panel?.querySelector('.i-tooltip__arrow')).toBeNull();
  const vm = w.vm as PopconfirmInstance;
  expect(vm.popperRef?.triggerRef).toBe(trigger.element);
  expect(vm.popperRef?.contentRef).toBe(panel);
  expect(vm.popperRef?.popperInstanceRef?.state.options.strategy).toBe('fixed');
  vm.hide();
  await vi.advanceTimersByTimeAsync(39);
  expect(w.emitted('update:modelValue')).toEqual([[true]]);
  await vi.advanceTimersByTimeAsync(1);
  expect(w.emitted('update:modelValue')).toEqual([[true], [false]]);
  expect(document.activeElement).toBe(trigger.element);
  expect(host.querySelector('.i-popconfirm')).toBe(panel);
  expect(panel?.style.display).toBe('none');
});

test('持久受控面板首次可见即聚焦，禁用时隐藏且恢复后仍按受控值显示', async () => {
  const w = mount(Popconfirm, {
    props: { modelValue: true, persistent: true, transition: { css: false } },
    slots: { reference: () => h('button', '打开') },
    attachTo: document.body,
    global
  });
  wrappers.push(w);
  await flushPromises();
  const panel = document.querySelector<HTMLElement>('.i-popconfirm');
  expect(document.activeElement).toBe(panel);
  await w.setProps({ disabled: true });
  expect(panel?.style.display).toBe('none');
  await w.get('button').trigger('click');
  expect(w.emitted('update:modelValue')).toBeUndefined();
  await w.setProps({ disabled: false });
  expect(panel?.style.display).toBe('');
  expect(document.activeElement).toBe(panel);
});

test.each(['confirm', 'cancel', 'hide'] as const)('单向 visible 忽略交互，%s 延时关闭后由父值变化重新接管', async (action) => {
  vi.useFakeTimers();
  const w = mount(Popconfirm, {
    props: { visible: true, transition: { css: false } },
    slots: { reference: () => h('button', '打开') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  const trigger = w.get('button');
  const panel = document.querySelector<HTMLElement>('.i-popconfirm');
  expect(trigger.attributes('aria-expanded')).toBe('true');
  expect(panel).not.toBeNull();
  await trigger.trigger('click');
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await flushPromises();
  expect(trigger.attributes('aria-expanded')).toBe('true');
  expect(w.emitted('cancel')).toBeUndefined();

  if (action === 'hide') (w.vm as PopconfirmInstance).hide();
  else {
    const button = panel!.querySelector(action === 'confirm' ? '[data-popconfirm-confirm]' : 'button')!;
    const event = new MouseEvent('click', { bubbles: true });
    button.dispatchEvent(event);
    expect(w.emitted(action)?.[0][0]).toBe(event);
  }
  await vi.advanceTimersByTimeAsync(199);
  expect(trigger.attributes('aria-expanded')).toBe('true');
  await vi.advanceTimersByTimeAsync(1);
  expect(trigger.attributes('aria-expanded')).toBe('false');
  expect(w.emitted('update:modelValue')).toBeUndefined();
  await trigger.trigger('click');
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await w.setProps({ visible: false });
  await w.setProps({ visible: true });
  expect(trigger.attributes('aria-expanded')).toBe('true');
});

test('双向 visible 等待父层接受打开与关闭，旧 modelValue 同时传入时优先', async () => {
  const visible = ref(false);
  const modelValue = ref<boolean>();
  const requests: boolean[] = [];
  const legacy: boolean[] = [];
  let accept = false;
  const w = mount(defineComponent({
    setup: () => () => h(Popconfirm, {
      visible: visible.value, modelValue: modelValue.value, hideAfter: 0, transition: { css: false },
      'onUpdate:visible': (value: boolean) => {
        requests.push(value);
        if (accept) visible.value = value;
      },
      'onUpdate:modelValue': (value: boolean) => legacy.push(value)
    }, { reference: () => h('button', '打开') })
  }), { attachTo: document.body, global });
  wrappers.push(w);
  const trigger = w.get('button');
  await trigger.trigger('click');
  expect(requests).toEqual([true]);
  expect(trigger.attributes('aria-expanded')).toBe('false');
  visible.value = true;
  await flushPromises();
  expect(trigger.attributes('aria-expanded')).toBe('true');
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  await flushPromises();
  expect(requests).toEqual([true, false]);
  expect(trigger.attributes('aria-expanded')).toBe('true');
  accept = true;
  await trigger.trigger('click');
  expect(visible.value).toBe(false);
  expect(trigger.attributes('aria-expanded')).toBe('false');
  expect(requests).toEqual([true, false, false]);
  expect(legacy).toEqual(requests);
  modelValue.value = true;
  await flushPromises();
  expect(trigger.attributes('aria-expanded')).toBe('true');
  visible.value = true;
  modelValue.value = false;
  await flushPromises();
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await trigger.trigger('click');
  expect(legacy.at(-1)).toBe(true);
  expect(trigger.attributes('aria-expanded')).toBe('false');
});

test('单向 visible 本地关闭后，重新启用按父值恢复显示', async () => {
  const w = mount(Popconfirm, {
    props: { visible: true, hideAfter: 0, transition: { css: false } },
    slots: { reference: () => h('button', '打开') },
    attachTo: document.body, global
  });
  wrappers.push(w);
  const trigger = w.get('button');
  expect(trigger.attributes('aria-expanded')).toBe('true');
  (w.vm as PopconfirmInstance).hide();
  await flushPromises();
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await w.setProps({ disabled: true });
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await w.setProps({ disabled: false });
  expect(trigger.attributes('aria-expanded')).toBe('true');
  expect(w.emitted('update:modelValue')).toBeUndefined();
});

test('单向 visible 在 KeepAlive 停用时关闭，激活后等待父值变化', async () => {
  const active = ref(true);
  const visible = ref(true);
  const updates = vi.fn();
  const child = defineComponent({
    setup: () => () => h(Popconfirm, {
      visible: visible.value, transition: { css: false }, 'onUpdate:modelValue': updates
    }, { reference: () => h('button', '打开') })
  });
  const w = mount(defineComponent({
    setup: () => () => h(KeepAlive, null, { default: () => active.value ? h(child) : h('div') })
  }), { attachTo: document.body, global });
  wrappers.push(w);
  expect(w.get('button').attributes('aria-expanded')).toBe('true');
  active.value = false;
  await flushPromises();
  expect(document.querySelector('.i-popconfirm')).toBeNull();
  active.value = true;
  await flushPromises();
  expect(w.get('button').attributes('aria-expanded')).toBe('false');
  visible.value = false;
  await flushPromises();
  visible.value = true;
  await flushPromises();
  expect(w.get('button').attributes('aria-expanded')).toBe('true');
  expect(updates).not.toHaveBeenCalled();
});
