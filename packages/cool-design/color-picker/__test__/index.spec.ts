import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import ColorPicker from '..';
import * as CoolDesign from '../../index';

describe('ColorPicker', () => {
  test('opens the panel and emits active-change while selecting a color', async () => {
    const wrapper = mount(ColorPicker, { props: { modelValue: '#409eff' } });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const input = wrapper.find('input[type="color"]');
    (input.element as HTMLInputElement).value = '#ff0000';
    await input.trigger('input');

    expect(wrapper.emitted('update:modelValue')).toEqual([['#ff0000']]);
    expect(wrapper.emitted('active-change')).toEqual([['#ff0000']]);
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  test('emits change when the native color input is committed', async () => {
    const wrapper = mount(ColorPicker, { props: { modelValue: '#409eff' } });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const input = wrapper.find('input[type="color"]');
    (input.element as HTMLInputElement).value = '#00ff00';
    await input.trigger('input');
    await input.trigger('change');

    expect(wrapper.emitted('change')).toEqual([['#00ff00']]);
  });

  test('updates alpha and formats the value as rgba', async () => {
    const wrapper = mount(ColorPicker, {
      props: { modelValue: '#409eff', showAlpha: true, colorFormat: 'rgb' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const alpha = wrapper.find('input[type="range"]');
    await alpha.setValue('50');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['rgba(64, 158, 255, 0.5)']);
    expect(wrapper.emitted('active-change')?.at(-1)).toEqual(['rgba(64, 158, 255, 0.5)']);
  });

  test('does not allow preset or alpha changes when disabled', async () => {
    const wrapper = mount(ColorPicker, {
      props: { modelValue: '#409eff', showAlpha: true, disabled: true, predefine: ['#f00'] }
    });

    expect(wrapper.find('.i-color-picker__trigger').attributes('disabled')).toBeDefined();
    await wrapper.find('.i-color-picker__trigger').trigger('click');
    expect(wrapper.find('.i-color-picker__panel').exists()).toBe(false);
  });

  test('uses hsl model values as the native color input value', async () => {
    const wrapper = mount(ColorPicker, {
      props: { modelValue: 'hsl(120, 100%, 50%)', colorFormat: 'hsl' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    expect((wrapper.find('input[type="color"]').element as HTMLInputElement).value).toBe('#00ff00');
  });

  test('synchronizes alpha when the controlled model value changes', async () => {
    const wrapper = mount(ColorPicker, {
      props: { modelValue: 'rgba(255, 0, 0, 0.5)', showAlpha: true, colorFormat: 'rgb' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    await wrapper.setProps({ modelValue: '#00ff00' });

    expect((wrapper.find('input[type="range"]').element as HTMLInputElement).value).toBe('100');
  });

  test('integrates with form field context for id, disabled and validation', async () => {
    const model = reactive<{ color: string }>({ color: '#409eff' });
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            CoolDesign.Form,
            {
              model,
              rules: {
                color: [
                  {
                    trigger: 'change',
                    validator: (value: unknown) => {
                      if (value === '#ff0000') throw new Error('禁止选择红色');
                    }
                  }
                ]
              }
            },
            () =>
              h(CoolDesign.FormItem, { prop: 'color', label: '颜色' }, () =>
                h(ColorPicker, {
                  modelValue: model.color,
                  'onUpdate:modelValue': (value: string) => (model.color = value)
                })
              )
          )
      })
    );
    const trigger = wrapper.find('.i-color-picker__trigger');
    const fieldId = trigger.attributes('id');
    expect(fieldId).toMatch(/^i-field-/);
    expect(wrapper.find('label').attributes('for')).toBe(fieldId);

    await trigger.trigger('click');
    const input = wrapper.find('input[type="color"]');
    (input.element as HTMLInputElement).value = '#ff0000';
    await input.trigger('input');
    await input.trigger('change');
    await flushPromises();

    expect(wrapper.text()).toContain('禁止选择红色');
    expect(trigger.attributes('aria-invalid')).toBe('true');
    expect(trigger.attributes('aria-describedby')).toBe(`${fieldId}-error`);
    wrapper.unmount();

    const disabledWrapper = mount(
      defineComponent({
        setup: () => () =>
          h(CoolDesign.Form, { model, disabled: true }, () =>
            h(CoolDesign.FormItem, { prop: 'color', label: '颜色' }, () =>
              h(ColorPicker, { modelValue: model.color })
            )
          )
      })
    );
    expect(disabledWrapper.find('.i-color-picker__trigger').attributes('disabled')).toBeDefined();
    expect(disabledWrapper.find('.i-color-picker').classes()).toContain('is-disabled');
  });
});
