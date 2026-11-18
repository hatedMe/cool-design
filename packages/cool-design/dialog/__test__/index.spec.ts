import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import Dialog from '../index';
import Message from '../../message/index';
import ConfigProvider from '../../config-provider';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

test('弹窗约束焦点、支持 Esc、关闭恢复焦点和滚动', async () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const w = mount(Dialog, {
    attachTo: document.body,
    props: { modelValue: true, title: '编辑' },
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
  const second = mount(Dialog, { props: { modelValue: true }, attachTo: document.body });
  await nextTick();
  w.unmount();
  expect(document.body.style.overflow).toBe('hidden');
  second.unmount();
  expect(document.body.style.overflow).toBe('');
});

test('支持宽度、居中和关闭后销毁内容', async () => {
  const w = mount(Dialog, {
    props: { modelValue: true, width: 360, center: true, destroyOnClose: true },
    slots: { default: () => h('p', '内容') }
  });
  await nextTick();
  expect(w.get('.i-dialog').classes()).toContain('i-dialog--center');
  expect(w.get('.i-dialog').attributes('style')).toContain('width: 360px');
  await w.setProps({ modelValue: false });
  expect(w.find('p').exists()).toBe(false);
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
    attachTo: document.body,
    props: { modelValue: true, fullscreen: true, modal: false, appendTo: '#dialog-host', lockScroll: false },
    slots: { default: () => h('p', '内容') }
  });
  await flushPromises();
  expect(host.querySelector('.i-dialog.is-fullscreen')).not.toBeNull();
  expect(host.querySelector('.i-dialog__mask')).toBeNull();
  expect(host.querySelector('.i-dialog__wrapper')).not.toBeNull();
  expect(document.body.style.overflow).toBe('');
  w.unmount();
  const w2 = mount(Dialog, {
    attachTo: document.body,
    props: { modelValue: true, top: '10vh' },
    slots: { default: () => 'x' }
  });
  await flushPromises();
  expect((w2.get('.i-dialog').element as HTMLElement).style.marginTop).toBe('10vh');
  expect(w2.get('.i-dialog__mask').classes()).toContain('is-top');
  w2.unmount();
});

test('触发 open/opened/close/closed 与自动聚焦事件', async () => {
  const w = mount(Dialog, {
    attachTo: document.body,
    props: { modelValue: true, title: '标题' },
    slots: { default: () => h('input') }
  });
  await flushPromises();
  expect(w.emitted('open')).toHaveLength(1);
  expect(w.emitted('open-auto-focus')).toHaveLength(1);
  expect(w.emitted('opened')).toHaveLength(1);
  (w.vm as unknown as { handleClose: () => void }).handleClose();
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
    attachTo: document.body,
    props: { modelValue: true, beforeClose: (d: () => void) => (done = d) },
    slots: { default: () => 'x' }
  });
  await flushPromises();
  (w.vm as unknown as { handleClose: () => void }).handleClose();
  expect(w.emitted('close')).toHaveLength(1);
  expect(w.emitted('update:modelValue')).toBeUndefined();
  done();
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
  const section = w.get('.i-dialog').element as HTMLElement;
  section.style.marginTop = '99px';
  (w.vm as unknown as { resetPosition: () => void }).resetPosition();
  expect(section.style.marginTop).toBe('');
  w.unmount();
});

test('支持 header/title 插槽、自定义类名与隐藏关闭按钮', async () => {
  const w = mount(Dialog, {
    attachTo: document.body,
    props: {
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
    attachTo: document.body,
    props: { modelValue: true },
    slots: { title: () => '定制标题', default: () => 'x' }
  });
  await flushPromises();
  expect(w2.get('.i-dialog__title').text()).toBe('定制标题');
  expect(w2.get('.i-dialog__close').attributes('aria-label')).toBe('关闭对话框');
  w2.unmount();
});

test('默认关闭后保留内容，destroy-on-close 为 true 时销毁', async () => {
  const w = mount(Dialog, {
    attachTo: document.body,
    props: { modelValue: true, destroyOnClose: false },
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
    attachTo: document.body,
    props: { modelValue: true },
    slots: { default: () => h('p', '默认') }
  });
  await flushPromises();
  await w2.setProps({ modelValue: false });
  expect(w2.find('p').exists()).toBe(true);
  w2.unmount();
});

test('header 插槽接收 close/titleId/titleClass，拖拽后 resetPosition 复位', async () => {
  let scope: { close: () => void; titleId: string; titleClass: string } | undefined;
  const w = mount(Dialog, {
    attachTo: document.body,
    props: { modelValue: true, draggable: true },
    slots: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      header: (props: any) => {
        scope = props;
        return h('div', { class: 'custom-header' }, '定制头');
      },
      default: () => 'x'
    }
  });
  await flushPromises();
  expect(scope?.titleClass).toBe('i-dialog__title');
  expect(scope?.titleId).toContain('i-dialog-title-');
  expect(typeof scope?.close).toBe('function');
  scope?.close();
  expect(w.emitted('update:modelValue')).toEqual([[false]]);
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
