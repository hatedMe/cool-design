import { mount } from '@vue/test-utils';
import { defineComponent, getCurrentInstance, h, nextTick, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import ConfigProvider from '../index';
import Button from '../../button';
import Link from '../../link';
import Dialog from '../../dialog';
import Table from '../../table';
import Message, { ElMessage } from '../../message';

test('Button 和 Link 从嵌套配置继承字段并响应父级更新', async () => {
  const round = ref(true);
  const wrapper = mount(ConfigProvider, {
    props: { button: { type: 'success', round: true, dashed: true, autoInsertSpace: true }, link: { type: 'success', underline: 'always' } },
    slots: { default: () => h(ConfigProvider, { button: { plain: round.value }, link: { type: 'primary' } }, {
      default: () => [h(Button, { round: false }, () => '按钮'), h(Link), h(Link, { underline: false })]
    }) }
  });
  const button = wrapper.find('button');
  expect(button.classes()).toEqual(expect.arrayContaining(['i-button--success', 'is-plain', 'is-dashed']));
  expect(button.classes()).not.toContain('is-round');
  expect(button.text()).toBe('按 钮');
  expect(wrapper.findAll('a')[0].classes()).toEqual(expect.arrayContaining(['i-link--primary', 'i-link--underline-always']));
  expect(wrapper.findAll('a')[1].classes()).toContain('i-link--underline-never');
  round.value = false;
  await wrapper.setProps({ link: { underline: 'hover' } });
  expect(button.classes()).not.toContain('is-plain');
  expect(wrapper.find('a').classes()).toContain('i-link--underline-hover');
  wrapper.unmount();
});

test('Dialog 响应 Provider 居中与拖动设置，显式 false 优先', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { dialog: { alignCenter: true, draggable: true } },
    slots: { default: () => h(Dialog, { modelValue: true, draggable: false, lockScroll: false }) }
  });
  await nextTick();
  expect(wrapper.find('.i-dialog__mask').classes()).toContain('is-align-center');
  expect(wrapper.find('.i-dialog__header').classes()).not.toContain('is-draggable');
  await wrapper.setProps({ dialog: { alignCenter: false } });
  expect(wrapper.find('.i-dialog__mask').classes()).not.toContain('is-align-center');
  wrapper.unmount();
});

test('Table 分层应用溢出提示，显式关闭优先', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { table: { showOverflowTooltip: true, tooltipEffect: 'light', tooltipOptions: { popperClass: 'provider-tip' }, tooltipFormatter: () => h('strong', '全局提示') } },
    slots: { default: () => h(Table, {
      data: [{ name: '甲', other: '乙' }],
      showOverflowTooltip: { popperClass: 'table-tip', offset: 0, showArrow: false, transition: { css: false } },
      columns: [{ key: 'name', showOverflowTooltip: { placement: 'bottom' } }, { key: 'other', showOverflowTooltip: false }]
    }) },
    global: { stubs: { transition: false } }
  });
  const cells = wrapper.findAll('tbody td');
  expect(cells[1].find('.i-tooltip__trigger').exists()).toBe(false);
  expect(cells[0].find('.i-tooltip__trigger').exists()).toBe(true);
  const trigger = cells[0].get('.i-tooltip__trigger');
  await trigger.trigger('mouseenter');
  expect(wrapper.find('[role=tooltip]').exists()).toBe(false);
  Object.defineProperty(trigger.element, 'scrollWidth', { value: 100 });
  await trigger.trigger('mouseenter');
  const tooltip = wrapper.get('.table-tip.i-tooltip--light');
  expect(tooltip.get('strong').text()).toBe('全局提示');
  expect(tooltip.find('.i-tooltip__arrow').exists()).toBe(false);
  expect(wrapper.getComponent({ name: 'i-tooltip' }).props('offset')).toBe(0);
  await wrapper.setProps({
    table: { showOverflowTooltip: true, tooltipOptions: { disabled: true, hideAfter: 0 } }
  });
  await trigger.trigger('mouseenter');
  expect(wrapper.find('[role=tooltip]').exists()).toBe(false);
  wrapper.unmount();
});

test('Message 服务读取应用级 Provider 的默认值并遵循显式覆盖和数量限制', async () => {
  const Probe = defineComponent({
    setup() {
      const context = getCurrentInstance()!.appContext;
      return () => h('button', { onClick: () => {
        ElMessage('第一条', context);
        ElMessage({ message: '第二条', showClose: false, plain: false }, context);
        ElMessage('超过上限', context);
      } });
    }
  });
  const wrapper = mount(ConfigProvider, {
    props: { message: { showClose: true, plain: true, max: 2, duration: 0, placement: 'bottom', offset: 0 } },
    slots: { default: () => h(Probe) }
  });
  try {
    await wrapper.find('button').trigger('click');
    const container = document.querySelector<HTMLElement>('.i-message-container--bottom');
    expect(container?.style.bottom).toBe('0px');
    const messages = document.querySelectorAll('.i-message-container--bottom .i-message');
    expect(messages).toHaveLength(2);
    expect(messages?.[0].classList.contains('is-plain')).toBe(true);
    expect(messages?.[0].querySelector('button')).not.toBeNull();
    expect(messages?.[1].classList.contains('is-plain')).toBe(false);
    expect(messages?.[1].querySelector('button')).toBeNull();
  } finally {
    ElMessage.closeAll();
    wrapper.unmount();
  }
});

test('Dialog 等待显式过渡完成并保留调用方钩子', async () => {
  const visible = ref(false);
  const events: string[] = [];
  let finishEnter!: () => void;
  let finishLeave!: () => void;
  const transition = {
    css: false,
    onEnter: (_: Element, done: () => void) => { finishEnter = done; },
    onLeave: (_: Element, done: () => void) => { finishLeave = done; },
    onAfterEnter: () => events.push('user-enter'),
    onAfterLeave: [() => events.push('user-leave')]
  };
  const wrapper = mount(ConfigProvider, {
    props: { dialog: { transition: 'provider' } },
    global: { stubs: { transition: false } },
    slots: { default: () => h(Dialog, {
      modelValue: visible.value, transition, destroyOnClose: true,
      onOpened: () => events.push('opened'), onClosed: () => events.push('closed')
    }) }
  });
  visible.value = true;
  await nextTick();
  await nextTick();
  expect(events).toEqual([]);
  finishEnter();
  expect(events).toEqual(['user-enter', 'opened']);
  visible.value = false;
  await nextTick();
  expect(wrapper.find('.i-dialog').exists()).toBe(true);
  expect(events).toEqual(['user-enter', 'opened']);
  finishLeave();
  await nextTick();
  expect(events).toEqual(['user-enter', 'opened', 'user-leave', 'closed']);
  expect(wrapper.find('.i-dialog').exists()).toBe(false);
  wrapper.unmount();
});

test('离场期间移除 Dialog 过渡时完成关闭并释放滚动锁与焦点', async () => {
  const outside = document.createElement('button');
  document.body.appendChild(outside);
  outside.focus();
  const visible = ref(true);
  const closed = vi.fn();
  const afterLeave = vi.fn();
  let finishLeave: (() => void) | undefined;
  const onLeave = (_element: Element, done: () => void) => {
    finishLeave = done;
  };
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { dialog: { transition: { css: false, onLeave, onAfterLeave: [afterLeave] } } },
    global: { stubs: { transition: false } },
    slots: { default: () => h(Dialog, { modelValue: visible.value, destroyOnClose: true, onClosed: closed }) }
  });
  try {
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');
    visible.value = false;
    await nextTick();
    expect(finishLeave).toBeTypeOf('function');
    expect(closed).toHaveBeenCalledTimes(0);
    await wrapper.setProps({ dialog: undefined });
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(outside);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(document.querySelector<HTMLElement>('.i-dialog__mask')?.style.display).toBe('none');
    expect(wrapper.find('.i-dialog').exists()).toBe(false);
    finishLeave?.();
    expect(afterLeave).not.toHaveBeenCalled();
    expect(closed).toHaveBeenCalledTimes(1);
  } finally {
    wrapper.unmount();
    outside.remove();
  }
});

test('旧离场回调不会提前完成重新打开后的 Dialog 离场', async () => {
  const visible = ref(true);
  const closed = vi.fn();
  const leaves: Array<() => void> = [];
  const dialog = {
    transition: {
      css: false,
      onLeave: (_element: Element, done: () => void) => { leaves.push(done); }
    }
  };
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { dialog },
    global: { stubs: { transition: false } },
    slots: { default: () => h(Dialog, { modelValue: visible.value, destroyOnClose: true, onClosed: closed }) }
  });
  try {
    await nextTick();
    visible.value = false;
    await nextTick();
    expect(leaves).toHaveLength(1);
    await wrapper.setProps({ dialog: undefined });
    expect(closed).toHaveBeenCalledTimes(1);
    await wrapper.setProps({ dialog });
    visible.value = true;
    await nextTick();
    visible.value = false;
    await nextTick();
    expect(leaves).toHaveLength(2);
    leaves[0]();
    expect(document.body.style.overflow).toBe('hidden');
    expect(closed).toHaveBeenCalledTimes(1);
    leaves[1]();
    expect(document.body.style.overflow).toBe('');
    expect(closed).toHaveBeenCalledTimes(2);
  } finally {
    wrapper.unmount();
    leaves.forEach((done) => done());
  }
});

test('Message 顶层配置更新后生效且卸载时恢复上一个 Provider', async () => {
  const latest = ref(true);
  const max = ref(0);
  const Probe = defineComponent({
    setup() {
      const context = getCurrentInstance()!.appContext;
      return () => h('button', { onClick: () => ElMessage('恢复配置', context) });
    }
  });
  const Root = defineComponent(() => () => h('div', [
    h(ConfigProvider, { message: { duration: 0, placement: 'bottom' } }),
    latest.value ? h(ConfigProvider, { message: { max: max.value, duration: 0 } }) : null,
    h(Probe)
  ]));
  const wrapper = mount(Root);
  try {
    await wrapper.get('button').trigger('click');
    expect(document.querySelector('.i-message')).toBeNull();
    max.value = 1;
    await nextTick();
    await wrapper.get('button').trigger('click');
    expect(document.querySelector('.i-message-container--top .i-message')).not.toBeNull();
    ElMessage.closeAll();
    latest.value = false;
    await nextTick();
    await wrapper.get('button').trigger('click');
    expect(document.querySelector('.i-message-container--bottom .i-message')).not.toBeNull();
  } finally {
    ElMessage.closeAll();
    wrapper.unmount();
  }
});

test('Message 达到上限可增加分组计数，显式关闭分组和计时优先', async () => {
  vi.useFakeTimers();
  const Probe = defineComponent({
    setup() {
      const context = getCurrentInstance()!.appContext;
      return () => h('button', { onClick: () => {
        ElMessage({ message: '合并', duration: 0 }, context);
        ElMessage('合并', context);
        ElMessage({ message: '合并', grouping: false }, context);
      } });
    }
  });
  const wrapper = mount(ConfigProvider, {
    props: { message: { max: 1, grouping: true, duration: 10 } },
    slots: { default: () => h(Probe) }
  });
  try {
    await wrapper.get('button').trigger('click');
    expect(document.querySelectorAll('.i-message')).toHaveLength(1);
    expect(document.querySelector('.i-message__badge')?.textContent).toBe('2');
    vi.advanceTimersByTime(100);
    expect(document.querySelector('.i-message')).not.toBeNull();
  } finally {
    ElMessage.closeAll();
    vi.useRealTimers();
    wrapper.unmount();
  }
});

test('声明式 Message 响应配置更新并遵循显式 false', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { message: { showClose: true, plain: true, duration: 0 } },
    slots: { default: () => h(ConfigProvider, { message: { plain: true } }, { default: () => h(Message, { message: '消息', plain: false }) }) }
  });
  expect(wrapper.find('button').exists()).toBe(true);
  expect(wrapper.find('.i-message').classes()).not.toContain('is-plain');
  await wrapper.setProps({ message: { showClose: false, duration: 0 } });
  expect(wrapper.find('button').exists()).toBe(false);
  wrapper.unmount();
});
