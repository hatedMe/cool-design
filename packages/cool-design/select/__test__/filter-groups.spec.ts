import { mount } from '@vue/test-utils';
import { DOMWrapper } from '@vue/test-utils';
import { Fragment, createCommentVNode, createTextVNode, h, nextTick, ref } from 'vue';
import { beforeEach, expect, test } from 'vitest';
import Select from '../index';
import SelectOption from '../../select-option';
import SelectOptionGroup from '../../select-option-group';

// 下拉面板默认传送到 document.body，测试中用文档级查询访问传送内容。
beforeEach(() => {
  document.body.innerHTML = '';
});
const doc = () => new DOMWrapper(document.body);

test('Select 分组插槽返回单个 VNode 时保持对象回显、禁用与键盘选择', async () => {
  const current = { id: 'a' };
  const optionValue = { id: 'b', detail: '完整值' };
  const label = ref('乙');
  const wrapper = mount(Select, {
    props: { modelValue: current, valueKey: 'id', teleported: false },
    slots: {
      default: () => h(Fragment, [
        h(SelectOptionGroup, { label: '当前', disabled: true }, {
          default: () => h(SelectOption, { value: { ...current }, label: '甲' })
        }),
        h(SelectOptionGroup, { label: '可选' }, {
          default: () => h(Fragment, [
            createCommentVNode('分隔'),
            h(Fragment, [h(SelectOption, { value: optionValue }, () => [createTextVNode(label.value)])])
          ])
        })
      ])
    }
  });
  const trigger = wrapper.get('[role="combobox"]');
  expect(trigger.text()).toBe('甲');
  await trigger.trigger('click');
  expect(wrapper.findAll('.i-select__group').map((item) => item.text())).toEqual(['当前', '可选']);
  const [disabled, enabled] = wrapper.findAll('[role="option"]');
  expect(disabled.attributes('aria-selected')).toBe('true');
  expect(disabled.attributes('aria-disabled')).toBe('true');
  const id = enabled.attributes('id');
  label.value = '乙更新';
  await nextTick();
  expect(enabled.text()).toBe('乙更新');
  expect(enabled.attributes('id')).toBe(id);
  await trigger.trigger('keydown', { key: 'ArrowDown' });
  expect(trigger.attributes('aria-activedescendant')).toBe(id);
  await trigger.trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('update:modelValue')).toEqual([[optionValue]]);
  wrapper.unmount();
});

test('Select 读取分组直接数组、原生选项和原始文本，并略过空值', async () => {
  const wrapper = mount(Select, {
    props: { modelValue: 'a', teleported: false },
    slots: {
      default: () => [
        h(SelectOptionGroup, { label: '分组' }, [h('option', { value: 'a' }, '甲')]),
        h(SelectOptionGroup, { label: '文本' }, {
          default: () => [null, false, ['保留文字', createCommentVNode('忽略')]]
        }),
        h('option', { value: 'b' }, '乙')
      ]
    }
  });
  const trigger = wrapper.get('[role="combobox"]');
  expect(trigger.text()).toBe('甲');
  await trigger.trigger('click');
  expect(wrapper.findAll('.i-select__group').map((item) => item.text())).toEqual(['分组', '文本']);
  expect(wrapper.findAll('[role="option"]').map((item) => item.text())).toEqual(['甲', '保留文字', '乙']);
  expect(wrapper.get('select > optgroup').attributes('label')).toBe('分组');
  expect(wrapper.get('select > option').text()).toBe('乙');
  wrapper.unmount();
});

test('Select 过滤时保留有命中子项的分组头', async () => {
  const wrapper = mount(Select, {
    props: { filterable: true },
    slots: {
      default: () => [
        h(
          SelectOptionGroup,
          { label: '热门城市' },
          { default: () => [h(SelectOption, { value: 'sh', label: '上海' }), h(SelectOption, { value: 'su', label: '苏州' })] }
        ),
        h(
          SelectOptionGroup,
          { label: '其他城市' },
          { default: () => [h(SelectOption, { value: 'gz', label: '广州' }), h(SelectOption, { value: 'hz', label: '杭州' })] }
        )
      ]
    }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  const input = wrapper.get('input[aria-label="筛选选项"]');
  await input.setValue('广州');
  expect(doc().findAll('.i-select__group').map((item) => item.text())).toEqual(['其他城市']);
  expect(doc().findAll('[role="option"]')).toHaveLength(1);
  await input.setValue('州');
  expect(doc().findAll('.i-select__group').map((item) => item.text())).toEqual(['热门城市', '其他城市']);
  expect(doc().findAll('[role="option"]')).toHaveLength(3);
  await input.setValue('不存在');
  expect(doc().findAll('.i-select__group')).toHaveLength(0);
  expect(doc().text()).toContain('无匹配数据');
});

test('SelectOptionGroup 未设置 label 时不渲染空分组头', async () => {
  const wrapper = mount(Select, {
    slots: {
      default: () => [
        h(SelectOptionGroup, { label: '有名称分组' }, { default: () => [h(SelectOption, { value: 'a', label: '甲' })] }),
        h(SelectOptionGroup, { disabled: true }, { default: () => [h(SelectOption, { value: 'b', label: '乙' })] })
      ]
    }
  });
  await wrapper.get('[role="combobox"]').trigger('click');
  const groups = doc().findAll('.i-select__group');
  expect(groups).toHaveLength(1);
  expect(groups[0].text()).toBe('有名称分组');
  // 未命名的分组退化为普通选项，禁用继承仍生效
  expect(doc().findAll('[role="option"]')[1].attributes('aria-disabled')).toBe('true');
});
