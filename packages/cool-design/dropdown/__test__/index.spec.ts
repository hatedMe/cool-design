import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Dropdown from '../index';
import DropdownMenu from '../dropdown-menu';
import DropdownItem from '../dropdown-item';

describe('Dropdown', () => {
  test('click 触发打开与命令', async () => {
    const wrapper = mount(Dropdown, {
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
    expect(wrapper.emitted('command')?.[0]).toEqual(['edit']);
    // hideOnClick 默认关闭
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
  });

  test('hover 触发', async () => {
    const wrapper = mount(Dropdown, {
      props: { items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown').trigger('mouseenter');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
    await wrapper.find('.i-dropdown').trigger('mouseleave');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(false);
  });

  test('contextmenu 触发', async () => {
    const wrapper = mount(Dropdown, {
      props: { trigger: 'contextmenu', items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('contextmenu');
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });

  test('插槽模式支持 divided 与 icon', async () => {
    const wrapper = mount(Dropdown, {
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
    const wrapper = mount(Dropdown, {
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
    const wrapper = mount(Dropdown, {
      props: { trigger: 'click', hideOnClick: false, items: [{ command: 'a', label: 'A' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    await wrapper.find('.i-dropdown__item-button').trigger('click');
    expect(wrapper.emitted('command')?.[0]).toEqual(['a']);
    expect(wrapper.find('.i-dropdown__menu').exists()).toBe(true);
  });

  test('命令值支持对象', async () => {
    const cmd = { id: 1 };
    const wrapper = mount(Dropdown, {
      props: { trigger: 'click', items: [{ command: cmd, label: '对象' }] },
      slots: { default: () => '触发器' }
    });
    await wrapper.find('.i-dropdown__trigger').trigger('click');
    await wrapper.find('.i-dropdown__item-button').trigger('click');
    expect(wrapper.emitted('command')?.[0]).toEqual([cmd]);
  });
});
