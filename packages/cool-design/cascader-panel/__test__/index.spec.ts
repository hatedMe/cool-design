import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import CascaderPanel from '..';

const options = () => [
  {
    value: 'a',
    label: 'A',
    children: [
      { value: 'a1', label: 'A1', children: [{ value: 'a1x', label: 'A1x' }] },
      { value: 'a2', label: 'A2' }
    ]
  },
  { value: 'b', label: 'B', disabled: true }
];

const nodes = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.i-cascader-panel__node');

describe('test `CascaderPanel` component', () => {
  test('点击展开列并选中叶子，emitPath 控制值形态', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: options() } });
    await nodes(wrapper)[0].trigger('click');
    expect(wrapper.emitted('expand-change')).toEqual([[['a']]]);
    expect(wrapper.findAll('.i-cascader-panel__column')).toHaveLength(2);
    await nodes(wrapper)[3].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[ 'a', 'a2' ]]]);
    expect(wrapper.emitted('change')).toEqual([[[ 'a', 'a2' ]]]);

    const flat = mount(CascaderPanel, { props: { options: options(), emitPath: false } });
    await nodes(flat)[0].trigger('click');
    await nodes(flat)[3].trigger('click');
    expect(flat.emitted('update:modelValue')).toEqual([['a2']]);
  });

  test('checkStrictly 单选可选任意层级', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: options(), checkStrictly: true }
    });
    await nodes(wrapper)[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[[ 'a' ]]]);
  });

  test('多选级联勾选输出叶子值，checkStrictly 解耦', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: options(), multiple: true, modelValue: [] }
    });
    await wrapper.findAll('input.i-cascader-panel__checkbox')[0].trigger('change');
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toEqual([
      ['a', 'a1', 'a1x'],
      ['a', 'a2']
    ]);

    const strict = mount(CascaderPanel, {
      props: { options: options(), multiple: true, checkStrictly: true, modelValue: [] }
    });
    await strict.findAll('input.i-cascader-panel__checkbox')[0].trigger('change');
    expect(strict.emitted('update:modelValue')!.at(-1)![0]).toEqual([['a']]);
  });

  test('禁用节点不响应交互', async () => {
    const wrapper = mount(CascaderPanel, { props: { options: options() } });
    await nodes(wrapper)[1].trigger('click');
    expect(wrapper.emitted('expand-change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('getCheckedNodes 暴露选中节点数据', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: options(), multiple: true, modelValue: [['a', 'a1', 'a1x']] }
    });
    const api = wrapper.vm as unknown as { getCheckedNodes: (leafOnly?: boolean) => Array<{ value: string }> };
    expect(api.getCheckedNodes().map((item) => item.value).sort()).toEqual(['a1', 'a1x']);
    expect(api.getCheckedNodes(true).map((item) => item.value)).toEqual(['a1x']);
  });

  test('懒加载子级且仅加载一次，加载出的叶子节点可直接选中', async () => {
    const lazyLoad = vi.fn((node: { value: string }, resolve: (children: Array<{ value: string; label: string; leaf?: boolean }>) => void) => {
      resolve(node.value === 'a' ? [{ value: 'a-lazy', label: '懒子级', leaf: true }] : []);
    });
    const wrapper = mount(CascaderPanel, {
      props: { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], lazy: true, lazyLoad }
    });
    await nodes(wrapper)[0].trigger('click');
    expect(lazyLoad).toHaveBeenCalledTimes(1);
    expect(lazyLoad).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }), expect.any(Function), expect.any(Function));
    await flushPromises();
    expect(wrapper.findAll('.i-cascader-panel__column')).toHaveLength(2);
    expect(wrapper.text()).toContain('懒子级');

    // 再次点击不重复发起。
    await nodes(wrapper)[0].trigger('click');
    expect(lazyLoad).toHaveBeenCalledTimes(1);

    // 懒加载出的子级无子节点：视为叶子可直接选中。
    const lazyChild = wrapper.findAll('.i-cascader-panel__node').find((node) => node.text().includes('懒子级'));
    expect(lazyChild).toBeTruthy();
    await lazyChild!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)![0]).toEqual(['a', 'a-lazy']);
  });

  test('expandTrigger=hover 悬停即展开', async () => {
    const wrapper = mount(CascaderPanel, {
      props: { options: options(), expandTrigger: 'hover' }
    });
    await nodes(wrapper)[0].trigger('mouseenter');
    expect(wrapper.findAll('.i-cascader-panel__column')).toHaveLength(2);
    expect(wrapper.emitted('expand-change')).toEqual([[['a']]]);
    // 禁用节点不响应悬停展开。
    await nodes(wrapper)[1].trigger('mouseenter');
    expect(wrapper.emitted('expand-change')).toHaveLength(1);
  });
});

test('uses configured click selection and retries rejected lazy loading', async () => {
  let loads = 0;
  const wrapper = mount(CascaderPanel, {
    props: {
      options: [{ value: 'root', label: 'Root' }],
      lazy: true,
      props: { multiple: true, checkOnClickNode: false, showPrefix: false },
      lazyLoad: (_node, resolve, reject) => {
        if (++loads === 1) reject();
        else resolve([{ value: 'child', label: 'Child', leaf: true }]);
      }
    }
  });
  expect(wrapper.find('input').exists()).toBe(false);
  await wrapper.get('.i-cascader-panel__node').trigger('click');
  await wrapper.get('.i-cascader-panel__node').trigger('click');
  await wrapper.findAll('.i-cascader-panel__node')[1].trigger('click');
  expect(loads).toBe(2);
  expect(wrapper.emitted('update:modelValue')).toEqual([[[['root', 'child']]]]);
});

test('keeps checked descendants independent in controlled strict mode', async () => {
  const wrapper = mount(CascaderPanel, {
    props: {
      options: [{ value: 'parent', label: 'Parent', children: [{ value: 'child', label: 'Child' }] }],
      modelValue: [['parent']],
      props: { multiple: true, checkStrictly: true }
    }
  });
  expect(wrapper.vm.getCheckedNodes().map((node) => node.value)).toEqual(['parent']);
  await wrapper.get('.i-cascader-panel__arrow').trigger('click');
  expect(wrapper.findAll('input').map((input) => input.element.checked)).toEqual([true, false]);
});

test('initializes expanded columns from the selected path', () => {
  const wrapper = mount(CascaderPanel, {
    props: {
      options: [{ value: 'root', label: 'Root', children: [{ value: 'child', label: 'Child' }] }],
      modelValue: ['root', 'child']
    }
  });
  expect(wrapper.findAll('.i-cascader-panel__column')).toHaveLength(2);
  expect(wrapper.vm.getCheckedNodes().map((node) => node.value)).toEqual(['child']);
});
