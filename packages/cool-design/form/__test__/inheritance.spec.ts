import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, type Component } from 'vue';
import { expect, test, vi } from 'vitest';
import * as UI from '../../index';

const RadioGroupWithItem = defineComponent({
  setup(_, { attrs }) {
    return () => h(UI.RadioGroup, attrs, { default: () => h(UI.RadioButton, { value: 'a' }) });
  }
});

const controls = [
  ['Input', UI.Input, '.i-input', 'i-control--'],
  ['InputNumber', UI.InputNumber, '.i-input-number', 'i-control--'],
  ['InputTag', UI.InputTag, '.i-input-tag', 'i-control--'],
  ['InputOTP', UI.InputOtp, '.i-input-otp', 'i-control--'],
  ['Autocomplete', UI.Autocomplete, '.i-autocomplete', 'i-control--'],
  ['Mention', UI.Mention, '.i-mention', 'i-control--'],
  ['Select', UI.Select, '.i-select', 'i-control--'],
  ['SelectV2', UI.SelectV2, '.i-select-v2', 'i-control--'],
  ['TreeSelect', UI.TreeSelect, '.i-tree-select', 'i-tree-select--'],
  ['Cascader', UI.Cascader, '.i-cascader', 'i-control--'],
  ['DatePicker', UI.DatePicker, '.i-date-picker', 'i-control--'],
  ['DateTimePicker', UI.DateTimePicker, '.i-date-picker', 'i-control--'],
  ['TimePicker', UI.TimePicker, '.i-time-picker', 'i-control--'],
  ['TimeSelect', UI.TimeSelect, '.i-time-select', 'i-control--'],
  ['ColorPicker', UI.ColorPicker, '.i-color-picker', 'i-color-picker--'],
  ['Checkbox', UI.Checkbox, '.i-checkbox', 'is-'],
  ['CheckboxButton', UI.CheckboxButton, '.i-checkbox-button', 'is-'],
  ['CheckboxGroup', UI.CheckboxGroup, '.i-checkbox-group', 'is-'],
  ['Radio', UI.Radio, '.i-radio', 'i-radio--'],
  ['RadioButton', UI.RadioButton, '.i-radio-button', 'i-radio-button--'],
  ['RadioGroup', RadioGroupWithItem, '.i-radio-button', 'i-radio-button--'],
  ['Switch', UI.Switch, '.i-switch', 'i-switch--'],
  ['Rate', UI.Rate, '.i-rate', 'i-rate--'],
  ['Slider', UI.Slider, '.i-slider', 'i-slider--'],
  ['Segmented', UI.Segmented, '.i-segmented', 'i-segmented--']
] satisfies Array<[string, Component, string, string]>;

test.each(controls)('%s 继承尺寸的四级优先顺序', (_, control: Component, selector, prefix) => {
  const wrapper = mount(UI.ConfigProvider, {
    props: { size: 'large' },
    slots: { default: () => [
      h(control),
      h(UI.Form, { model: {}, size: 'small' }, { default: () => [
        h(control),
        h(UI.FormItem, { size: 'large' }, { default: () => h(control) }),
        h(UI.FormItem, { size: 'large' }, { default: () => h(control, { size: 'small' }) })
      ] })
    ] }
  });
  try {
    const elements = wrapper.findAll(selector);
    expect(elements).toHaveLength(4);
    for (const [index, size] of ['large', 'small', 'large', 'small'].entries()) {
      expect(elements[index].classes()).toContain(prefix + size);
    }
  } finally {
    wrapper.unmount();
  }
});

const validationCases = [
  ['Input', UI.Input, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['InputOTP', UI.InputOtp, { modelValue: '' }, 'input', 'input'],
  ['Slider', UI.Slider, { modelValue: 10 }, '[role="slider"]', 'keydown'],
  ['Segmented', UI.Segmented, { modelValue: 'a', options: ['a', 'b'] }, '[role="radiogroup"] button:nth-child(2)', 'click'],
  ['InputTag', UI.InputTag, { modelValue: ['a'], clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['Autocomplete', UI.Autocomplete, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['Mention', UI.Mention, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['Cascader', UI.Cascader, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['Select', UI.Select, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['SelectV2', UI.SelectV2, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['TreeSelect', UI.TreeSelect, { modelValue: 'a', clearable: true }, 'button[aria-label="清空"]', 'click'],
  ['DatePicker', UI.DatePicker, { modelValue: '2026-11-21' }, 'button[aria-label="清空"]', 'click'],
  ['DateTimePicker', UI.DateTimePicker, { modelValue: '2026-11-21 09:00:00' }, 'button[aria-label="清空"]', 'click'],
  ['TimePicker', UI.TimePicker, { modelValue: '09:00:00' }, 'button[aria-label="清空"]', 'click'],
  ['TimeSelect', UI.TimeSelect, { modelValue: '09:00' }, 'button[aria-label="清空"]', 'click'],
  ['Checkbox', UI.Checkbox, { modelValue: false }, 'input[type="checkbox"]', 'change'],
  ['Switch', UI.Switch, { modelValue: false }, 'input[type="checkbox"]', 'change'],
  ['InputNumber', UI.InputNumber, { modelValue: 1 }, 'button[aria-label="增加"]', 'click'],
  ['ColorPicker', UI.ColorPicker, { modelValue: '#409eff', teleported: false }, '.i-color-picker__clear', 'click', '.i-color-picker__trigger'],
  ['CheckboxGroup', UI.CheckboxGroup, { modelValue: [], options: [{ value: 'a', label: 'A' }] }, 'input[type="checkbox"]', 'change'],
  ['RadioGroup', RadioGroupWithItem, { modelValue: 'b' }, 'input[type="radio"]', 'change'],
  ['Transfer', UI.Transfer, { data: [{ key: 1, label: '一' }], leftDefaultChecked: [1] }, 'button[aria-label="移到右侧"]', 'click']
] satisfies Array<[string, Component, Record<string, unknown>, string, string, string?]>;

test.each(validationCases)('%s 的表单禁用和自动校验开关', async (_, control: Component, props, selector, event, openSelector) => {
  for (const [disabled, validateEvent, expectedCalls] of [[false, false, 0], [false, true, 1], [true, true, 0]] as const) {
    const validator = vi.fn(() => true);
    const wrapper = mount(UI.Form, {
      props: { model: { value: props.modelValue }, disabled },
      slots: { default: () => h(UI.FormItem, {
        prop: 'value', rules: { validator, trigger: 'change' }
      }, { default: () => h(control, { ...props, validateEvent }) }) }
    });
    try {
      if (openSelector) await wrapper.get(openSelector).trigger('click');
      const target = wrapper.find(selector);
      if (target.exists()) {
        if (target.element instanceof HTMLInputElement && event === 'change') target.element.checked = true;
        if (target.element instanceof HTMLInputElement && event === 'input') target.element.value = '5';
        target.element.dispatchEvent(event === 'keydown'
          ? new KeyboardEvent(event, { key: 'ArrowRight', bubbles: true })
          : new Event(event, { bubbles: true }));
      } else {
        expect(disabled).toBe(true);
      }
      await flushPromises();
      const modelUpdates = wrapper.getComponent(control === RadioGroupWithItem ? UI.RadioGroup : control).emitted('update:modelValue') ?? [];
      expect(modelUpdates).toHaveLength(disabled ? 0 : 1);
      expect(validator).toHaveBeenCalledTimes(expectedCalls);
    } finally {
      wrapper.unmount();
    }
  }
});

test.each([
  ['Select', UI.Select, { modelValue: ['a'], options: [{ value: 'a', label: 'A' }] }],
  ['SelectV2', UI.SelectV2, { modelValue: ['a'], options: [{ value: 'a', label: 'A' }] }],
  ['TreeSelect', UI.TreeSelect, { modelValue: ['a'], data: [{ value: 'a', label: 'A' }] }],
  ['Cascader', UI.Cascader, { modelValue: ['a'], options: [{ value: 'a', label: 'A' }], emitPath: false }]
] satisfies Array<[string, Component, Record<string, unknown>]>)('%s 禁用 Form 后不能移除标签', async (_, control: Component, props) => {
  const wrapper = mount(UI.Form, {
    props: { model: {} },
    slots: { default: () => h(control, { multiple: true, ...props }) }
  });
  try {
    const select = wrapper.getComponent(control);
    const remove = select.get('[aria-label^="移除"]');
    await wrapper.setProps({ disabled: true });
    remove.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const combobox = select.find('[role="combobox"]');
    if (combobox.exists()) combobox.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(select.emitted('remove-tag')).toBeUndefined();
    expect(select.emitted('update:modelValue')).toBeUndefined();
  } finally {
    wrapper.unmount();
  }
});
