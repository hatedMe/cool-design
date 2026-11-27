import { mount } from '@vue/test-utils';
import * as UI from '../../index';
import { h, nextTick, ref, Teleport } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Popper 组合共享引用、关联 ARIA、创建定位实例并清理', async () => {
  expect(UI.ElPopper).toBeDefined();
  expect(UI.ElPopperTrigger).toBeDefined();
  expect(UI.ElPopperContent).toBeDefined();
  expect(UI.ElPopperArrow).toBeDefined();
  const clicked = vi.fn();
  const contentRef = ref<UI.PopperContentInstance>();
  const wrapper = mount(UI.ElPopper, { attachTo: document.body, props: { role: 'dialog' }, slots: { default: () => [
    h(UI.ElPopperTrigger, { id: 'public-popup', open: true, onClick: clicked }, () => h('button', 'trigger')),
    h(UI.ElPopperContent, { ref: contentRef, id: 'public-popup', visible: true, ariaLabel: 'details', focusOnShow: true }, () => [h('button', 'action'), h(UI.ElPopperArrow)])
  ] } });
  await nextTick(); await nextTick();
  const trigger = wrapper.findAll('button')[0];
  expect(trigger.attributes('aria-haspopup')).toBe('dialog');
  expect(trigger.attributes('aria-controls')).toBe('public-popup');
  await trigger.trigger('click'); expect(clicked).toHaveBeenCalledTimes(1);
  expect(wrapper.get('[role=dialog]').attributes('aria-label')).toBe('details');
  expect(wrapper.get('[data-popper-arrow]').exists()).toBe(true);
  const root = wrapper.vm;
  expect(root.triggerRef).toBe(trigger.element);
  expect(root.contentRef).toBe(wrapper.get('[role=dialog]').element);
  expect(root.popperInstanceRef?.update).toBeTypeOf('function');
  const content = wrapper.findComponent(UI.ElPopperContent);
  await contentRef.value!.updatePopper(false);
  await wrapper.get('[role=dialog]').trigger('keydown', { key: 'Escape' });
  expect(content.emitted('close')).toHaveLength(1);
  const destroy = vi.spyOn(root.popperInstanceRef!, 'destroy');
  wrapper.unmount(); expect(destroy).toHaveBeenCalled();
});

test('Popper 虚拟触发的监听和原有 ARIA 在引用切换、卸载时恢复', async () => {
  expect(UI.ElPopper).toBeDefined();
  const first = document.createElement('button'); first.setAttribute('aria-describedby', 'original'); document.body.append(first);
  const second = document.createElement('button'); document.body.append(second);
  const target = ref(first); const click = vi.fn();
  const wrapper = mount(UI.ElPopper, { slots: { default: () => h(UI.ElPopperTrigger, { virtualTriggering: true, virtualRef: target.value, id: 'new-tip', open: true, onClick: click }) } });
  await nextTick();
  first.click(); expect(click).toHaveBeenCalledTimes(1);
  expect(first.getAttribute('aria-describedby')).toContain('new-tip');
  target.value = second; await nextTick();
  first.click(); expect(click).toHaveBeenCalledTimes(1);
  expect(first.getAttribute('aria-describedby')).toBe('original');
  second.click(); expect(click).toHaveBeenCalledTimes(2);
  wrapper.unmount(); second.click(); expect(click).toHaveBeenCalledTimes(2);
  expect(second.hasAttribute('aria-describedby')).toBe(false);
});

test('普通和虚拟模式切换时移动监听和 ARIA 引用', async () => {
  const virtual = ref(false);
  const target = document.createElement('button'); document.body.append(target);
  const click = vi.fn();
  const wrapper = mount(UI.Popper, { slots: { default: () => h(UI.PopperTrigger, { virtualTriggering: virtual.value, virtualRef: target, id: 'switch-tip', open: true, onClick: click }, () => h('button', 'normal')) } });
  const old = wrapper.get('button').element;
  virtual.value = true; await nextTick();
  target.click(); expect(click).toHaveBeenCalledTimes(1);
  old.click(); expect(click).toHaveBeenCalledTimes(1);
  expect(target.getAttribute('aria-describedby')).toContain('switch-tip');
  virtual.value = false; await nextTick();
  target.click(); expect(click).toHaveBeenCalledTimes(1);
  await wrapper.get('button').trigger('click'); expect(click).toHaveBeenCalledTimes(2);
  wrapper.unmount();
});

test('嵌套 Teleport 浮层仅由最上层约束焦点', async () => {
  const nativeFocus = HTMLElement.prototype.focus;
  let calls = 0;
  const focus = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
    calls++;
    if (calls < 10) nativeFocus.call(this, options);
  });
  const wrapper = mount(UI.Popper, { attachTo: document.body, slots: { default: () => h(UI.PopperContent, { visible: true, trapping: true }, () => [
    h('button', { id: 'outer-action' }, 'outer'),
    h(Teleport, { to: 'body' }, h(UI.Popper, null, () => h(UI.PopperContent, { visible: true, trapping: true }, () => h('button', { id: 'inner-action' }, 'inner'))))
  ]) } });
  try {
    await nextTick(); await nextTick();
    document.getElementById('inner-action')!.focus();
    expect(document.activeElement?.id).toBe('inner-action');
    expect(calls).toBeLessThan(4);
  } finally { wrapper.unmount(); focus.mockRestore(); }
});
