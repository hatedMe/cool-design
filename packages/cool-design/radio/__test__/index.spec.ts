import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, test } from 'vitest';

import Radio from '..';
import RadioButton from '../../radio-button';
import * as CoolDesign from '../../index';

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
  test('支持 label 作为选项值', async () => {
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

  test('未设置 size 时依次回退分组、FormItem 与全局配置', () => {
    const Host = defineComponent({
      setup: () => () =>
        h(CoolDesign.ConfigProvider, { size: 'small' }, () =>
          h(CoolDesign.RadioGroup, { modelValue: 'a' }, () => [h(Radio, { value: 'a' }), h(Radio, { value: 'b' })])
        )
    });
    const wrapper = mount(Host);
    expect(wrapper.findAll('.i-radio')[0].classes()).toContain('i-radio--small');
    wrapper.unmount();

    const fallback = mount(Radio);
    expect(fallback.classes()).not.toContain('i-radio--small');
  });

  test('roving tabindex 与方向键在可用项间移动并聚焦', async () => {
    const { default: RadioGroup } = await import('../group');
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            RadioGroup,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (v: string) => {
                value.value = v;
              }
            },
            () => [
              h(Radio, { value: 'a' }, () => 'A'),
              h(Radio, { value: 'b', disabled: true }, () => 'B'),
              h(Radio, { value: 'c' }, () => 'C')
            ]
          )
      }),
      { attachTo: document.body }
    );
    const inputs = wrapper.findAll('input[type="radio"]');
    // 选中项是键盘停靠点，其余项从 tab 序中移除。
    expect(inputs[0].attributes('tabindex')).toBe('0');
    expect(inputs[1].attributes('tabindex')).toBe('-1');
    expect(inputs[2].attributes('tabindex')).toBe('-1');

    await wrapper.get('.i-radio-group').trigger('keydown', { key: 'ArrowRight' });
    // 跳过禁用的 b，方向键选中并聚焦 c。
    expect(value.value).toBe('c');
    expect(document.activeElement).toBe(inputs[2].element);
    expect(inputs[2].attributes('tabindex')).toBe('0');
    expect(inputs[0].attributes('tabindex')).toBe('-1');

    await wrapper.get('.i-radio-group').trigger('keydown', { key: 'ArrowLeft' });
    expect(value.value).toBe('a');
    expect(document.activeElement).toBe(inputs[0].element);
    wrapper.unmount();
  });

  test('RadioButton 同样参与 roving tabindex 导航', async () => {
    const { default: RadioGroup } = await import('../group');
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            RadioGroup,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (v: string) => {
                value.value = v;
              }
            },
            () => [h(RadioButton, { value: 'a' }, () => 'A'), h(RadioButton, { value: 'b' }, () => 'B')]
          )
      }),
      { attachTo: document.body }
    );
    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs[0].attributes('tabindex')).toBe('0');
    expect(inputs[1].attributes('tabindex')).toBe('-1');
    await wrapper.get('.i-radio-group').trigger('keydown', { key: 'ArrowDown' });
    expect(value.value).toBe('b');
    expect(document.activeElement).toBe(inputs[1].element);
    wrapper.unmount();
  });
});
