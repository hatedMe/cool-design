import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Popconfirm from '..';
import Dialog from '../../dialog';
import ConfigProvider from '../../config-provider';
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  vi.useRealTimers();
  document.body.innerHTML = '';
});
test('确认只触发一次，外部点击视为取消并支持受控关闭', async () => {
  const w = mount(Popconfirm, {
    props: { title: '删除用户？' },
    slots: { default: () => h('button', '删除') },
    attachTo: document.body
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
          h(Dialog, { modelValue: open.value, 'onUpdate:modelValue': (v: boolean) => (open.value = v) }, () =>
            h(Popconfirm, { title: '确认删除？' }, () => h('button', { id: 'delete-trigger' }, '删除'))
          )
        )
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  await flushPromises();
  const trigger = document.querySelector<HTMLButtonElement>('#delete-trigger')!;
  trigger.focus();
  trigger.click();
  await flushPromises();
  expect(document.querySelector('.i-overlay-host .i-popconfirm')).not.toBeNull();
  expect(document.activeElement?.textContent).toBe('取消');
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
        h(Popconfirm, { modelValue: open.value, 'onUpdate:modelValue': (value: boolean) => (open.value = value) }, () =>
          h('button', { id: 'controlled-trigger' }, '删除')
        )
    }),
    { attachTo: document.body }
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
          h(Dialog, { modelValue: open.value, 'onUpdate:modelValue': (value: boolean) => (open.value = value) }, () =>
            h(Popconfirm, { title: '确认？' }, () => h('button', { id: 'mask-trigger' }, '删除'))
          )
        )
    }),
    { attachTo: document.body }
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
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get('button').trigger('click');
  await flushPromises();
  const panel = document.querySelector<HTMLElement>('.i-popconfirm')!;
  expect(panel.querySelector('span')).toBeNull();
  expect(panel.style.width).toBe('280px');
});

test('支持 reference 触发器、图标插槽与深色主题', async () => {
  const w = mount(Popconfirm, {
    props: { title: '删除？', effect: 'dark', iconColor: 'red' },
    slots: { reference: () => h('button', '删除'), icon: () => h('em', { class: 'custom-icon' }, '!') },
    attachTo: document.body
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
    attachTo: document.body
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
    props: { title: '删除？' },
    slots: {
      default: () => h('button', '删除'),
      actions: (actionsScope: PopconfirmActionsScope) => {
        scope = actionsScope;
        return h('button', { class: 'custom-action' }, '知道了');
      }
    },
    attachTo: document.body
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
    props: { hideAfter: 100, persistent: true },
    slots: { default: () => h('button', '删除') },
    attachTo: document.body
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
