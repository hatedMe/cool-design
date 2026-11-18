import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import TreeV2 from '..';

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

  test('checkOnClickLeaf 点击叶子勾选', async () => {
    const wrapper = mount(TreeV2, {
      props: { data: data(), showCheckbox: true, expandOnClickNode: false, defaultExpandedKeys: ['a'] }
    });
    // 行序：a, a1, a2, b —— 点击叶子 a2 行
    await rows(wrapper)[2].trigger('click');
    const payload = wrapper.emitted('check')!.at(-1)![1] as { checkedKeys: string[] };
    expect(payload.checkedKeys).toEqual(['a2']);
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
