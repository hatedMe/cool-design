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

  test.each(['acme', '3d'])('打开的 TreeSelect 切换到 %s 后仍可使用 Enter 选择节点', async (namespace) => {
    const onChange = vi.fn();
    const onNodeClick = vi.fn();
    const wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { namespace: 'i', size: 'small' },
      slots: { default: () => h(TreeSelect, { data: [{ value: 1, label: '候选' }], teleported: false, onChange, onNodeClick }) }
    });
    try {
      await wrapper.get('[role="combobox"]').trigger('click');
      const node = wrapper.get('[role="treeitem"]');
      const element = node.element as HTMLElement;
      element.tabIndex = -1;
      element.focus();
      await wrapper.setProps({ namespace, size: 'large' });
      expect(document.activeElement).toBe(node.element);
      await node.trigger('keydown', { key: 'Enter' });
      expect(onChange.mock.calls).toEqual([[1]]);
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      expect(wrapper.findComponent(TreeSelect).classes()).toContain(`${namespace}-tree-select--large`);
      expect(wrapper.get('[role="combobox"]').element.parentElement?.classList.contains(`${namespace}-control--large`)).toBe(true);
      expect(node.element.getElementsByClassName(`${namespace}-tree__content`)[0]?.textContent).toBe('候选');
    } finally {
      wrapper.unmount();
    }
  });
});
