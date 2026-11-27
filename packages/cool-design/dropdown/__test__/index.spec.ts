import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import Dropdown from '../index';
import DropdownMenu from '../dropdown-menu';
import DropdownItem from '../dropdown-item';

/** 测试默认关闭 Teleport 与 hover 延时，便于断言菜单 DOM */
const mountDropdown = (
  options: { props?: Record<string, unknown>; slots?: Record<string, unknown>; attachTo?: HTMLElement } = {}
) =>
  mountDropdownBase(Dropdown, {
    ...options,
    props: { teleported: false, showTimeout: 0, hideTimeout: 0, ...options.props }
  } as Parameters<typeof mount>[1]);
const mountDropdownBase = mount;

describe('Dropdown', () => {
  test.each([
    { content: 'slot', role: 'navigation', itemRole: 'link', shiftKey: false },
    { content: 'items', role: 'navigation', itemRole: 'link', shiftKey: true },
    { content: 'slot', role: undefined, itemRole: 'menuitem', shiftKey: true },
    { content: 'items', role: undefined, itemRole: 'menuitem', shiftKey: false }
  ])('$content 模式的 $itemRole 按 Tab（Shift=$shiftKey）关闭并回焦', async ({
    content, role, itemRole, shiftKey
  }) => {
    const wrapper = mountDropdown({
      props: {
        trigger: 'click',
        ...(role ? { role } : {}),
        ...(content === 'items' ? { items: [{ command: 'edit', label: '编辑' }] } : {})
      },
      slots: content === 'slot' ? {
        dropdown: () => h(DropdownMenu, null, () => h(DropdownItem, { command: 'edit' }, () => '编辑'))
      } : undefined,
      attachTo: document.body
    });
    try {
      const trigger = wrapper.get('.i-dropdown__trigger');
      await trigger.trigger('click');
      const item = wrapper.get<HTMLButtonElement>('.i-dropdown__item-button');
      item.element.focus();
      expect(document.activeElement).toBe(item.element);
      expect.soft(item.attributes('role')).toBe(itemRole);
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab', code: 'Tab', shiftKey });
      item.element.dispatchEvent(event);
      await wrapper.vm.$nextTick();
      expect.soft(event.defaultPrevented).toBe(true);
      expect.soft(document.activeElement).toBe(trigger.element);
      expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
    } finally {
      wrapper.unmount();
    }
  });

  test.each(['click', 'hover'] as const)('从 %s 菜单按 Tab 关闭时恢复再次进入菜单的焦点', async (triggerMode) => {
    vi.useFakeTimers();
    const wrapper = mount(Dropdown, {
      props: {
        trigger: triggerMode, teleported: false, showTimeout: 0, hideTimeout: 500,
        items: [{ command: 'edit', label: '编辑' }]
      },
      slots: { default: () => h('button', '更多') },
      global: { stubs: { transition: false } },
      attachTo: document.body
    });
    try {
      wrapper.vm.handleOpen();
      await wrapper.vm.$nextTick();
      const trigger = wrapper.get<HTMLButtonElement>('.i-dropdown__trigger').element;
      const item = wrapper.get<HTMLButtonElement>('.i-dropdown__item-button').element;
      item.focus();
      await wrapper.get('.i-dropdown__item-button').trigger('keydown', { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).toBe(trigger);
      item.focus();
      if (triggerMode === 'hover') {
        expect(document.activeElement).toBe(item);
        expect(wrapper.emitted('visible-change')).toEqual([[true]]);
        await vi.advanceTimersByTimeAsync(500);
      }
      expect(document.activeElement).toBe(trigger);
      expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
    } finally {
      wrapper.unmount();
      vi.useRealTimers();
    }
  });

  test('Tab 离场期间保留菜单项监听器转移到菜单外的焦点', async () => {
    const after = document.createElement('button');
    document.body.append(after);
    const wrapper = mount(Dropdown, {
      props: { trigger: 'click', teleported: false },
      slots: {
        default: () => h('button', '更多'),
        dropdown: () => h(DropdownMenu, null, () => h(DropdownItem, { command: 'edit' }, () => '编辑'))
      },
      global: { stubs: { transition: false } },
      attachTo: document.body
    });
    try {
      const trigger = wrapper.get<HTMLButtonElement>('.i-dropdown__trigger');
      await trigger.trigger('click');
      const item = wrapper.get<HTMLButtonElement>('.i-dropdown__item-button');
      item.element.focus();
      await item.trigger('keydown', { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).toBe(trigger.element);
      item.element.addEventListener('focusin', () => after.focus(), { once: true });
      item.element.focus();
      expect(document.activeElement).toBe(after);
      expect(wrapper.emitted('visible-change')).toEqual([[true], [false]]);
    } finally {
      wrapper.unmount();
      after.remove();
    }
  });

  test('鼠标取消默认操作时保留菜单，键盘激活依次触发 Item click 与命令', async () => {
    const events: Array<[string, Event]> = [];
    const command = { value: 'edit' };
    const wrapper = mountDropdown({
      props: {
        trigger: 'click',
        onCommand: (value: unknown, item: { $props: { command: unknown } }, event: Event) => {
          expect(value).toBe(command);
          expect(item.$props.command).toBe(command);
          events.push(['command', event]);
        }
      },
      slots: {
        dropdown: () => h(DropdownMenu, null, () => h(DropdownItem, {
          command,
          onClick(event: Event) {
            events.push(['item', event]);
            if (event.type === 'click') event.preventDefault();
          }
        }, () => '编辑'))
      }
    });
    await wrapper.get('.i-dropdown__trigger').trigger('click');
    const item = wrapper.get('.i-dropdown__item-button');
    const mouse = new MouseEvent('click', { bubbles: true, cancelable: true });
    item.element.dispatchEvent(mouse);
    await wrapper.vm.$nextTick();
    const mouseEvents = events.splice(0);
    const visibleAfterMouse = wrapper.emitted('visible-change')?.slice();
    const enter = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Enter' });
    item.element.dispatchEvent(enter);
    await wrapper.vm.$nextTick();
    expect.soft(mouseEvents).toEqual([['item', mouse]]);
    expect.soft(visibleAfterMouse).toEqual([[true]]);
    expect.soft(events).toEqual([['item', enter], ['command', enter]]);
    expect(enter.defaultPrevented).toBe(true);
    wrapper.unmount();
  });

  test('使用默认键盘 code 并将原始命令事件传给监听方', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click', items: [{ command: 'a', label: 'A' }] },
      attachTo: document.body
    });
    const trigger = wrapper.get('.i-dropdown__trigger');
    for (const code of ['Enter', 'Space', 'ArrowDown', 'NumpadEnter']) {
      await trigger.trigger('keydown', { code, key: 'Unidentified' });
      expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([true]);
      const click = new MouseEvent('click', { bubbles: true });
      wrapper.get('.i-dropdown__item-button').element.dispatchEvent(click);
      const command = wrapper.emitted('command')?.at(-1);
      expect(command?.[0]).toBe('a');
      expect(command?.[1]).toBeTruthy();
      expect(command?.[2]).toBe(click);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([false]);
    }
    wrapper.unmount();
  });

  test('悬停默认 150 ms，反向离开取消打开，数组触发即时显示', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Dropdown, { props: { teleported: false } });
    try {
      const trigger = wrapper.get('.i-tooltip__trigger');
      await trigger.trigger('mouseenter');
      await vi.advanceTimersByTimeAsync(149);
      expect(wrapper.emitted('visible-change')).toBeUndefined();
      await trigger.trigger('mouseleave');
      await vi.advanceTimersByTimeAsync(150);
      expect(wrapper.emitted('visible-change')).toBeUndefined();
      await trigger.trigger('mouseenter');
      await vi.advanceTimersByTimeAsync(150);
      expect(wrapper.emitted('visible-change')).toEqual([[true]]);
      await trigger.trigger('mouseleave');
      await vi.advanceTimersByTimeAsync(149);
      expect(wrapper.emitted('visible-change')).toEqual([[true]]);
      await trigger.trigger('mouseenter');
      await vi.advanceTimersByTimeAsync(150);
      expect(wrapper.emitted('visible-change')).toEqual([[true]]);
      wrapper.vm.handleClose();
      await vi.advanceTimersByTimeAsync(150);
      await wrapper.setProps({ trigger: ['hover', 'click'] });
      await trigger.trigger('mouseenter');
      expect(wrapper.emitted('visible-change')).toEqual([[true], [false], [true]]);
    } finally {
      wrapper.unmount();
      vi.useRealTimers();
    }
  });
  test('click 触发打开与命令', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click', items: [{ command: 'edit', label: '编辑' }, { command: 'del', label: '删除', disabled: true }] },
      slots: { default: () => '触发器' }
    });
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true]);
    const buttons = wrapper.findAll('.i-dropdown__item-button');
    expect(buttons[1].attributes('disabled')).toBeDefined();
    await buttons[0].trigger('click');
    const command = wrapper.emitted('command')?.[0];
    expect(command?.[0]).toBe('edit');
    // 第二参数为 DropdownItem 组件实例
    expect(command?.[1]).toBeTruthy();
    // hideOnClick 默认关闭
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
  });

  test('hover 触发', async () => {
    const wrapper = mountDropdown({
      props: { items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-tooltip__trigger').trigger('mouseenter');
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBeUndefined();
    await wrapper.find('.i-tooltip__trigger').trigger('mouseleave');
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
  });

  test('contextmenu 触发', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'contextmenu', items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('contextmenu');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });

  test('插槽模式支持 divided 与 icon', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click' },
      slots: {
        default: () => '触发器',
        dropdown: () =>
          h(DropdownMenu, null, {
            default: () => [
              h(DropdownItem, { command: 'a' }, () => 'A'),
              h(DropdownItem, { command: 'b', divided: true, icon: '*' }, () => 'B')
            ]
          })
      }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    expect(wrapper.find('.i-dropdown__item.is-divided').exists()).toBe(true);
    // 字符串 icon 经 Icon 按图标类名渲染。
    expect(wrapper.find('.i-dropdown__item-icon .i-icon').classes()).toContain('*');
  });

  test('splitButton 左键触发 click 右键展开', async () => {
    const wrapper = mountDropdown({
      props: { splitButton: true, items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '操作' }
    });
    await wrapper.find('.i-dropdown__button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });

  test('hideOnClick=false 保持打开', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click', hideOnClick: false, items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    await wrapper.find('.i-dropdown__item-button').trigger('click');
    expect(wrapper.emitted('command')?.[0]?.[0]).toBe('a');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });

  test('命令值支持对象', async () => {
    const cmd = { id: 1 };
    const wrapper = mountDropdown({
      props: { trigger: 'click', items: [{ command: cmd, label: '对象' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    await wrapper.find('.i-dropdown__item-button').trigger('click');
    expect(wrapper.emitted('command')?.[0]?.[0]).toEqual(cmd);
  });

  test('split-button 复用按钮组并支持 type / buttonProps', async () => {
    const wrapper = mountDropdown({
      props: {
        splitButton: true,
        type: 'primary',
        buttonProps: { loading: false, 'data-main': 'yes' },
        items: [{ command: 'a', label: 'A' }]
      },
      slots: { default: () => '更多操作' }
    });
    const group = wrapper.find('.i-button-group');
    expect(group.exists()).toBe(true);
    const main = wrapper.find('.i-dropdown__button');
    expect(main.classes()).toContain('i-button');
    expect(main.classes()).toContain('i-button--primary');
    expect(main.attributes('data-main')).toBe('yes');
    await main.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  test('role 与 effect 透传菜单与面板', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click', role: 'list', effect: 'dark', items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    expect(wrapper.find('.i-dropdown__menu').attributes('role')).toBe('list');
    expect(wrapper.find('.i-dropdown__popper').classes()).toContain('i-dropdown__popper--dark');
  });

  test('trigger-keys 自定义触发键', async () => {
    const wrapper = mountDropdown({
      props: { triggerKeys: ['enter'], items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('keydown', { key: ' ' });
    expect(wrapper.find('.i-dropdown__popper').attributes('aria-hidden')).toBe('true');
    await wrapper.find('.i-dropdown__trigger').trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });
});
