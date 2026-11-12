import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import Tree from '..';
import * as CoolDesign from '../../index';
import type { TreeData, TreeExposed, TreeNode } from '../types';

const basicData = (): TreeData[] => [
  {
    id: 1,
    label: '一级 1',
    children: [
      { id: 11, label: '二级 1-1', children: [{ id: 111, label: '三级 1-1-1' }] },
      { id: 12, label: '二级 1-2' }
    ]
  },
  { id: 2, label: '一级 2', children: [{ id: 21, label: '二级 2-1' }] }
];

const isHiddenByCollapse = (el: HTMLElement): boolean => {
  let cursor: HTMLElement | null = el;
  while (cursor) {
    if (cursor.classList?.contains('i-tree__children') && cursor.style.display === 'none') return true;
    cursor = cursor.parentElement;
  }
  return false;
};
const labels = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll('.i-tree__content .i-tree__text')
    .filter((node) => !isHiddenByCollapse(node.element as HTMLElement))
    .map((node) => node.text());
const contents = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-tree__content');
const checkboxes = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-tree__checkbox');
const exposedOf = (wrapper: ReturnType<typeof mount>) => wrapper.vm as unknown as TreeExposed;

describe('Tree', () => {
  test('公开导出与全局安装一致', () => {
    expect(Tree).toBeDefined();
    expect(CoolDesign.Tree).toBe(Tree);
  });

  test('基础渲染与点击展开收起', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id' } });
    expect(labels(wrapper)).toEqual(['一级 1', '一级 2']);
    await contents(wrapper)[0].trigger('click');
    expect(wrapper.emitted('node-click')).toHaveLength(1);
    expect(wrapper.emitted('node-expand')?.[0][0]).toMatchObject({ id: 1 });
    expect(labels(wrapper)).toContain('二级 1-1');
    await contents(wrapper)[0].trigger('click');
    expect(wrapper.emitted('node-collapse')?.[0][0]).toMatchObject({ id: 1 });
  });

  test('default-expand-all 展开全部', () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultExpandAll: true } });
    expect(labels(wrapper)).toContain('三级 1-1-1');
  });

  test('default-expanded-keys 与 auto-expand-parent', () => {
    const withParent = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', defaultExpandedKeys: [11] }
    });
    expect(labels(withParent)).toContain('三级 1-1-1');
    const withoutParent = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', defaultExpandedKeys: [11], autoExpandParent: false }
    });
    expect(labels(withoutParent)).not.toContain('二级 1-1');
  });

  test('accordion 同级只保留一个展开', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', accordion: true } });
    const contentByText = (text: string) =>
      contents(wrapper).find((node) => node.text().includes(text))!;
    await contentByText('一级 1').trigger('click');
    await contentByText('一级 2').trigger('click');
    expect(labels(wrapper)).toContain('二级 2-1');
    expect(labels(wrapper)).not.toContain('二级 1-1');
    expect(wrapper.emitted('node-collapse')).toBeDefined();
  });

  test('expand-on-click-node 为 false 时点击内容不展开', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', expandOnClickNode: false }
    });
    await contents(wrapper)[0].trigger('click');
    expect(labels(wrapper)).toEqual(['一级 1', '一级 2']);
    await wrapper.find('.i-tree__expand-icon').trigger('click');
    expect(labels(wrapper)).toContain('二级 1-1');
  });

  test('props 映射 label(children(disabled', async () => {
    const data = [{ key: 'a', name: '自定义', subs: [{ key: 'b', name: '子', forbid: true }] }];
    const wrapper = mount(Tree, {
      props: {
        data,
        nodeKey: 'key',
        props: { label: 'name', children: 'subs', disabled: 'forbid' },
        showCheckbox: true,
        defaultExpandAll: true
      }
    });
    expect(labels(wrapper)).toEqual(['自定义', '子']);
    expect(checkboxes(wrapper)[1].attributes('disabled')).toBeDefined();
  });

  test('props.label 支持函数', () => {
    const wrapper = mount(Tree, {
      props: {
        data: [{ id: 1, label: '原始' }],
        nodeKey: 'id',
        props: { label: (item: TreeData) => `前缀-${item.label}` }
      }
    });
    expect(labels(wrapper)).toEqual(['前缀-原始']);
  });

  test('复选框级联与半选', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, defaultExpandAll: true }
    });
    await checkboxes(wrapper)[0].setValue(true);
    const exposed = exposedOf(wrapper);
    expect(exposed.getCheckedKeys().sort()).toEqual([1, 11, 111, 12].sort());
    expect(wrapper.emitted('check-change')).toBeDefined();
    const checkPayload = wrapper.emitted('check')?.[0] as unknown as [TreeData, { checkedKeys: unknown[] }];
    expect(checkPayload[1].checkedKeys).toContain(1);
    await checkboxes(wrapper)[2].setValue(false);
    expect(exposed.getHalfCheckedKeys()).toContain(1);
    expect((checkboxes(wrapper)[0].element as HTMLInputElement).indeterminate).toBe(true);
  });

  test('check-strictly 不级联', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, checkStrictly: true, defaultExpandAll: true }
    });
    await checkboxes(wrapper)[0].setValue(true);
    expect(exposedOf(wrapper).getCheckedKeys()).toEqual([1]);
  });

  test('叶节点点击默认勾选，可通过 check-on-click-leaf 关闭', async () => {
    const wrapper = mount(Tree, {
      props: { data: [{ id: 1, label: '叶节点' }], nodeKey: 'id', showCheckbox: true }
    });
    await contents(wrapper)[0].trigger('click');
    expect(exposedOf(wrapper).getCheckedKeys()).toEqual([1]);
    await wrapper.setProps({ checkOnClickLeaf: false });
    await contents(wrapper)[0].trigger('click');
    expect(exposedOf(wrapper).getCheckedKeys()).toEqual([1]);
  });

  test('setChecked 的 deep 在 check-strictly 下仍可级联', () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, checkStrictly: true }
    });
    exposedOf(wrapper).setChecked(1, true, true);
    expect(exposedOf(wrapper).getCheckedKeys().sort()).toEqual([1, 11, 12, 111].sort());
  });

  test('props.class 支持静态值与函数', () => {
    const wrapper = mount(Tree, {
      props: {
        data: [{ id: 1, label: '节点' }],
        nodeKey: 'id',
        props: { class: (data: TreeData) => ({ 'is-custom': data.id === 1 }) }
      }
    });
    expect(wrapper.find('.i-tree__node').classes()).toContain('is-custom');
  });

  test('default-checked-keys 初始化级联', () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, defaultExpandAll: true, defaultCheckedKeys: [11] }
    });
    const exposed = exposedOf(wrapper);
    expect(exposed.getCheckedKeys().sort()).toEqual([11, 111].sort());
    expect(exposed.getHalfCheckedKeys()).toEqual([1]);
  });

  test('禁用节点不可勾选', async () => {
    const data = [{ id: 1, label: '父', children: [{ id: 2, label: '禁', disabled: true }] }];
    const wrapper = mount(Tree, { props: { data, nodeKey: 'id', showCheckbox: true, defaultExpandAll: true } });
    await checkboxes(wrapper)[1].setValue(true);
    expect(wrapper.emitted('check-change')).toBeUndefined();
    expect(exposedOf(wrapper).getCheckedKeys()).toEqual([]);
  });

  test('全局 disabled 禁用勾选与当前节点', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, disabled: true, defaultExpandAll: true, highlightCurrent: true }
    });
    await checkboxes(wrapper)[0].setValue(true);
    await contents(wrapper)[0].trigger('click');
    expect(wrapper.emitted('check-change')).toBeUndefined();
    expect(wrapper.emitted('current-change')).toBeUndefined();
  });

  test('check-on-click-node 点击内容勾选', async () => {
    const wrapper = mount(Tree, {
      props: { data: [{ id: 1, label: '单节点' }], nodeKey: 'id', showCheckbox: true, checkOnClickNode: true }
    });
    await contents(wrapper)[0].trigger('click');
    expect(exposedOf(wrapper).getCheckedKeys()).toEqual([1]);
  });

  test('当前节点高亮与 current-change', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', highlightCurrent: true, defaultExpandAll: true }
    });
    await contents(wrapper)[1].trigger('click');
    expect(wrapper.emitted('current-change')?.[0][0]).toMatchObject({ id: 11 });
    expect(contents(wrapper)[1].classes()).toContain('is-current');
    const exposed = exposedOf(wrapper);
    expect(exposed.getCurrentKey()).toBe(11);
    expect(exposed.getCurrentNode()).toMatchObject({ id: 11 });
    exposed.setCurrentKey(2);
    await nextTick();
    expect(exposed.getCurrentKey()).toBe(2);
    exposed.setCurrentNode(null);
    await nextTick();
    expect(exposed.getCurrentKey()).toBeNull();
  });

  test('current-node-key 受控更新', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', currentNodeKey: 1 } });
    expect(exposedOf(wrapper).getCurrentKey()).toBe(1);
    await wrapper.setProps({ currentNodeKey: 2 });
    expect(exposedOf(wrapper).getCurrentKey()).toBe(2);
  });

  test('default-current-key 初始化', () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultCurrentKey: 2 } });
    expect(exposedOf(wrapper).getCurrentKey()).toBe(2);
  });

  test('filter 过滤节点', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: basicData(),
        nodeKey: 'id',
        defaultExpandAll: true,
        filterNodeMethod: (value: string, item: TreeData) => String(item.label).includes(value)
      }
    });
    exposedOf(wrapper).filter('三级');
    await nextTick();
    expect(labels(wrapper)).toEqual(['一级 1', '二级 1-1', '三级 1-1-1']);
    exposedOf(wrapper).filter('');
    await nextTick();
    expect(labels(wrapper)).toContain('一级 2');
  });

  test('无 filter-method 时默认按 label 过滤', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultExpandAll: true } });
    exposedOf(wrapper).filter('一级 2');
    await nextTick();
    expect(labels(wrapper)).toEqual(['一级 2', '二级 2-1']);
  });

  test('filterable 内置搜索框', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultExpandAll: true, filterable: true } });
    await wrapper.get('.i-tree__filter').setValue('一级 2');
    expect(labels(wrapper)).toEqual(['一级 2', '二级 2-1']);
  });

  test('空态 empty-text 与 empty 插槽', () => {
    const empty = mount(Tree, { props: { data: [], nodeKey: 'id', emptyText: '没有数据' } });
    expect(empty.find('.i-tree__empty').text()).toBe('没有数据');
    const Host = defineComponent({
      components: { Tree },
      setup: () => () => h(Tree, { data: [], nodeKey: 'id' }, { empty: () => '自定义空' })
    });
    expect(mount(Host).find('.i-tree').text()).toContain('自定义空');
  });

  test('default 与 icon 插槽', () => {
    const Host = defineComponent({
      components: { Tree },
      setup: () =>
        () =>
          h(
            Tree,
            { data: basicData(), nodeKey: 'id' },
            {
              default: ({ data }: { data: TreeData }) => `节点-${data.label}`,
              icon: () => h('span', { class: 'custom-icon' }, 'X')
            }
          )
    });
    const wrapper = mount(Host);
    expect(wrapper.text()).toContain('节点-一级 1');
    expect(wrapper.findAll('.custom-icon')).toHaveLength(2);
  });

  test('懒加载 load 与 updateKeyChildren', async () => {
    const load = vi.fn((node: TreeNode, resolve: (children: TreeData[]) => void) => {
      resolve([{ id: `${node.key}-child`, label: '懒子节点', isLeaf: true }]);
    });
    const wrapper = mount(Tree, { props: { data: [{ id: 1, label: '懒父' }], nodeKey: 'id', lazy: true, load } });
    await wrapper.find('.i-tree__expand-icon').trigger('click');
    await nextTick();
    expect(load).toHaveBeenCalled();
    expect(labels(wrapper)).toContain('懒子节点');
    exposedOf(wrapper).updateKeyChildren(1, [{ id: 99, label: '替换子', isLeaf: true }]);
    await nextTick();
    expect(labels(wrapper)).toContain('替换子');
  });

  test('getNode 支持 key(data(节点三种入参', () => {
    const data = basicData();
    const wrapper = mount(Tree, { props: { data, nodeKey: 'id' } });
    const exposed = exposedOf(wrapper);
    expect(exposed.getNode(1)?.data).toMatchObject({ id: 1 });
    expect(exposed.getNode(data[0])?.key).toBe(1);
    const node = exposed.getNode(1);
    expect(exposed.getNode(node as TreeNode)?.key).toBe(1);
    expect(exposed.getNode(9999)).toBeNull();
  });

  test('setCheckedKeys(setCheckedNodes(setChecked', () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, defaultExpandAll: true }
    });
    const exposed = exposedOf(wrapper);
    exposed.setCheckedKeys([11]);
    expect(exposed.getCheckedKeys().sort()).toEqual([11, 111].sort());
    exposed.setCheckedNodes([{ id: 2 } as TreeData]);
    expect(exposed.getCheckedKeys().sort()).toEqual([2, 21].sort());
    exposed.setChecked(1, true, false);
    expect(exposed.getCheckedKeys()).toContain(1);
    expect(wrapper.emitted('check')).toBeDefined();
  });

  test('getCheckedNodes leafOnly 与 includeHalfChecked', () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, defaultExpandAll: true, defaultCheckedKeys: [11] }
    });
    const exposed = exposedOf(wrapper);
    expect(exposed.getCheckedNodes(true).map((item) => item.id)).toEqual([111]);
    expect(exposed.getCheckedNodes(false, true).map((item) => item.id).sort()).toEqual([1, 11, 111].sort());
    expect(exposed.getHalfCheckedNodes().map((item) => item.id)).toEqual([1]);
    expect(exposed.getHalfCheckedKeys()).toEqual([1]);
  });

  test('expandAll(expandNode(collapseNode', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id' } });
    const exposed = exposedOf(wrapper);
    exposed.expandAll();
    await nextTick();
    expect(labels(wrapper)).toContain('三级 1-1-1');
    exposed.collapseNode(1);
    await nextTick();
    expect(labels(wrapper)).not.toContain('二级 1-1');
    exposed.expandNode(1);
    await nextTick();
    expect(labels(wrapper)).toContain('二级 1-1');
    exposed.expandAll(false);
    await nextTick();
    expect(labels(wrapper)).toEqual(['一级 1', '一级 2']);
  });

  test('remove(append(insertBefore(insertAfter', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultExpandAll: true } });
    const exposed = exposedOf(wrapper);
    exposed.append({ id: 99, label: '新增' }, 2);
    await nextTick();
    expect(labels(wrapper)).toContain('新增');
    exposed.insertBefore({ id: 98, label: '之前' }, 99);
    await nextTick();
    expect(labels(wrapper).indexOf('之前')).toBeLessThan(labels(wrapper).indexOf('新增'));
    exposed.insertAfter({ id: 97, label: '之后' }, 99);
    await nextTick();
    expect(labels(wrapper).indexOf('之后')).toBeGreaterThan(labels(wrapper).indexOf('新增'));
    exposed.remove(99);
    await nextTick();
    expect(labels(wrapper)).not.toContain('新增');
  });

  test('render-after-expand 控制子节点渲染时机', async () => {
    const lazyRender = mount(Tree, { props: { data: basicData(), nodeKey: 'id', renderAfterExpand: true } });
    expect(lazyRender.findAll('.i-tree__children')).toHaveLength(0);
    const eagerRender = mount(Tree, { props: { data: basicData(), nodeKey: 'id', renderAfterExpand: false } });
    expect(eagerRender.findAll('.i-tree__children').length).toBeGreaterThan(0);
    expect((eagerRender.find('.i-tree__children').element as HTMLElement).style.display).toBe('none');
  });

  test('indent 影响缩进', () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id', defaultExpandAll: true, indent: 30 } });
    const second = contents(wrapper)[1].element as HTMLElement;
    expect(second.style.paddingLeft).toBe('38px');
  });

  test('node-contextmenu 事件', async () => {
    const wrapper = mount(Tree, { props: { data: basicData(), nodeKey: 'id' } });
    await contents(wrapper)[0].trigger('contextmenu');
    expect(wrapper.emitted('node-contextmenu')).toHaveLength(1);
  });

  test('拖拽 allow-drag 与 allow-drop', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: basicData(),
        nodeKey: 'id',
        draggable: true,
        defaultExpandAll: true,
        allowDrag: (node: TreeNode) => node.key !== 1,
        allowDrop: () => false
      }
    });
    expect(contents(wrapper)[0].attributes('draggable')).toBe('false');
    await contents(wrapper)[1].trigger('dragstart');
    expect(wrapper.emitted('node-drag-start')).toHaveLength(1);
    await contents(wrapper)[2].trigger('dragover');
    expect(wrapper.emitted('node-drop')).toBeUndefined();
  });

  test('拖拽 inner 放置移动节点并触发 node-drop', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', draggable: true, defaultExpandAll: true }
    });
    const exposed = exposedOf(wrapper);
    const dragEl = contents(wrapper).find((node) => node.text().includes('二级 2-1'));
    const dropEl = contents(wrapper).find((node) => node.text().includes('二级 1-2'));
    await dragEl!.trigger('dragstart');
    await dropEl!.trigger('dragover');
    await dropEl!.trigger('drop');
    expect(wrapper.emitted('node-drop')).toHaveLength(1);
    const moved = exposed.getNode(21);
    expect(moved?.parent?.key).toBe(12);
  });

  test('data 变化保留展开与勾选', async () => {
    const wrapper = mount(Tree, {
      props: { data: basicData(), nodeKey: 'id', showCheckbox: true, defaultExpandAll: true, defaultCheckedKeys: [11] }
    });
    await wrapper.setProps({ data: [...basicData(), { id: 3, label: '一级 3' }] });
    expect(labels(wrapper)).toContain('三级 1-1-1');
    expect(exposedOf(wrapper).getCheckedKeys()).toContain(111);
  });
});
