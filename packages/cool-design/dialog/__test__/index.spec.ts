import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Dialog, { type DialogInstance } from '../index';
import Message from '../../message/index';
import ConfigProvider from '../../config-provider';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

const immediateTransition = { name: 'test-dialog', css: false };
const realTransition = { stubs: { transition: false } };

test('初始打开与快速反向切换以实际可见阶段发出事件', async () => {
  vi.useFakeTimers();
  const w = mount(Dialog, {
    attachTo: document.body,
    global: realTransition,
    props: { modelValue: true, openDelay: 40, closeDelay: 30, transition: immediateTransition }
  });
  const vm = w.vm as unknown as DialogInstance;
  const advance = async (delay: number) => {
    vi.advanceTimersByTime(delay);
    await nextTick();
  };
  try {
    expect(w.find('[role="dialog"]').exists()).toBe(false);
    expect(w.emitted('open')).toBeUndefined();
    await advance(20);
    await w.setProps({ modelValue: false });
    await w.setProps({ modelValue: true });
    await advance(39);
    expect(vm.visible).toBe(false);
    await advance(1);
    expect(vm.visible).toBe(true);
    expect(w.emitted('open')).toHaveLength(1);
    expect(w.emitted('opened')).toHaveLength(1);
    await w.setProps({ modelValue: false });
    await advance(10);
    await w.setProps({ modelValue: true });
    await advance(60);
    expect(vm.visible).toBe(true);
    expect(w.emitted('close')).toBeUndefined();
    expect(w.emitted('open')).toHaveLength(1);
    await w.setProps({ modelValue: false });
    await advance(29);
    expect(vm.visible).toBe(true);
    await advance(1);
    expect(vm.visible).toBe(false);
    expect(w.emitted('close')).toHaveLength(1);
    expect(w.emitted('closed')).toHaveLength(1);
  } finally {
    w.unmount();
  }
});

test('beforeClose 可取消，过期和重复的 done 无法关闭新周期', async () => {
  const callbacks: Array<(cancel?: boolean) => void> = [];
  const w = mount(Dialog, {
    global: realTransition,
    props: { modelValue: true, closeDelay: 1000, transition: immediateTransition, beforeClose: (done) => { callbacks.push(done); } }
  });
  const vm = w.vm as unknown as DialogInstance;
  try {
    await nextTick();
    vm.handleClose();
    callbacks[0](true);
    callbacks[0]();
    await nextTick();
    expect(w.emitted('close')).toBeUndefined();
    vm.handleClose();
    await w.setProps({ modelValue: false });
    await w.setProps({ modelValue: true });
    callbacks[1]();
    await nextTick();
    expect(vm.visible).toBe(true);
    expect(w.emitted('update:modelValue')).toBeUndefined();
    vm.handleClose();
    callbacks[2]();
    callbacks[2]();
    await nextTick();
    expect(vm.visible).toBe(false);
    expect(w.emitted('update:modelValue')).toEqual([[false]]);
  } finally {
    w.unmount();
  }
});

test('离场取消后保留内容，销毁与关闭事件只由有效离场完成', async () => {
  const events: string[] = [];
  const leaves: Array<() => void> = [];
  const w = mount(Dialog, {
    global: realTransition,
    props: {
      modelValue: true,
      destroyOnClose: true,
      onClose: () => events.push('close'),
      onClosed: () => events.push('closed'),
      transition: {
        ...immediateTransition,
        onBeforeLeave: [() => events.push('before-1'), () => events.push('before-2')],
        onLeave: (_element: Element, done: () => void) => { leaves.push(done); },
        onLeaveCancelled: () => events.push('cancelled'),
        onAfterLeave: [() => events.push('after-1'), () => events.push('after-2')]
      }
    }
  });
  const vm = w.vm as unknown as DialogInstance;
  try {
    await nextTick();
    const content = vm.dialogContentRef;
    expect(content?.$el).toBe(w.get('.i-dialog').element);
    await w.setProps({ modelValue: false });
    expect(events).toEqual(['before-1', 'before-2', 'close']);
    expect(vm.dialogContentRef).toBe(content);
    await w.setProps({ modelValue: true });
    expect(events).toEqual(['before-1', 'before-2', 'close', 'cancelled']);
    await w.setProps({ modelValue: false });
    leaves[0]();
    expect(vm.dialogContentRef).toBe(content);
    leaves[1]();
    await nextTick();
    expect(events.slice(-3)).toEqual(['after-1', 'after-2', 'closed']);
    expect(vm.dialogContentRef).toBeUndefined();
  } finally {
    w.unmount();
  }
});

test.each(['prop', 'provider'])('父级通过 %s 重建等值过渡时仍等待本次离场', async (source) => {
  const open = ref(true);
  const counter = ref(0);
  const replace = ref(false);
  const events: string[] = [];
  let done!: () => void;
  const leave = (_element: Element, finish: () => void) => { done = finish; };
  const afterLeaveFirst = () => events.push('first');
  const afterLeaveSecond = () => events.push('second');
  const w = mount(() => {
    const count = counter.value;
    const transition = {
      name: 'test-dialog', css: false, duration: { enter: 100, leave: replace.value ? 300 : 200 },
      onLeave: [leave], onAfterLeave: [afterLeaveFirst, afterLeaveSecond]
    };
    return h(ConfigProvider, { dialog: source === 'provider' ? { transition } : undefined }, () => [
      h('span', { id: 'transition-counter' }, count),
      h(Dialog, {
        modelValue: open.value, destroyOnClose: true,
        transition: source === 'prop' ? transition : undefined,
        onClose: () => events.push('close'), onClosed: () => events.push('closed'),
        'onUpdate:modelValue': () => events.push('update')
      })
    ]);
  }, { global: realTransition, attachTo: document.body });
  try {
    await nextTick();
    open.value = false;
    await nextTick();
    expect(done).toBeTypeOf('function');
    expect(events).toEqual(['close']);
    const content = document.querySelector('.i-dialog');
    counter.value++;
    await nextTick();
    expect(w.get('#transition-counter').text()).toBe('1');
    expect(document.querySelector('.i-dialog')).toBe(content);
    expect(document.body.style.overflow).toBe('hidden');
    expect(events).toEqual(['close']);
    done();
    done();
    await nextTick();
    expect(events).toEqual(['close', 'first', 'second', 'closed', 'update']);
    expect(document.querySelector('.i-dialog')).toBeNull();

    open.value = true;
    await nextTick();
    open.value = false;
    await nextTick();
    replace.value = true;
    await nextTick();
    expect(document.querySelector('.i-dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    done();
    expect(events.slice(5)).toEqual(['close', 'closed', 'update']);
  } finally {
    w.unmount();
  }
});

test('遮罩类、无障碍标题与正文关联落在对应元素', async () => {
  const w = mount(Dialog, {
    props: { modelValue: true, title: '编辑', modalClass: ['custom-mask', { active: true }], headerAriaLevel: '4' },
    attrs: { class: 'custom-panel' },
    slots: { default: () => '正文' }
  });
  try {
    await nextTick();
    expect(w.get('.i-dialog__mask').classes()).toEqual(expect.arrayContaining(['custom-mask', 'active']));
    const dialog = w.get('[role="dialog"]');
    expect(dialog.classes()).toContain('custom-panel');
    expect(dialog.attributes('aria-label')).toBe('编辑');
    expect(dialog.attributes('aria-describedby')).toBe(w.get('.i-dialog__body').attributes('id'));
    expect(w.get('[role="heading"]').attributes('aria-level')).toBe('4');
  } finally {
    w.unmount();
  }
});

test('自定义宿主优先于 appendToBody，无遮罩穿透只在可用时置顶', async () => {
  const target = document.createElement('div');
  target.id = 'custom-dialog-host';
  document.body.append(target);
  const makeDialog = (id: string, props: { appendTo?: string; appendToBody?: boolean; modalPenetrable?: boolean }) =>
    h(Dialog, { id, modelValue: true, modal: false, ...props });
  const w = mount(ConfigProvider, {
    attachTo: document.body,
    global: realTransition,
    slots: { default: () => [
      makeDialog('provider-dialog', { modalPenetrable: true }),
      makeDialog('body-dialog', { appendToBody: true }),
      makeDialog('custom-dialog', { appendToBody: true, appendTo: '#custom-dialog-host' })
    ] }
  });
  try {
    await flushPromises();
    const provider = document.querySelector<HTMLElement>('.i-overlay-host #provider-dialog');
    const body = document.querySelector<HTMLElement>('body > .i-dialog__wrapper > #body-dialog');
    expect(body).not.toBeNull();
    expect(target.querySelector('#custom-dialog')).not.toBeNull();
    expect(provider?.parentElement?.classList.contains('is-penetrable')).toBe(true);
    const z = Number(provider?.parentElement?.style.zIndex);
    provider?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(Number(provider?.parentElement?.style.zIndex)).toBeGreaterThan(z);
    const raised = Number(provider?.parentElement?.style.zIndex);
    provider?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(Number(provider?.parentElement?.style.zIndex)).toBeGreaterThan(raised);
  } finally {
    w.unmount();
  }
});

test('遮罩只接受同一目标的手势，穿透与显式层级互不影响', async () => {
  const w = mount(Dialog, {
    global: realTransition,
    props: { modelValue: true, modalPenetrable: true, zIndex: 9800, transition: immediateTransition }
  });
  try {
    await nextTick();
    const mask = w.get('.i-dialog__mask');
    await w.get('.i-dialog').trigger('mousedown');
    await mask.trigger('mouseup');
    await mask.trigger('click');
    expect(w.emitted('close')).toBeUndefined();
    await w.setProps({ modal: false });
    const wrapper = w.get('.i-dialog__wrapper');
    expect(wrapper.classes()).toContain('is-penetrable');
    await w.get('.i-dialog').trigger('mousedown');
    expect(wrapper.attributes('style')).toContain('z-index: 9800');
    await w.setProps({ fullscreen: true });
    expect(wrapper.classes()).not.toContain('is-penetrable');
    await wrapper.trigger('mousedown');
    await wrapper.trigger('mouseup');
    await wrapper.trigger('click');
    expect(w.emitted('close')).toHaveLength(1);
  } finally {
    w.unmount();
  }
});

test('卸载取消待开的计时器，迟到的离场回调不会发出关闭事件', async () => {
  vi.useFakeTimers();
  const pending = mount(Dialog, { props: { modelValue: true, openDelay: 100 }, global: realTransition });
  pending.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(pending.emitted('open')).toBeUndefined();

  let finishLeave!: () => void;
  const afterLeave = vi.fn();
  const w = mount(Dialog, {
    global: realTransition,
    props: {
      modelValue: true,
      transition: {
        ...immediateTransition, onLeave: (_: Element, done: () => void) => { finishLeave = done; },
        onAfterLeave: [afterLeave]
      }
    }
  });
  await nextTick();
  await w.setProps({ modelValue: false });
  expect(finishLeave).toBeTypeOf('function');
  w.unmount();
  finishLeave();
  expect(w.emitted('closed')).toBeUndefined();
  expect(afterLeave).not.toHaveBeenCalled();
  expect(document.body.style.overflow).toBe('');
});

test('弹窗约束焦点、支持 Esc、关闭恢复焦点和滚动', async () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, title: '编辑' },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  const input = w.find('input').element;
  const close = w.find('button').element;
  expect(document.body.style.overflow).toBe('hidden');
  expect(w.find('[role="dialog"]').element.contains(document.activeElement)).toBe(true);
  input.focus();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  expect(document.activeElement).toBe(close);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await nextTick();
  expect(w.emitted('update:modelValue')?.[0]).toEqual([false]);
  await w.setProps({ modelValue: false });
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).toBe('');
  w.unmount();
});

test('关闭开关有效，多弹窗保持滚动锁，主题宿主承载浮层', async () => {
  const w = mount(ConfigProvider, {
    attachTo: document.body,
    props: { theme: 'dark' },
    slots: {
      default: () => h(Dialog, { modelValue: true, closeOnPressEscape: false, closeOnClickModal: false }, () => '内容')
    }
  });
  await flushPromises();
  expect(document.querySelector('.i-overlay-host [role="dialog"]')).not.toBeNull();
  const dialog = w.findComponent(Dialog);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  document.querySelector('.i-dialog__mask')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(dialog.emitted('update:modelValue')).toBeUndefined();
  const second = mount(Dialog, { global: realTransition, props: { transition: immediateTransition, modelValue: true }, attachTo: document.body });
  await nextTick();
  w.unmount();
  expect(document.body.style.overflow).toBe('hidden');
  second.unmount();
  expect(document.body.style.overflow).toBe('');
});

test('支持宽度、居中和关闭后销毁内容', async () => {
  const w = mount(Dialog, {
    global: realTransition,
    props: { transition: immediateTransition, modelValue: true, width: 360, center: true, destroyOnClose: true },
    slots: { default: () => h('p', '内容') }
  });
  await nextTick();
  expect(w.get('.i-dialog').classes()).toContain('i-dialog--center');
  expect(w.get('.i-dialog').attributes('style')).toContain('width: 360px');
  await w.setProps({ modelValue: false });
  expect(w.find('p').exists()).toBe(false);
  w.unmount();
});

test('消息自动关闭，卸载后取消计时器', async () => {
  vi.useFakeTimers();
  const w = mount(Message, { props: { message: '保存成功', duration: 1000 } });
  expect(w.text()).toContain('保存成功');
  vi.advanceTimersByTime(1000);
  expect(w.emitted('close')).toHaveLength(1);
  w.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test('支持全屏、无遮罩、自定义挂载和滚动锁开关', async () => {
  const host = document.createElement('div');
  host.id = 'dialog-host';
  document.body.append(host);
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, fullscreen: true, modal: false, appendTo: '#dialog-host', lockScroll: false },
    slots: { default: () => h('p', '内容') }
  });
  await flushPromises();
  expect(host.querySelector('.i-dialog.is-fullscreen')).not.toBeNull();
  expect(host.querySelector('.i-dialog__mask')).toBeNull();
  expect(host.querySelector('.i-dialog__wrapper')).not.toBeNull();
  expect(document.body.style.overflow).toBe('');
  w.unmount();
  const w2 = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, top: '10vh' },
    slots: { default: () => 'x' }
  });
  await flushPromises();
  expect((w2.get('.i-dialog').element as HTMLElement).style.marginTop).toBe('10vh');
  expect(w2.get('.i-dialog__mask').classes()).toContain('is-top');
  w2.unmount();
});

test('触发 open/opened/close/closed 与自动聚焦事件', async () => {
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, title: '标题' },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(w.emitted('open')).toHaveLength(1);
  expect(w.emitted('open-auto-focus')).toHaveLength(1);
  expect(w.emitted('opened')).toHaveLength(1);
  (w.vm as unknown as { handleClose: () => void }).handleClose();
  await nextTick();
  expect(w.emitted('close')).toHaveLength(1);
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
  await w.setProps({ modelValue: false });
  expect(w.emitted('closed')).toHaveLength(1);
  expect(w.emitted('close-auto-focus')).toHaveLength(1);
  w.unmount();
});

test('beforeClose 可拦截关闭，done 后继续，resetPosition 恢复偏移', async () => {
  let done!: () => void;
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, beforeClose: (d: () => void) => (done = d) },
    slots: { default: () => 'x' }
  });
  await flushPromises();
  (w.vm as unknown as { handleClose: () => void }).handleClose();
  await nextTick();
  expect(w.emitted('close')).toBeUndefined();
  expect(w.emitted('update:modelValue')).toBeUndefined();
  done();
  await nextTick();
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
  const section = w.get('.i-dialog').element as HTMLElement;
  section.style.marginTop = '99px';
  (w.vm as unknown as { resetPosition: () => void }).resetPosition();
  expect(section.style.marginTop).toBe('');
  w.unmount();
});

test('支持 header/title 插槽、自定义类名与隐藏关闭按钮', async () => {
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: {
      transition: immediateTransition,
      modelValue: true,
      showClose: false,
      customClass: 'my-dialog',
      headerClass: 'my-header',
      bodyClass: 'my-body',
      footerClass: 'my-footer'
    },
    slots: {
      header: () => h('div', { class: 'custom-header' }, '定制头'),
      default: () => '正文',
      footer: () => '脚注'
    }
  });
  await flushPromises();
  expect(w.get('.i-dialog').classes()).toContain('my-dialog');
  expect(w.find('.custom-header').exists()).toBe(true);
  expect(w.find('.i-dialog__close').exists()).toBe(false);
  expect(w.get('.i-dialog__header').classes()).toContain('my-header');
  expect(w.get('.i-dialog__body').classes()).toContain('my-body');
  expect(w.get('.i-dialog__footer').classes()).toContain('my-footer');
  w.unmount();
  const w2 = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true },
    slots: { title: () => '定制标题', default: () => 'x' }
  });
  await flushPromises();
  expect(w2.get('.i-dialog__title').text()).toBe('定制标题');
  expect(w2.get('.i-dialog__close').attributes('aria-label')).toBe('关闭对话框');
  w2.unmount();
});

test('默认关闭后保留内容，destroy-on-close 为 true 时销毁', async () => {
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, destroyOnClose: false },
    slots: { default: () => h('p', '保留') }
  });
  await flushPromises();
  await w.setProps({ modelValue: false });
  await flushPromises();
  expect(w.find('p').exists()).toBe(true);
  expect((w.get('.i-dialog__mask').element as HTMLElement).style.display).toBe('none');
  await w.setProps({ modelValue: true });
  await flushPromises();
  expect(w.find('p').exists()).toBe(true);
  await w.setProps({ modelValue: false });
  expect(w.find('.i-dialog').exists()).toBe(true);
  await w.setProps({ modelValue: true, destroyOnClose: true });
  await w.setProps({ modelValue: false });
  expect(w.find('p').exists()).toBe(false);
  w.unmount();
  const w2 = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true },
    slots: { default: () => h('p', '默认') }
  });
  await flushPromises();
  await w2.setProps({ modelValue: false });
  expect(w2.find('p').exists()).toBe(true);
  w2.unmount();
});

test('header 插槽接收 close/titleId/titleClass，拖拽后 resetPosition 复位', async () => {
  interface DialogHeaderScope {
    close: () => void;
    titleId: string;
    titleClass: string;
  }
  let scope: DialogHeaderScope | undefined;
  const w = mount(Dialog, {
    global: realTransition,
    attachTo: document.body,
    props: { transition: immediateTransition, modelValue: true, draggable: true },
    slots: {
      header: (headerScope: DialogHeaderScope) => {
        scope = headerScope;
        return h('div', { class: 'custom-header', id: headerScope.titleId }, '定制头');
      },
      default: () => 'x'
    }
  });
  await flushPromises();
  expect(scope?.titleClass).toBe('i-dialog__title');
  expect(w.get('[role="dialog"]').attributes('aria-labelledby')).toBe(scope?.titleId);
  expect(w.get('.custom-header').attributes('id')).toBe(scope?.titleId);
  expect(typeof scope?.close).toBe('function');
  scope?.close();
  await nextTick();
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
  await w.setProps({ modelValue: false });
  await w.setProps({ modelValue: true });
  // 拖拽 header 产生偏移
  const header = w.get('.i-dialog__header');
  await header.trigger('mousedown', { clientX: 100, clientY: 100 });
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 130 }));
  await nextTick();
  const section = w.get('.i-dialog').element as HTMLElement;
  expect(section.style.transform).toContain('translate(50px, 30px)');
  // resetPosition 清除拖拽偏移
  (w.vm as unknown as { resetPosition: () => void }).resetPosition();
  await nextTick();
  expect(section.style.transform).toBe('');
  w.unmount();
});
