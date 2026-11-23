import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import ConfigProvider from '../config-provider';
import { Dropdown, DropdownItem, DropdownMenu } from '../dropdown';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '../menu';
import Pagination from '../pagination';

test('菜单根、分组及传送子菜单随前缀更新并保留局部主题', async () => {
  const namespace = ref('acme');
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: 'outer', theme: 'light' }, () =>
      h(ConfigProvider, { namespace: namespace.value, theme: 'dark' }, () =>
        h(Menu, {
          mode: 'horizontal', menuTrigger: 'click', defaultActive: 'leaf',
          activeTextColor: 'red', backgroundColor: 'navy', textColor: 'white'
        }, () => h(SubMenu, { index: 'branch', popperClass: 'menu-user-panel' }, {
          title: () => '打开',
          default: () => h(MenuItemGroup, { title: '分组' }, () => h(MenuItem, { index: 'leaf' }, () => '选中'))
        }))
      )
    )
  }, { attachTo: document.body });
  try {
    expect(wrapper.get('.acme-menu > .acme-menu__list').exists()).toBe(true);
    await wrapper.get('.acme-sub-menu__title').trigger('click');
    const panel = wrapper.get('.acme-overlay-host .acme-sub-menu__popup.menu-user-panel');
    const leaf = panel.get('.acme-menu-item-group .acme-menu-item.is-active button');
    expect(panel.element).toHaveProperty('style.backgroundColor', 'navy');
    expect(panel.element).toHaveProperty('style.color', 'white');
    expect((panel.element as HTMLElement).style.getPropertyValue('--acme-menu-active-color')).toBe('red');

    namespace.value = 'i';
    await nextTick();
    expect(wrapper.get('.i-overlay-host .i-sub-menu__popup .i-menu-item-group .i-menu-item button').element).toBe(leaf.element);
    expect((panel.element as HTMLElement).style.getPropertyValue('--acme-menu-active-color')).toBe('');
    expect((panel.element as HTMLElement).style.getPropertyValue('--i-menu-active-color')).toBe('red');
  } finally {
    wrapper.unmount();
  }
});

test('下拉菜单切换至数字开头的前缀后仍通过键盘跳过禁用项并发送命令', async () => {
  const namespace = ref('i');
  const onCommand = vi.fn();
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: namespace.value, size: 'small' }, () =>
      h(Dropdown, { trigger: 'click', teleported: false, onCommand }, {
        default: () => h('button', { class: 'user-trigger' }, '打开'),
        dropdown: () => h(DropdownMenu, {}, () => [
          h(DropdownItem, { command: 'a' }, () => '甲'),
          h(DropdownItem, { disabled: true }, () => '禁用'),
          h(DropdownItem, { command: 'c', divided: true }, () => '丙')
        ])
      })
    )
  }, { attachTo: document.body, global: { stubs: { transition: false } } });
  try {
    await wrapper.get('.user-trigger').trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' });
    const items = wrapper.findAll('.i-dropdown__item-button');
    await vi.waitFor(() => expect(document.activeElement).toBe(items[0].element));
    namespace.value = '3d';
    await nextTick();
    expect(document.activeElement).toBe(items[0].element);
    expect(items[0].element.classList.contains('3d-dropdown__item-button')).toBe(true);
    await items[0].trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' });
    expect(document.activeElement).toBe(items[2].element);
    expect(items[2].element.parentElement?.classList.contains('3d-dropdown__item')).toBe(true);
    await items[2].trigger('keydown', { key: 'Enter', code: 'Enter' });
    expect(onCommand).toHaveBeenCalledWith('c', expect.anything(), expect.any(KeyboardEvent));
  } finally {
    wrapper.unmount();
  }
});

test.each([['i', 'acme'], ['acme', 'i']])('下拉菜单在 %s → %s 插槽内聚焦实际菜单并兼容原生菜单包装', async (outer, inner) => {
  const namespace = ref(inner);
  const onCommand = vi.fn();
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: outer }, () =>
      h(Dropdown, { trigger: 'click', teleported: false, onCommand }, {
        default: () => h('button', { id: 'nested-trigger' }, '打开'),
        dropdown: () => [
          h('button', { id: 'unrelated-button', role: 'menuitem' }, '无关按钮'),
          h(ConfigProvider, { namespace: namespace.value }, () =>
            h(DropdownMenu, {}, () => [
              h(DropdownItem, { command: 'first', id: 'nested-first' }, () => '甲'),
              h(DropdownItem, { disabled: true }, () => '禁用'),
              h(DropdownItem, { command: 'last', id: 'nested-last' }, () => '乙')
            ])
          ),
          h('div', { class: outer + '-dropdown__menu' }, [h('button', { id: 'native-item' }, '原生项')])
        ]
      })
    )
  }, { attachTo: document.body, global: { stubs: { transition: false } } });
  try {
    await wrapper.get('#nested-trigger').trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' });
    const first = wrapper.get('#nested-first button');
    const last = wrapper.get('#nested-last button');
    await vi.waitFor(() => expect(document.activeElement).toBe(first.element), { timeout: 500 });
    namespace.value = '3d';
    await nextTick();
    expect(document.activeElement).toBe(first.element);
    await first.trigger('keydown', { key: 'End', code: 'End' });
    const native = wrapper.get('#native-item');
    expect(document.activeElement).toBe(native.element);
    await native.trigger('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
    expect(document.activeElement).toBe(last.element);
    await last.trigger('keydown', { key: 'Enter', code: 'Enter' });
    expect(onCommand).toHaveBeenCalledWith('last', expect.anything(), expect.any(KeyboardEvent));
  } finally {
    wrapper.unmount();
  }
});

test('菜单项为不同前缀的行内与传送内容保留所属菜单选中色', async () => {
  const namespace = ref('acme');
  const color = ref('#ee4411');
  const wrapper = mount({
    setup: () => () => h(ConfigProvider, { namespace: 'i' }, () => [
      h(Menu, { activeTextColor: color.value, defaultActive: 'leaf' }, () =>
        h(ConfigProvider, { namespace: namespace.value }, () => h(MenuItem, { index: 'leaf', id: 'inline-leaf' }))
      ),
      h(Menu, { activeTextColor: color.value, defaultActive: 'leaf', mode: 'horizontal', menuTrigger: 'click' }, () =>
        h(ConfigProvider, { namespace: namespace.value }, () => h(SubMenu, {
          index: 'branch', popperClass: 'mixed-menu-panel',
          popperStyle: [{ '--acme-menu-active-color': 'navy' }, { '--i-menu-active-color': undefined }]
        }, { default: () => h(MenuItem, { index: 'leaf', id: 'popup-leaf' }) }))
      )
    ])
  }, { attachTo: document.body });
  try {
    const inline = wrapper.get<HTMLElement>('#inline-leaf');
    await wrapper.get('.acme-sub-menu__title').trigger('click');
    const panel = wrapper.get<HTMLElement>('.acme-overlay-host .mixed-menu-panel');
    const popup = panel.get<HTMLElement>('#popup-leaf');
    const readFallback = (node: HTMLElement) => node.style.getPropertyValue('--acme-menu-active-color-fallback');
    expect(readFallback(inline.element)).toBe('var(--i-menu-active-color, #ee4411)');
    expect(readFallback(popup.element)).toBe('var(--i-menu-active-color, #ee4411)');
    expect(panel.element.style.getPropertyValue('--acme-menu-active-color')).toBe('navy');

    color.value = 'red';
    await nextTick();
    expect(readFallback(popup.element)).toBe('var(--i-menu-active-color, red)');
    namespace.value = 'i';
    await nextTick();
    expect(readFallback(inline.element)).toBe('');
    expect(readFallback(popup.element)).toBe('');
  } finally {
    wrapper.unmount();
  }
});

test('分页尺寸及传送的 Select 保留旧修饰符和调用方样式', async () => {
  const host = document.createElement('section');
  host.id = 'namespace-pagination-host';
  document.body.append(host);
  const wrapper = mount(ConfigProvider, {
    attachTo: document.body,
    props: { namespace: 'acme', size: 'small', theme: 'dark' },
    slots: {
      default: () => h(Pagination, {
        total: 100, layout: 'sizes, pager', appendSizeTo: '#namespace-pagination-host',
        popperClass: 'user-pagination-panel', popperStyle: { '--acme-primary': 'red' }
      })
    }
  });
  try {
    expect(wrapper.get('.acme-pagination--small .acme-pagination__pager button.is-active').text()).toBe('1');
    await wrapper.get('.acme-pagination__sizes .acme-select [role="combobox"]').trigger('click');
    const panel = host.querySelector<HTMLElement>('.acme-select__dropdown.user-pagination-panel');
    expect(panel?.dataset.theme).toBe('dark');
    expect(panel?.style.getPropertyValue('--acme-primary')).toBe('red');
  } finally {
    wrapper.unmount();
    expect(host.children).toHaveLength(0);
    host.remove();
  }
});
