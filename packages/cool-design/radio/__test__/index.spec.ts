import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { describe, expect, test } from 'vitest';

import Radio from '..';
import RadioButton from '../../radio-button';

describe('test `Radio` component', () => {
  test('renders a component', async () => {
    const wrapper = mount(Radio);
    expect(wrapper.exists()).toBeTruthy();
  });
  test('使用受控值并响应动态禁用，不直接改变父级模型', async () => {
    const wrapper = mount(Radio, {
      props: { value: 'enabled', modelValue: 'disabled' },
      slots: { default: '启用' }
    });
    expect(wrapper.get('input').element.checked).toBe(false);
    await wrapper.get('input').setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['enabled']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['enabled']);
    await wrapper.setProps({ modelValue: 'enabled', disabled: true });
    expect(wrapper.get('input').element.checked).toBe(true);
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    await wrapper.get('input').trigger('change');
    expect(wrapper.emitted('change')).toHaveLength(1);
  });
  test('支持 Element Plus label 作为选项值', async () => {
    const { default: RadioGroup } = await import('../group');
    const wrapper = mount(RadioGroup, {
      props: { modelValue: 'a' },
      slots: { default: () => [h(Radio, { label: 'a' }, () => 'A'), h(Radio, { label: 'b' }, () => 'B')] }
    });
    expect((wrapper.findAll('input')[0].element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.findAll('input')[1].element as HTMLInputElement).checked).toBe(false);
    await wrapper.findAll('input')[1].setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  test('组内 Radio 只由 RadioGroup 发出 change', async () => {
    const { default: RadioGroup } = await import('../group');
    const childChange = () => undefined;
    const wrapper = mount(RadioGroup, {
      props: { modelValue: 'a' },
      slots: { default: () => h(Radio, { value: 'b', onChange: childChange }) }
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('change')).toHaveLength(1);
  });

  test('Radio 继承 Form 的 disabled 状态', async () => {
    const { default: Form } = await import('../../form/form');
    const wrapper = mount(Form, {
      props: { model: {}, disabled: true },
      slots: { default: () => h(Radio, { value: 'a' }) }
    });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  test('RadioButton 与 RadioGroup 联动并支持禁用', async () => {
    const { default: RadioGroup } = await import('../group');
    const wrapper = mount(RadioGroup, {
      props: { modelValue: 'a' },
      slots: {
        default: () => [h(RadioButton, { value: 'a' }, () => 'A'), h(RadioButton, { value: 'b' }, () => 'B')]
      }
    });
    expect(wrapper.findAll('.i-radio-button--is-checked')).toHaveLength(1);
    await wrapper.findAll('.i-radio-button')[1].find('input').setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['b']);
  });

  test('RadioGroup 向子项传递尺寸', async () => {
    const { default: RadioGroup } = await import('../group');
    const wrapper = mount(RadioGroup, {
      props: { size: 'large' },
      slots: { default: () => h(Radio, { value: 'a' }, () => 'A') }
    });
    expect(wrapper.find('label').classes()).toContain('i-radio--large');
  });

  test('RadioGroup 管理选中值并向子项传递禁用和名称', async () => {
    const { default: RadioGroup } = await import('../group');
    const wrapper = mount(RadioGroup, {
      props: { modelValue: 'a', name: 'kind' },
      slots: { default: () => [h(Radio, { value: 'a' }, () => 'A'), h(Radio, { value: 'b' }, () => 'B')] }
    });
    expect(wrapper.findAll('input[name="kind"]')).toHaveLength(2);
    expect(wrapper.findAll('input:checked')).toHaveLength(1);
    await wrapper.findAll('input')[1].setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });
});
