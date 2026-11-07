import { h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Checkbox from '../index';
import CheckboxGroup from '../group';

test('CheckboxGroup 使用数组模型并限制禁用项', async () => {
  const wrapper = mount(CheckboxGroup, {
    props: { modelValue: ['a'], min: 1, max: 2 },
    slots: { default: () => [h(Checkbox, { value: 'a' }), h(Checkbox, { value: 'b' })] }
  });
  expect(wrapper.findAll('input')[0].element.checked).toBe(true);
  await wrapper.findAll('input')[0].setValue(false);
  expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(0);
  await wrapper.findAll('input')[1].setValue(true);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']]);
});

test('Checkbox 支持 label、size 和 true/false value', async () => {
  const model = ref('off');
  const wrapper = mount(Checkbox, {
    props: {
      modelValue: model.value,
      label: '通知',
      size: 'large',
      trueValue: 'on',
      falseValue: 'off',
      'onUpdate:modelValue': (value: string) => {
        model.value = value;
        wrapper.setProps({ modelValue: value });
      }
    }
  });
  expect(wrapper.text()).toBe('通知');
  expect(wrapper.find('input').classes()).toContain('is-large');
  await wrapper.find('input').setValue(true);
  expect(model.value).toBe('on');
  expect(wrapper.find('input').element.checked).toBe(true);
});

test('Checkbox 的 validate-event 为 false 时仍然触发 change', async () => {
  const wrapper = mount(Checkbox, { props: { modelValue: false, validateEvent: false } });
  await wrapper.find('input').trigger('change');
  expect(wrapper.emitted('change')).toHaveLength(1);
});

test('CheckboxButton 支持独立值和 CheckboxGroup 数组值', async () => {
  const Button = (await import('../button')).default;
  const single = mount(Button, { props: { modelValue: false, label: '独立' } });
  await single.find('button').trigger('click');
  expect(single.emitted('update:modelValue')?.[0]).toEqual([true]);

  const group = mount(CheckboxGroup, {
    props: { modelValue: ['a'] },
    slots: { default: () => [h(Button, { value: 'a', label: 'A' }), h(Button, { value: 'b', label: 'B' })] }
  });
  expect(group.findAll('button')[0].classes()).toContain('is-checked');
  await group.findAll('button')[1].trigger('click');
  expect(group.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']]);
});

test('CheckboxGroup 的 options 支持字段映射函数和对象值比较', async () => {
  const wrapper = mount(CheckboxGroup, {
    props: {
      modelValue: [{ id: 1 }],
      options: [{ id: 1, name: 'A', locked: false }, { id: 2, name: 'B', locked: false }],
      props: {
        value: (option: Record<string, unknown>) => ({ id: option.id }),
        label: (option: Record<string, unknown>) => String(option.name),
        disabled: (option: Record<string, unknown>) => Boolean(option.locked)
      }
    }
  });
  expect(wrapper.findAll('input')[0].element.checked).toBe(true);
  expect(wrapper.findAll('label')[0].text()).toContain('A');
  await wrapper.findAll('input')[0].setValue(false);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]]);
});

test('CheckboxGroup 支持 tag、options、props 和 button 类型', async () => {
  const wrapper = mount(CheckboxGroup, {
    props: {
      tag: 'section',
      type: 'button',
      options: [
        { code: 'a', text: 'A', blocked: false },
        { code: 'b', text: 'B', blocked: true }
      ],
      props: { value: 'code', label: 'text', disabled: 'blocked' },
      modelValue: ['a']
    }
  });
  expect(wrapper.element.tagName).toBe('SECTION');
  expect(wrapper.findAll('button')[0].text()).toBe('A');
  expect(wrapper.findAll('button')[0].classes()).toContain('is-checked');
  expect(wrapper.findAll('button')[1].attributes('disabled')).toBeDefined();
});

test('CheckboxGroup 的 min 和 max 动态更新后仍然生效', async () => {
  const max = ref(1);
  const values = ref<string[]>([]);
  const wrapper = mount(CheckboxGroup, {
    props: {
      modelValue: values.value,
      max: max.value,
      'onUpdate:modelValue': (value: string[]) => {
        values.value = value;
        wrapper.setProps({ modelValue: value });
      }
    },
    slots: { default: () => [h(Checkbox, { value: 'a' }), h(Checkbox, { value: 'b' })] }
  });
  max.value = 2;
  await wrapper.setProps({ max: max.value });
  await wrapper.findAll('input')[0].setValue(true);
  await wrapper.findAll('input')[1].setValue(true);
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']]);
});
