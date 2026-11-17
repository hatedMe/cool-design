import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
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
});
