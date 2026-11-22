import { h, ref, type StyleValue } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import {
  Checkbox, CheckboxButton, CheckboxGroup, ConfigProvider, Form, FormItem, Input, InputNumber,
  InputOtp, Radio, RadioButton, RadioGroup, Rate, Segmented, Slider, Switch
} from '../index';

const controls = [
  ['input', () => h(Input)],
  ['input-number', () => h(InputNumber)],
  ['input-otp', () => h(InputOtp)],
  ['form', () => h(Form, { model: {} })],
  ['form-item', () => h(Form, { model: {} }, () => h(FormItem))],
  ['checkbox', () => h(Checkbox)],
  ['checkbox-button', () => h(CheckboxButton)],
  ['checkbox-group', () => h(CheckboxGroup)],
  ['radio', () => h(Radio)],
  ['radio-button', () => h(RadioButton)],
  ['radio-group', () => h(RadioGroup)],
  ['rate', () => h(Rate)],
  ['segmented', () => h(Segmented)],
  ['slider', () => h(Slider)],
  ['switch', () => h(Switch)]
] as const;

describe('表单控件的命名空间', () => {
  test.each(controls)('%s 响应最近 Provider 的命名空间变化', async (block, render) => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: { default: render }
    });
    try {
      expect(wrapper.find(`.acme-${block}`).exists()).toBe(true);
      expect(wrapper.find(`.i-${block}`).exists()).toBe(false);
      await wrapper.setProps({ namespace: 'brand' });
      expect(wrapper.find(`.brand-${block}`).exists()).toBe(true);
      expect(wrapper.find(`.acme-${block}`).exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  test('共享尺寸类和旧 BEM 修饰符随局部命名空间更新', async () => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme', size: 'small' },
      slots: { default: () => [
        h(Input),
        h(InputNumber, { modelValue: 1, max: 1 }),
        h(InputOtp),
        h(RadioGroup, { modelValue: 'selected', fill: 'teal' }, () => [
          h(RadioButton, { value: 'selected' }),
          h(Radio, { value: 'other', border: true })
        ]),
        h(Switch, { width: 48 }),
        h(ConfigProvider, { namespace: 'peer', size: 'large' }, () => h(Input))
      ] }
    });
    try {
      expect(wrapper.findAll('.acme-control--small')).toHaveLength(3);
      expect(wrapper.get('.acme-input-number__increase').classes()).toContain('acme-input-number__increase--disabled');
      expect(wrapper.get('.acme-radio').classes()).toContain('acme-radio--is-bordered');
      expect(wrapper.get('.acme-radio-button').classes()).toContain('acme-radio-button--is-checked');
      expect(wrapper.get('.acme-radio-group').attributes('style')).toContain('--acme-radio-button-checked-bg-color: teal');
      expect(wrapper.get('.acme-switch').attributes('style')).toContain('--acme-switch-width: 48px');
      expect(wrapper.find('.peer-input.peer-control--large').exists()).toBe(true);
      await wrapper.setProps({ namespace: 'brand' });
      expect(wrapper.findAll('.brand-control--small')).toHaveLength(3);
      expect(wrapper.get('.brand-switch').attributes('style')).not.toContain('--acme-switch-width');
      expect(wrapper.find('.peer-input.peer-control--large').exists()).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });

  test('RadioButton 可读取不同命名空间的组配色并使用自身样式', async () => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: { default: () => h(RadioGroup, { modelValue: 1, fill: 'teal', textColor: 'white' }, () =>
        h(ConfigProvider, { namespace: 'brand' }, () => [
          h(RadioButton, { value: 1, style: { color: 'navy' } }),
          h(RadioButton, { value: 2, style: { '--brand-radio-button-checked-bg-color': 'green' } })
        ])) }
    });
    try {
      const [checked, other] = wrapper.findAll('.brand-radio-button');
      expect(checked.attributes('style')).toContain('--brand-radio-button-checked-bg-color: var(--acme-radio-button-checked-bg-color)');
      expect(checked.attributes('style')).toContain('color: navy');
      expect(other.attributes('style')).toContain('--brand-radio-button-checked-bg-color: green');
      await wrapper.setProps({ namespace: 'i' });
      expect(checked.attributes('style')).toContain('--brand-radio-button-checked-bg-color: var(--i-radio-button-checked-bg-color)');
      await wrapper.setProps({ namespace: 'brand' });
      expect(checked.attributes('style')).not.toContain('--brand-radio-button-checked-bg-color');
    } finally {
      wrapper.unmount();
    }
  });

  test('RadioButton 空样式变量恢复组配色，保留根节点属性与事件', async () => {
    const inner = ref('acme');
    const override = ref<string | null | undefined>('navy');
    const stringStyle = ref(false);
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const key = (part: 'bg' | 'text') => `--${inner.value}-radio-button-checked-${part}-color`;
    const style = (): StyleValue => stringStyle.value
      ? `${key('bg')}: navy; ${key('text')}: navy; padding: 2px`
      : [{ padding: '2px' }, { [key('bg')]: override.value, [key('text')]: override.value }];
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'i' },
      slots: { default: () => h(RadioGroup, { modelValue: 'a', fill: 'teal', textColor: 'white' }, () =>
        h(ConfigProvider, { namespace: inner.value }, () =>
          h(RadioButton, {
            value: 'a', id: 'radio-button', class: 'user-button', 'data-probe': 'radio',
            'aria-label': '单选', onClick, onFocus, style: style()
          }))) }
    });
    try {
      const button = wrapper.get<HTMLLabelElement>('label#radio-button');
      const assertColors = (background: string, text: string) => {
        expect(button.element.style.getPropertyValue(key('bg'))).toBe(background);
        expect(button.element.style.getPropertyValue(key('text'))).toBe(text);
      };
      assertColors('navy', 'navy');
      for (const empty of [undefined, null, '']) {
        override.value = empty;
        await wrapper.vm.$nextTick();
        assertColors('var(--i-radio-button-checked-bg-color)', 'var(--i-radio-button-checked-text-color)');
      }
      await wrapper.setProps({ namespace: 'acme' });
      assertColors('', '');
      inner.value = 'i';
      await wrapper.vm.$nextTick();
      assertColors('var(--acme-radio-button-checked-bg-color)', 'var(--acme-radio-button-checked-text-color)');
      stringStyle.value = true;
      await wrapper.vm.$nextTick();
      assertColors('navy', 'navy');
      expect(button.element.style.padding).toBe('2px');
      expect(button.classes()).toContain('user-button');
      expect(button.attributes('data-probe')).toBe('radio');
      expect(button.attributes('aria-label')).toBe('单选');
      await button.trigger('click');
      await button.trigger('focus');
      expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
      expect(onFocus.mock.calls[0][0]).toBeInstanceOf(FocusEvent);
    } finally {
      wrapper.unmount();
    }
  });
});
