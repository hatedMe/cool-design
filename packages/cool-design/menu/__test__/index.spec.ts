import { h } from 'vue';
import { DOMWrapper, enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import Menu from '../index';
import MenuItem from '../menu-item';
import SubMenu from '../sub-menu';
import MenuItemGroup from '../menu-item-group';

// 折叠弹层默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
enableAutoUnmount(afterEach);
const doc = () => new DOMWrapper(document.body);

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

  test('折叠模式：一级子菜单通过弹层展开并可选中子项', async () => {
    const wrapper = mount(Menu, {
      props: {
        collapse: true,
        items: [
          { index: '1', label: '导航一', children: [{ index: '1-1', label: '选项一' }, { index: '1-2', label: '选项二' }] },
          { index: 'home', label: '首页' }
        ]
      }
    });
    // 折叠时不渲染内联 children
    expect(wrapper.find('.i-sub-menu__children').exists()).toBe(false);
    // hover 一级子菜单标题打开弹层
    await wrapper.findAll('.i-sub-menu')[0].trigger('mouseenter');
    await new Promise((resolve) => setTimeout(resolve, 350));
    const popup = doc().find('.i-sub-menu__popup');
    expect(popup.exists()).toBe(true);
    expect(popup.find('.i-sub-menu__popup-title').text()).toBe('导航一');
    // 弹层内点击叶子项触发 select 并自动收起
    await popup.findAll('.i-menu-item__button')[0].trigger('click');
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('1-1');
    expect(doc().find('.i-sub-menu__popup').isVisible()).toBe(false);
  });

  test('折叠模式：一级菜单项显示 Tooltip 提示', async () => {
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: {
        collapse: true,
        items: [
          { index: 'home', label: '首页' },
          { index: '1', label: '导航一', children: [{ index: '1-1', label: '选项一' }] }
        ]
      }
    });
    const item = wrapper.findAll('.i-menu-item')[0];
    // 一级菜单项被 Tooltip 包裹
    expect(item.find('.i-tooltip__trigger').exists()).toBe(true);
    await item.find('.i-tooltip__trigger').trigger('mouseenter');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('.i-tooltip:not([aria-hidden])')?.textContent).toBe('首页');
    // 子菜单内的菜单项不包 Tooltip
    await wrapper.findAll('.i-sub-menu')[0].trigger('mouseenter');
    await new Promise((resolve) => setTimeout(resolve, 350));
    const popupItem = doc().find('.i-sub-menu__popup .i-menu-item');
    expect(popupItem.find('.i-tooltip__trigger').exists()).toBe(false);
  });

  test('折叠模式：键盘 Enter 切换弹层', async () => {
    const wrapper = mount(Menu, {
      props: {
        collapse: true,
        items: [{ index: '1', label: '导航一', children: [{ index: '1-1', label: '选项一' }] }]
      }
    });
    await wrapper.find('.i-sub-menu__title').trigger('keydown', { key: 'Enter' });
    expect(doc().find('.i-sub-menu__popup').exists()).toBe(true);
    await wrapper.find('.i-sub-menu__title').trigger('keydown', { key: 'Escape' });
    expect(doc().find('.i-sub-menu__popup').isVisible()).toBe(false);
  });

  test('折叠弹层支持菜单级偏移、主题与类名配置', async () => {
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: {
        collapse: true,
        popperOffset: 12,
        popperEffect: 'dark',
        popperClass: 'menu-scope',
        teleported: true,
        showTimeout: 0,
        hideTimeout: 0,
        items: [{ index: '1', label: '导航一', children: [{ index: '1-1', label: '选项一' }] }]
      }
    });
    await wrapper.findAll('.i-sub-menu')[0].trigger('mouseenter');
    await new Promise((resolve) => setTimeout(resolve, 20));
    const popup = doc().find('.menu-scope');
    expect(popup.exists()).toBe(true);
    expect(popup.classes()).toContain('i-sub-menu__popup--dark');

    // teleported=false 时弹层保留在组件内部
    const inline = mount(Menu, {
      props: {
        collapse: true,
        teleported: false,
        showTimeout: 0,
        items: [{ index: '1', label: '导航一', children: [{ index: '1-1', label: '选项一' }] }]
      }
    });
    await inline.findAll('.i-sub-menu')[0].trigger('mouseenter');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(inline.find('.i-sub-menu__popup').exists()).toBe(true);
  });
});
