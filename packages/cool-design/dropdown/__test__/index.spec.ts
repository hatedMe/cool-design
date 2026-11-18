import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
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
  test('click 触发打开与命令', async () => {
    const wrapper = mountDropdown({
      props: { trigger: 'click', items: [{ command: 'edit', label: '编辑' }, { command: 'del', label: '删除', disabled: true }] },
      slots: { default: () => '触发器' }
    });
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
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
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
  });

  test('hover 触发', async () => {
    const wrapper = mountDropdown({
      props: { items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown').trigger('mouseenter');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
    await wrapper.find('.i-dropdown').trigger('mouseleave');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
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
    expect(wrapper.find('.i-dropdown__item-icon').text()).toBe('*');
  });

  test('splitButton 左键触发 click 右键展开', async () => {
    const wrapper = mountDropdown({
      props: { splitButton: true, items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '操作' }
    });
    await wrapper.find('.i-dropdown__button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
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
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
    await wrapper.find('.i-dropdown__trigger').trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });
});
