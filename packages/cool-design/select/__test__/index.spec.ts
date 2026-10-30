import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import Select from '../index';
import SelectOption from '../../select-option';

test('Select 支持多选数组值和禁用项', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: [1], multiple: true },
    slots: {
      default: () => [h(SelectOption, { value: 1, label: '一' }), h(SelectOption, { value: 2, label: '二' })]
    }
  });
  expect(wrapper.find('select').attributes('multiple')).toBeDefined();
  await wrapper.find('select').setValue(['1', '2']);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[1, 2]]);
});

test('Select filterable 按选项标签筛选并显示无匹配提示', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: {
      default: () => [h(SelectOption, { value: 'a', label: '苹果' }), h(SelectOption, { value: 'b', label: '香蕉' })]
    }
  });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('苹果');
  expect(wrapper.findAll('option')).toHaveLength(2);
  await wrapper.get('input[aria-label="筛选选项"]').setValue('不存在');
  expect(wrapper.text()).toContain('无匹配数据');
});

test('Select 支持远程选项和数字值', async () => {
  const remoteMethod = vi.fn().mockResolvedValue([
    { value: 1, label: '远程一' },
    { value: 2, label: '远程二' }
  ]);
  const wrapper = mount(Select, { props: { remote: true, filterable: true, remoteMethod } });
  await wrapper.get('input[aria-label="筛选选项"]').setValue('远程');
  await flushPromises();
  expect(remoteMethod).toHaveBeenCalledWith('远程');
  await wrapper.get('select').setValue('1');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
});
