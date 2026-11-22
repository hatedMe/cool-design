import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { ConfigProvider, Tree, TreeSelect, TreeV2 } from '../index';

describe('树形组件的命名空间', () => {
  test('Tree 与 TreeV2 使用最近 Provider 的前缀并保留节点状态', async () => {
    const data = [{ id: 1, label: '节点' }];
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: { default: () => [h(Tree, { data, showCheckbox: true }), h(TreeV2, { data, showCheckbox: true })] }
    });
    try {
      const tree = wrapper.get('.acme-tree__checkbox');
      const treeV2 = wrapper.get('.acme-tree-v2__checkbox');
      await tree.setValue(true);
      await treeV2.setValue(true);
      await wrapper.setProps({ namespace: 'brand' });
      expect(wrapper.get('.brand-tree__checkbox').element).toBe(tree.element);
      expect(wrapper.get('.brand-tree-v2__checkbox').element).toBe(treeV2.element);
      expect((tree.element as HTMLInputElement).checked).toBe(true);
      expect((treeV2.element as HTMLInputElement).checked).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });

  test('打开的 TreeSelect 切换前缀后仍可使用 Enter 选择节点', async () => {
    const onChange = vi.fn();
    const wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { namespace: 'i', size: 'small' },
      slots: { default: () => h(TreeSelect, { data: [{ value: 1, label: '候选' }], teleported: false, onChange }) }
    });
    try {
      await wrapper.get('[role="combobox"]').trigger('click');
      const node = wrapper.get('[role="treeitem"]');
      (node.element as HTMLElement).focus();
      await wrapper.setProps({ namespace: 'acme', size: 'large' });
      await node.trigger('keydown', { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(1);
      expect(wrapper.get('.acme-tree-select--large .acme-select.acme-control--large').exists()).toBe(true);
      expect(node.get('.acme-tree__content').text()).toBe('候选');
    } finally {
      wrapper.unmount();
    }
  });
});
