import { h, nextTick, ref } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import { beforeEach, expect, test } from 'vitest';
import Select from '../index';
import Form from '../../form';
import FormItem from '../../form-item';
import SelectOption from '../../select-option';
import SelectOptionGroup from '../../select-option-group';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

test('ariaLabel 命名主 combobox，并在清空后恢复字段标签', async () => {
  const name = ref('选择状态');
  const wrapper = mount(Form, {
    props: { model: {} },
    slots: { default: () => h(FormItem, { label: '账号状态' }, () => h(Select, { ariaLabel: name.value })) }
  });
  try {
    const select = wrapper.getComponent(Select);
    const combobox = select.get('[role="combobox"]');
    expect(combobox.attributes('aria-label')).toBe('选择状态');
    expect(combobox.attributes('aria-labelledby')).toBeUndefined();

    name.value = '更新状态';
    await nextTick();
    expect(combobox.attributes('aria-label')).toBe('更新状态');

    name.value = '';
    await nextTick();
    expect(combobox.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'));
  } finally {
    wrapper.unmount();
  }
});

test('SelectOptionGroup 渲染分组标题，禁用整组不可选', async () => {
  const wrapper = mount(Select, {
    slots: {
      default: () => [
        h(SelectOptionGroup, { label: '热门', disabled: true }, { default: () => [h(SelectOption, { value: 'a', label: '一' })] }),
        h(SelectOptionGroup, { label: '其他' }, { default: () => [h(SelectOption, { value: 'b', label: '二' })] })
      ]
    }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().findAll('.i-select__group').map((item) => item.text())).toEqual(['热门', '其他']);
  await doc().get('[role="option"][data-value="a"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await doc().get('[role="option"][data-value="b"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
  expect(wrapper.findAll('optgroup').map((item) => item.attributes('label'))).toEqual(['热门', '其他']);
});

test('value-key 支持对象选项值并回显 label', async () => {
  const options = [
    { id: 1, name: '一' },
    { id: 2, name: '二' }
  ];
  const wrapper = mount(Select, {
    props: { valueKey: 'id', modelValue: options[0] },
    slots: { default: () => options.map((option) => h(SelectOption, { value: option, label: option.name })) }
  });
  expect(wrapper.get('[role="combobox"]').text()).toContain('一');
  await wrapper.get('[role="combobox"]').trigger('click');
  await doc().get('[role="option"][data-value="2"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([options[1]]);
});

test('clear 输出 value-on-clear，命中 empty-values 视为清空', async () => {
  const wrapper = mount(Select, {
    props: { clearable: true, valueOnClear: null, emptyValues: [null, ''], modelValue: 'a' },
    slots: {
      default: () => [h(SelectOption, { value: 'a', label: '一' }), h(SelectOption, { value: '', label: '空' })]
    }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  await doc().get('[role="option"][data-value=""]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  expect(wrapper.emitted('clear')).toHaveLength(1);
});

test('automatic-dropdown 聚焦即展开', async () => {
  const wrapper = mount(Select, {
    attachTo: document.body,
    props: { automaticDropdown: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  try {
    wrapper.get<HTMLElement>('[role="combobox"]').element.focus();
    await nextTick();
    expect(doc().find('[role="listbox"]').exists()).toBe(true);
  } finally {
    wrapper.unmount();
  }
});

test('loading-text 自定义加载文案，fit-input-width 对齐触发器宽度', async () => {
  const wrapper = mount(Select, {
    props: { loading: true, loadingText: '拼命加载中', fitInputWidth: true },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  expect(doc().text()).toContain('拼命加载中');
  expect(doc().get('[role="listbox"]').attributes('style')).toContain('min-width');
});

test('tag-type 为多选标签着色', () => {
  const wrapper = mount(Select, {
    props: { modelValue: ['a'], multiple: true, tagType: 'success' },
    slots: { default: () => [h(SelectOption, { value: 'a', label: '一' })] }
  });
  expect(wrapper.find('.i-select__tag').classes()).toContain('i-select__tag--success');
});
