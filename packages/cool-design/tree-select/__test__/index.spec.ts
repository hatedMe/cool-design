import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';

import TreeSelect from '..';
import type { TreeSelectNode } from '../tree-select';

const data: TreeSelectNode[] = [
  { value: 'a', label: '节点A', children: [{ value: 'a1', label: '节点A1' }, { value: 'a2', label: '节点A2' }] },
  { value: 'b', label: '节点B' }
];

const checkboxes = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('input.i-tree__checkbox').map((item) => item.element as HTMLInputElement);

/** jsdom 中 click() 只切换 checked 不派发 change，需补发 change 事件 */
const toggleCheck = async (wrapper: ReturnType<typeof mount>, index: number) => {
  checkboxes(wrapper)[index].click();
  await wrapper.findAll('input.i-tree__checkbox')[index].trigger('change');
};

const dropdownHidden = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.find('.i-tree-select__dropdown').attributes('style') ?? '').includes('display: none');

describe('test `TreeSelect` component', () => {
  test('非 checkStrictly 时勾选父节点级联子孙，取消同理', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: [] } });
    await nextTick();
    await toggleCheck(wrapper, 0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a', 'a1', 'a2']);

    await wrapper.setProps({ modelValue: ['a', 'a1', 'a2'] });
    await nextTick();
    await toggleCheck(wrapper, 2);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual(['a1']);
  });

  test('子节点勾满后父节点自动选中', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await nextTick();
    await toggleCheck(wrapper, 2);
    await nextTick();
    const result = wrapper.emitted('update:modelValue')![0][0] as (string | number)[];
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(['a', 'a1', 'a2']));
  });

  test('checkStrictly 时父子勾选解耦', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: [] }
    });
    await nextTick();
    await toggleCheck(wrapper, 0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
  });

  test('部分子节点选中时父节点展示半选状态', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await nextTick();
    expect(checkboxes(wrapper)[0].indeterminate).toBe(true);

    const strict = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: ['a1'] }
    });
    await nextTick();
    expect(checkboxes(strict)[0].indeterminate).toBe(false);
  });

  test('单选模式回显 label，选中后收起下拉并输出单值', async () => {
    const wrapper = mount(TreeSelect, { props: { data, modelValue: null } });
    expect(wrapper.find('.i-tree-select__control').text()).toContain('请选择');
    await wrapper.setProps({ modelValue: 'a1' });
    await nextTick();
    expect(wrapper.find('.i-tree-select__control').text()).toContain('节点A1');

    await wrapper.find('.i-tree-select__control').trigger('click');
    expect(dropdownHidden(wrapper)).toBe(false);
    await wrapper.findAll('.i-tree__content')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a1');
    expect(dropdownHidden(wrapper)).toBe(true);
  });

  test('多选展示标签并支持删除与折叠', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, multiple: true, modelValue: ['a1', 'a2'], collapseTags: true, maxCollapseTags: 1 }
    });
    await nextTick();
    expect(wrapper.findAll('.i-tree-select__tag')).toHaveLength(1);
    expect(wrapper.text()).toContain('节点A1');
    expect(wrapper.text()).toContain('+1');

    await wrapper.find('.i-tree-select__tag-close').trigger('click');
    expect(wrapper.emitted('remove-tag')![0][0]).toBe('a1');
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a2']);
  });
});
