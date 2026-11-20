import { mount } from '@vue/test-utils';
import { nextTick, toRaw } from 'vue';
import { describe, expect, test } from 'vitest';
import TreeV2 from '..';
import type { TreeV2Data, TreeV2Exposed, TreeV2Node } from '..';

const data = () => [
  {
    id: 'a',
    label: 'A',
    children: [
      { id: 'a1', label: 'A1', children: [{ id: 'a1x', label: 'A1x' }] },
      { id: 'a2', label: 'A2' }
    ]
  },
  { id: 'b', label: 'B', disabled: true }
];

const rows = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-tree-v2__row');
const checks = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('input.i-tree-v2__checkbox').map((item) => item.element as HTMLInputElement);

const toggleCheck = async (wrapper: ReturnType<typeof mount>, index: number) => {
  checks(wrapper)[index].click();
  await wrapper.findAll('input.i-tree-v2__checkbox')[index].trigger('change');
};

describe('test `TreeV2` component', () => {
  test('展开收起触发事件，虚拟滚动只渲染窗口行', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), height: 200, itemSize: 26, expandOnClickNode: false }
    });
    expect(rows(wrapper)).toHaveLength(2);

    await wrapper.findAll('.i-tree-v2__expand')[0].trigger('click');
    expect(wrapper.emitted('node-expand')).toHaveLength(1);
    expect(rows(wrapper)).toHaveLength(4);

    await wrapper.findAll('.i-tree-v2__expand')[0].trigger('click');
    expect(wrapper.emitted('node-collapse')).toHaveLength(1);
    expect(rows(wrapper)).toHaveLength(2);

    const big = mount(TreeV2, {
      props: {
        data: Array.from({ length: 50 }, (_, index) => ({ id: index, label: `N${index}` })),
        height: 200,
        itemSize: 26
      }
    });
    expect(rows(big).length).toBeLessThan(20);
    expect(big.find('.i-tree-v2__row').exists()).toBe(true);
  });

  test('node-click 与当前节点高亮', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), highlightCurrent: true, expandOnClickNode: false }
    });
    await rows(wrapper)[0].trigger('click');
    expect(wrapper.emitted('node-click')![0][0]).toMatchObject({ id: 'a' });
    expect(rows(wrapper)[0].classes()).toContain('is-current');

    const api = wrapper.vm as unknown as {
      setCurrentKey: (key: string) => void;
      getCurrentKey: () => string;
      getCurrentNode: () => { id: string };
    };
    api.setCurrentKey('b');
    await nextTick();
    expect(api.getCurrentKey()).toBe('b');
    expect(api.getCurrentNode()).toMatchObject({ id: 'b' });
    expect(rows(wrapper)[1].classes()).toContain('is-current');
  });

  test('复选框级联勾选与 check 事件，checkStrictly 解耦', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, defaultExpandedKeys: ['a', 'a1'] }
    });
    await toggleCheck(wrapper, 0);
    const payload = wrapper.emitted('check')!.at(-1)![1] as { checkedKeys: string[] };
    expect(payload.checkedKeys).toEqual(['a', 'a1', 'a1x', 'a2']);

    const strict = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, checkStrictly: true }
    });
    await toggleCheck(strict, 0);
    const strictPayload = strict.emitted('check')!.at(-1)![1] as { checkedKeys: string[] };
    expect(strictPayload.checkedKeys).toEqual(['a']);
  });

  test.each([[undefined, 'true'], [false, 'false']] as const)('叶节点点击按 checkOnClickLeaf=%s 切换勾选', async (value, checked) => {
    const wrapper = mount(TreeV2, {
      props: { data: [{ id: 1, label: '叶节点' }], showCheckbox: true, checkOnClickLeaf: value }
    });
    await rows(wrapper)[0].trigger('click');
    expect(rows(wrapper)[0].attributes('aria-checked')).toBe(checked);
    await rows(wrapper)[0].trigger('click');
    expect(rows(wrapper)[0].attributes('aria-checked')).toBe('false');
  });

  test('默认插槽提供节点及对应的原始数据', () => {
    const item = { id: 1, label: 'Label', detail: 'Detail' };
    const wrapper = mount(TreeV2, {
      props: { data: [item] },
      slots: {
        default: ({ node, data }: { node: TreeV2Node; data?: TreeV2Data }) =>
          `${node.key}: ${data?.detail} (${data === node.data})`
      }
    });
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('1: Detail (true)');
  });

  test('setData 替换节点并按键保留当前、勾选和活动展开', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, defaultCheckedKeys: ['a2'], defaultExpandedKeys: ['a'] }
    });
    await rows(wrapper)[1].trigger('click');
    await rows(wrapper)[2].trigger('click');
    const api = wrapper.vm as unknown as TreeV2Exposed;
    const current = { id: 'a1x', label: '新 A1x' };
    const replacement = [
      {
        id: 'a',
        label: '新 A',
        children: [
          { id: 'a1', label: '新 A1', children: [current] },
          { id: 'a2', label: '新 A2' },
          { id: 'a3', label: '新 A3' }
        ]
      }
    ];
    expect(api.setData).toBeTypeOf('function');
    api.setData(replacement);
    expect(api.getCurrentKey()).toBe('a1x');
    expect(toRaw(api.getCurrentNode())).toBe(current);
    await nextTick();
    expect(api.getCheckedKeys()).toEqual(['a1', 'a1x', 'a2']);
    expect(api.getHalfCheckedKeys()).toEqual(['a']);
    expect(rows(wrapper).map((row) => row.text())).toContain('新 A1x');

    api.setData([]);
    expect(api.getCurrentKey()).toBe('a1x');
    expect(api.getCurrentNode()).toBeNull();
    expect(api.getCheckedKeys()).toEqual([]);
    api.setData(replacement);
    expect(api.getCheckedKeys()).toEqual(['a1', 'a1x', 'a2']);
    await nextTick();
    expect(rows(wrapper).map((row) => row.text())).toContain('新 A1x');
  });

  test('data 属性替换恢复默认展开，同时保留当前和勾选节点', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, defaultExpandedKeys: ['a'] }
    });
    await rows(wrapper)[1].trigger('click');
    await rows(wrapper)[2].trigger('click');
    await wrapper.setProps({ data: data() });
    const api = wrapper.vm as unknown as {
      getCurrentKey: () => string;
      getCheckedKeys: () => string[];
      getExpandedKeys: () => string[];
    };
    expect(api.getExpandedKeys()).toEqual(['a']);
    expect(api.getCurrentKey()).toBe('a1x');
    expect(api.getCheckedKeys()).toEqual(['a1', 'a1x']);
  });

  test('连续 setData 只对最终数据应用默认勾选', async () => {
    const wrapper = mount(TreeV2, { props: { showCheckbox: true, defaultCheckedKeys: ['p', 'y'] } });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.setData([{ id: 'p', children: [{ id: 'x' }] }]);
    api.setData([{ id: 'x' }, { id: 'y' }]);
    await nextTick();
    expect(api.getCheckedKeys()).toEqual(['y']);
  });

  test('setData 的默认勾选级联经过禁用分支并勾选启用后代', async () => {
    const wrapper = mount(TreeV2, { props: { showCheckbox: true, defaultCheckedKeys: ['p'] } });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.setData([{ id: 'p', children: [{ id: 'd', disabled: true, children: [{ id: 'x' }] }] }]);
    await nextTick();
    expect(api.getCheckedKeys()).toEqual(['p', 'd', 'x']);
  });

  test.each(['setData', 'data'] as const)('%s 替换新增禁用叶节点后父节点转为半选', async (entry) => {
    const checkedChild = { id: 'x', label: 'X' };
    const wrapper = mount(TreeV2, {
      props: { data: [{ id: 'p', children: [checkedChild] }], showCheckbox: true, defaultExpandedKeys: ['p'] }
    });
    await rows(wrapper)[1].trigger('click');
    const api = wrapper.vm as unknown as TreeV2Exposed;
    expect(api.getCheckedKeys()).toEqual(['p', 'x']);
    const replacement = [{ id: 'p', children: [checkedChild, { id: 'z', label: 'Z', disabled: true }] }];
    if (entry === 'data') await wrapper.setProps({ data: replacement });
    else api.setData(replacement);
    await nextTick();
    expect(api.getCheckedKeys()).toEqual(['x']);
    expect(api.getHalfCheckedKeys()).toEqual(['p']);
  });

  test('滚动后清空树，再通过 setData 填充可看到新节点', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: Array.from({ length: 80 }, (_, id) => ({ id, label: `N${id}` })) }
    });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.scrollTo(1000);
    await nextTick();
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('N36');
    api.setData([]);
    await nextTick();
    expect(wrapper.find('.i-tree-v2__empty').exists()).toBe(true);
    api.setData([{ id: 'x', label: 'X' }]);
    await nextTick();
    expect(wrapper.find('.i-tree-v2__label').exists()).toBe(true);
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('X');
  });

  test('过滤至空态后替换数据会同步新列表的虚拟窗口', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: Array.from({ length: 80 }, (_, id) => ({ id, label: `N${id}` })) }
    });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.scrollTo(1000);
    await nextTick();
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('N36');

    api.filter('short');
    await nextTick();
    expect(wrapper.find('.i-tree-v2__empty').exists()).toBe(true);
    api.setData([{ id: 'x', label: 'short' }]);
    await nextTick();

    expect(wrapper.get('.i-tree-v2__label').text()).toBe('short');
    expect(wrapper.get<HTMLElement>('.i-tree-v2__list').element.scrollTop).toBe(0);
  });

  test('缩短列表时将实际滚动位置限制在新的可见范围', async () => {
    const data = Array.from({ length: 80 }, (_, id) => ({ id, label: `N${id}` }));
    const wrapper = mount(TreeV2, { props: { data } });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.scrollTo(1000);
    await nextTick();

    api.setData(data.slice(0, 10));
    await nextTick();

    expect(wrapper.get<HTMLElement>('.i-tree-v2__list').element.scrollTop).toBe(60);
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('N0');
  });

  test('同一更新周期清空并恢复数据会重置滚动位置', async () => {
    const data = Array.from({ length: 80 }, (_, id) => ({ id, label: `N${id}` }));
    const wrapper = mount(TreeV2, { props: { data } });
    const api = wrapper.vm as unknown as TreeV2Exposed;
    api.scrollTo(1000);
    await nextTick();

    api.setData([]);
    api.setData(data);
    await nextTick();

    expect(wrapper.get<HTMLElement>('.i-tree-v2__list').element.scrollTop).toBe(0);
    expect(wrapper.get('.i-tree-v2__label').text()).toBe('N0');
  });

  test('暴露 getExpandedKeys、isChecked、isIndeterminate 与 toggleCheckbox', () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, defaultExpandedKeys: ['a'] }
    });
    const api = wrapper.vm as unknown as {
      getExpandedKeys: () => string[];
      isChecked: (key: string) => boolean;
      isIndeterminate: (key: string) => boolean;
      toggleCheckbox: (key: string, checked?: boolean) => void;
    };
    expect(api.getExpandedKeys()).toEqual(['a']);
    expect(api.isChecked('a1')).toBe(false);
    api.toggleCheckbox('a1', true);
    expect(api.isChecked('a1')).toBe(true);
    expect(api.isIndeterminate('a')).toBe(true);
    api.toggleCheckbox('a1');
    expect(api.isChecked('a1')).toBe(false);
    expect(api.isIndeterminate('a')).toBe(false);
  });

  test('filter 过滤节点并保留祖先', async () => {
    const wrapper = mount(TreeV2, {
      props: {
        data: data(),
        filterMethod: (query: string, node: { label?: string }) => String(node.label).includes(query)
      }
    });
    const api = wrapper.vm as unknown as { filter: (query: string) => void };
    api.filter('A1');
    await nextTick();
    expect(rows(wrapper).map((item) => item.find('.i-tree-v2__label').text())).toEqual(['A', 'A1', 'A1x']);

    api.filter('');
    await nextTick();
    expect(rows(wrapper)).toHaveLength(2);
  });

  test('勾选管理与节点查询暴露方法', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, defaultCheckedKeys: ['a2'], defaultExpandedKeys: ['a'] }
    });
    const api = wrapper.vm as unknown as {
      getCheckedKeys: (leafOnly?: boolean) => string[];
      setCheckedKeys: (keys: string[]) => void;
      setExpandedKeys: (keys: string[]) => void;
      getNode: (key: string) => { label?: string } | null;
      getHalfCheckedKeys: () => string[];
    };
    expect(api.getCheckedKeys()).toEqual(['a2']);
    expect(api.getHalfCheckedKeys()).toContain('a');
    api.setCheckedKeys(['a1x']);
    expect(api.getCheckedKeys()).toEqual(['a1x']);
    expect(api.getNode('a')?.label).toBe('A');
    api.setExpandedKeys([]);
    await nextTick();
    expect(rows(wrapper)).toHaveLength(2);
  });

  test('scrollTo 与 scrollToNode 同步滚动真实容器', async () => {
    const wrapper = mount(TreeV2, {
      props: {
        data: Array.from({ length: 100 }, (_, index) => ({ id: index, label: `N${index}` })),
        height: 200,
        itemSize: 26
      }
    });
    const api = wrapper.vm as unknown as {
      scrollTo: (offset: number) => void;
      scrollToNode: (key: number) => void;
    };
    const listEl = wrapper.find('.i-tree-v2__list').element as HTMLElement;
    api.scrollTo(520);
    expect(listEl.scrollTop).toBe(520);
    api.scrollToNode(60);
    expect(listEl.scrollTop).toBe(60 * 26);
  });
});
