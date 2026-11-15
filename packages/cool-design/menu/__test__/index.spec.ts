import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Menu from '../index';
import MenuItem from '../menu-item';
import SubMenu from '../sub-menu';
import MenuItemGroup from '../menu-item-group';

describe('Menu', () => {
  test('items 模式支持激活与禁用', async () => {
    const wrapper = mount(Menu, {
      props: {
        modelValue: 'home',
        items: [
          { index: 'home', label: '首页' },
          { index: 'users', label: '用户', disabled: true }
        ]
      }
    });
    expect(wrapper.find('.i-menu-item.is-active').text()).toContain('首页');
    const buttons = wrapper.findAll('.i-menu-item__button');
    expect(buttons[1].attributes('disabled')).toBeDefined();
    await buttons[0].trigger('click');
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('home');
    await buttons[1].trigger('click');
    // 禁用项不触发 select（除首次外无新增）
    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  test('插槽模式支持 SubMenu 展开与事件路径', async () => {
    const wrapper = mount(Menu, {
      props: { defaultActive: '1-1', defaultOpeneds: ['1'] },
      slots: {
        default: () =>
          h(SubMenu, { index: '1' }, { title: () => '导航一', default: () => h(MenuItem, { index: '1-1' }, () => '选项一') })
      }
    });
    expect(wrapper.find('.i-sub-menu.is-opened').exists()).toBe(true);
    expect(wrapper.find('.i-menu-item.is-active').exists()).toBe(true);
    await wrapper.find('.i-sub-menu__title').trigger('click');
    expect(wrapper.emitted('close')?.[0]).toEqual(['1', ['1']]);
    await wrapper.find('.i-sub-menu__title').trigger('click');
    expect(wrapper.emitted('open')?.[0]).toEqual(['1', ['1']]);
  });

  test('unique-opened 仅保留当前展开', async () => {
    const wrapper = mount(Menu, {
      props: {
        uniqueOpened: true,
        items: [
          { index: '1', label: '一', children: [{ index: '1-1', label: '1-1' }] },
          { index: '2', label: '二', children: [{ index: '2-1', label: '2-1' }] }
        ]
      }
    });
    const titles = wrapper.findAll('.i-sub-menu__title');
    await titles[0].trigger('click');
    expect(wrapper.emitted('open')?.[0]?.[0]).toBe('1');
    await titles[1].trigger('click');
    // 第二次展开后应只保留 2（实现中关闭其他）
    expect(wrapper.findAll('.i-sub-menu.is-opened')).toHaveLength(1);
  });

  test('键盘操作可选中', async () => {
    const wrapper = mount(Menu, {
      props: { items: [{ index: 'a', label: 'A' }] }
    });
    await wrapper.find('.i-menu-item__button').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('a');
  });

  test('暴露 open/close/updateActiveIndex', async () => {
    const wrapper = mount(Menu, {
      props: { items: [{ index: '1', label: '一', children: [{ index: '1-1', label: '1-1' }] }] }
    });
    const vm = wrapper.vm as unknown as {
      open: (index: string) => void;
      close: (index: string) => void;
      updateActiveIndex: (index?: string) => void;
    };
    vm.open('1');
    expect(wrapper.emitted('open')?.[0]?.[0]).toBe('1');
    vm.close('1');
    expect(wrapper.emitted('close')?.[0]?.[0]).toBe('1');
    vm.updateActiveIndex('1-1');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1-1']);
  });

  test('MenuItemGroup 渲染标题与子项', () => {
    const wrapper = mount(Menu, {
      slots: {
        default: () => h(MenuItemGroup, { title: '分组' }, () => h(MenuItem, { index: 'g-1' }, () => '子项'))
      }
    });
    expect(wrapper.find('.i-menu-item-group__title').text()).toBe('分组');
    expect(wrapper.find('.i-menu-item').exists()).toBe(true);
  });
});
