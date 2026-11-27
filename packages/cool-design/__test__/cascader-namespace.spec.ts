import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import Cascader from '../cascader';
import CascaderPanel from '../cascader-panel';
import ConfigProvider from '../config-provider';

const options = [
  { value: 'disabled', label: '禁用', disabled: true },
  { value: 'parent', label: '父级', children: [{ value: 'leaf', label: '子级' }] }
];

describe('Cascader namespace', () => {
  test('Cascader 和内嵌面板切换前缀时保留节点焦点与键盘选择', async () => {
    const namespace = ref('i');
    const onChange = vi.fn();
    const wrapper = mount({
      setup: () => () => h(ConfigProvider, { namespace: namespace.value, size: 'small' }, () =>
        h(Cascader, { options, onChange, teleported: false })
      )
    }, { attachTo: document.body });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger('keydown', { key: 'ArrowDown' });
      await control.trigger('keydown', { key: 'ArrowDown' });
      const node = wrapper.get('.i-cascader__node:not(.is-disabled)');
      expect(document.activeElement).toBe(node.element);

      namespace.value = 'acme';
      await nextTick();
      expect(wrapper.get('.acme-cascader.acme-control--small .acme-cascader__control').element).toBe(control.element);
      expect(wrapper.get('.acme-cascader__menus .acme-cascader__menu .acme-cascader__node:not(.is-disabled)').element).toBe(node.element);
      expect(document.activeElement).toBe(node.element);

      await node.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      const leaf = wrapper.get('.acme-cascader__menu:nth-child(2) .acme-cascader__node');
      expect(document.activeElement).toBe(leaf.element);
      await leaf.trigger('keydown', { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['parent', 'leaf']);
    } finally {
      wrapper.unmount();
    }
  });

  test('独立面板的列、复选框和节点插槽跟随 Provider', async () => {
    const onChange = vi.fn();
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: {
        default: () => h(CascaderPanel, { options, multiple: true, onChange }, {
          default: ({ data }) => h('strong', data.label)
        })
      }
    });
    try {
      const row = wrapper.get('.acme-cascader-panel.has-border .acme-cascader-panel__column .acme-cascader-panel__node:not(.is-disabled)');
      expect(row.get('.acme-cascader-panel__label strong').text()).toBe('父级');
      await row.get('.acme-cascader-panel__arrow').trigger('click');
      const columns = wrapper.findAll('.acme-cascader-panel__column');
      expect(columns).toHaveLength(2);
      await columns[1].get('input.acme-cascader-panel__checkbox').trigger('change');
      expect(onChange).toHaveBeenCalledWith([['parent', 'leaf']]);
    } finally {
      wrapper.unmount();
    }
  });

  test('传送到 body 的下拉面板读取最近主题并接受 popperStyle 覆盖', async () => {
    const wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { namespace: 'acme', theme: 'light', themeVars: { '--acme-color-primary': 'blue' } },
      slots: {
        default: () => h(ConfigProvider, { theme: 'dark', themeVars: { '--acme-color-primary': 'red' } }, () =>
          h(Cascader, {
            options,
            appendTo: 'body',
            popperClass: 'external-cascader',
            popperStyle: { '--acme-color-primary': 'green' }
          })
        )
      }
    });
    try {
      await wrapper.get('[role="combobox"]').trigger('click');
      const panel = document.querySelector<HTMLElement>('body > .external-cascader');
      expect(panel?.dataset.theme).toBe('dark');
      expect(panel?.classList.contains('acme-theme-scope')).toBe(true);
      expect(panel?.style.getPropertyValue('--acme-color-primary')).toBe('green');
    } finally {
      wrapper.unmount();
    }
    expect(document.querySelector('body > .external-cascader')).toBeNull();
  });
});
