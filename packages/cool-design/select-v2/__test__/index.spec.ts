import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import SelectV2 from '..';
import type { SelectV2Option } from '../types';

const mountSelect = (props: Record<string, unknown>, initial?: unknown) => {
  const value = ref<unknown>(initial);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(SelectV2, { ...props, modelValue: value.value, 'onUpdate:modelValue': (v: unknown) => (value.value = v) })
    }),
    { attachTo: document.body }
  );
  return { wrapper, value, select: wrapper.findComponent(SelectV2) };
};

const openSelect = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.get('[role="combobox"]').trigger('click');
};

const manyOptions = (count: number): SelectV2Option[] =>
  Array.from({ length: count }, (_, index) => ({ value: index, label: `选项${index}` }));

describe('test `SelectV2` component', () => {
  test('单选对象值与 value-key 识别', async () => {
    const options = [
      { value: { id: 1 }, label: '一' },
      { value: { id: 2 }, label: '二' }
    ];
    const { wrapper, value, select } = mountSelect({ options, valueKey: 'id' }, { id: 1 });
    expect(wrapper.get('[role="combobox"]').text()).toContain('一');
    await openSelect(wrapper);
    await wrapper.findAll('[role="option"]')[1].trigger('click');
    expect(value.value).toEqual({ id: 2 });
    expect(select.emitted('change')).toHaveLength(1);
  });

  test('分组 options 渲染组头', async () => {
    const { wrapper } = mountSelect({
      options: [
        { label: '组一', options: [{ value: 'a', label: 'A' }] },
        { label: '组二', options: [{ value: 'b', label: 'B' }] }
      ]
    });
    await openSelect(wrapper);
    expect(wrapper.findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['组一', '组二']);
  });

  test('filterable 过滤保留有命中子项的分组头', async () => {
    const { wrapper } = mountSelect({
      filterable: true,
      options: [
        { label: '热门城市', options: [{ value: 'sh', label: '上海' }, { value: 'su', label: '苏州' }] },
        { label: '其他城市', options: [{ value: 'gz', label: '广州' }, { value: 'hz', label: '杭州' }] }
      ]
    });
    await openSelect(wrapper);
    const input = wrapper.get('input[aria-label="筛选选项"]');
    await input.setValue('广州');
    expect(wrapper.findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['其他城市']);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    await input.setValue('州');
    expect(wrapper.findAll('.i-select-v2__group').map((item) => item.text())).toEqual(['热门城市', '其他城市']);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
    await input.setValue('不存在');
    expect(wrapper.findAll('.i-select-v2__group')).toHaveLength(0);
    expect(wrapper.text()).toContain('无匹配数据');
  });

  test('多选标签、折叠与删除', async () => {
    const { wrapper, value, select } = mountSelect(
      {
        options: manyOptions(3),
        multiple: true,
        collapseTags: true,
        maxCollapseTags: 1
      },
      [0, 1, 2]
    );
    expect(wrapper.findAll('.i-select-v2__tag')).toHaveLength(1);
    expect(wrapper.text()).toContain('+2');
    await wrapper.find('.i-select-v2__tag button').trigger('click');
    expect(select.emitted('remove-tag')).toEqual([[0]]);
    expect(value.value).toEqual([1, 2]);
  });

  test('filterable 过滤与无匹配文案', async () => {
    const { wrapper } = mountSelect({ options: manyOptions(5), filterable: true });
    await openSelect(wrapper);
    await wrapper.get('.i-select-v2__input').setValue('选项3');
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    await wrapper.get('.i-select-v2__input').setValue('zzz');
    expect(wrapper.find('.i-select-v2__empty').text()).toBe('无匹配数据');
  });

  test('虚拟滚动只渲染窗口行', async () => {
    const { wrapper } = mountSelect({ options: manyOptions(500), height: 340, itemHeight: 34, filterable: true });
    await openSelect(wrapper);
    const rendered = wrapper.findAll('[role="option"]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(30);
    expect(wrapper.find('.i-select-v2__list').attributes('style')).toContain('17000px');
  });

  test('clearable 清空与键盘导航选中', async () => {
    const { wrapper, value, select } = mountSelect({ options: manyOptions(3), clearable: true, filterable: true }, 1);
    await wrapper.find('button[aria-label="清空"]').trigger('click');
    expect(value.value).toBeUndefined();
    expect(select.emitted('clear')).toHaveLength(1);

    await openSelect(wrapper);
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Enter' });
    expect(value.value).toBe(1);
  });
});
