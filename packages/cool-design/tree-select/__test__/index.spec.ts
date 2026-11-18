import { DOMWrapper, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, test } from 'vitest';

import TreeSelect from '..';
import type { TreeSelectNode } from '../tree-select';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

const data: TreeSelectNode[] = [
  { value: 'a', label: '节点A', children: [{ value: 'a1', label: '节点A1' }, { value: 'a2', label: '节点A2' }] },
  { value: 'b', label: '节点B' }
];

const checkboxes = () =>
  doc().findAll('input.i-tree__checkbox').map((item) => item.element as HTMLInputElement);

/** 直接翻转 checked 并派发一次 change，避免 jsdom 原生激活行为重复触发 */
const toggleCheck = async (index: number) => {
  const input = checkboxes()[index];
  input.checked = !input.checked;
  input.dispatchEvent(new Event('change'));
  await nextTick();
};

const openDropdown = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('.i-tree-select__control').trigger('click');
  await nextTick();
};

const dropdownVisible = () => doc().find('.i-tree-select__dropdown').exists();

describe('test `TreeSelect` component', () => {
  test('非 checkStrictly 时勾选父节点级联子孙，取消同理', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: [] } });
    await openDropdown(wrapper);
    await toggleCheck(0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a', 'a1', 'a2']);

    await wrapper.setProps({ modelValue: ['a', 'a1', 'a2'] });
    await nextTick();
    await toggleCheck(2);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual(['a1']);
    wrapper.unmount();
  });

  test('子节点勾满后父节点自动选中', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await openDropdown(wrapper);
    await toggleCheck(2);
    await nextTick();
    const result = wrapper.emitted('update:modelValue')![0][0] as (string | number)[];
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(['a', 'a1', 'a2']));
    wrapper.unmount();
  });

  test('checkStrictly 时父子勾选解耦', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: [] }
    });
    await openDropdown(wrapper);
    await toggleCheck(0);
    await nextTick();
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(['a']);
    wrapper.unmount();
  });

  test('部分子节点选中时父节点展示半选状态', async () => {
    const wrapper = mount(TreeSelect, { props: { data, multiple: true, modelValue: ['a1'] } });
    await openDropdown(wrapper);
    expect(checkboxes()[0].indeterminate).toBe(true);
    wrapper.unmount();

    const strict = mount(TreeSelect, {
      props: { data, multiple: true, checkStrictly: true, modelValue: ['a1'] }
    });
    await openDropdown(strict);
    expect(checkboxes()[0].indeterminate).toBe(false);
    strict.unmount();
  });

  test('单选模式回显 label，选中后收起下拉并输出单值', async () => {
    const wrapper = mount(TreeSelect, { props: { data, modelValue: null } });
    expect(wrapper.find('.i-tree-select__control').text()).toContain('请选择');
    await wrapper.setProps({ modelValue: 'a1' });
    await nextTick();
    expect(wrapper.find('.i-tree-select__control').text()).toContain('节点A1');

    await openDropdown(wrapper);
    expect(dropdownVisible()).toBe(true);
    await doc().findAll('.i-tree__content')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('a1');
    await nextTick();
    expect(dropdownVisible()).toBe(false);
    wrapper.unmount();
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
    wrapper.unmount();
  });

  test('下拉默认传送到 body，外点与 Escape 关闭', async () => {
    const wrapper = mount(TreeSelect, {
      props: { data, modelValue: null, popperClass: 'teleport-scope' },
      attachTo: document.body
    });
    await openDropdown(wrapper);
    expect(wrapper.find('.i-tree-select__dropdown').exists()).toBe(false);
    const mine = () => doc().find('.teleport-scope');
    expect(mine().exists()).toBe(true);
    expect(mine().attributes('data-placement')).toBe('bottom-start');

    (wrapper.get('.i-tree-select__control').element as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await nextTick();
    expect(mine().exists()).toBe(false);

    await openDropdown(wrapper);
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(mine().exists()).toBe(false);
    wrapper.unmount();
  });
});
