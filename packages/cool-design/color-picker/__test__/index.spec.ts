import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import ColorPicker from '..';
import * as CoolDesign from '../../index';

describe('ColorPicker', () => {
  test('opens the panel and emits active-change while selecting a color', async () => {
    const wrapper = mount(ColorPicker, { props: { teleported: false, modelValue: '#409eff' } });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const input = wrapper.find('input[type="color"]');
    (input.element as HTMLInputElement).value = '#ff0000';
    await input.trigger('input');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('active-change')).toEqual([['#ff0000']]);
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  test('emits change only after confirming the preview', async () => {
    const wrapper = mount(ColorPicker, { props: { teleported: false, modelValue: '#409eff' } });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const input = wrapper.find('input[type="color"]');
    (input.element as HTMLInputElement).value = '#00ff00';
    await input.trigger('input');
    await input.trigger('change');
    expect(wrapper.emitted('change')).toBeUndefined();
    await wrapper.find('.i-color-picker__confirm').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['#00ff00']]);
    expect(wrapper.emitted('change')).toEqual([['#00ff00']]);
  });

  test('updates alpha and formats the value as rgba', async () => {
    const wrapper = mount(ColorPicker, {
      props: { teleported: false, modelValue: '#409eff', showAlpha: true, colorFormat: 'rgb' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    const alpha = wrapper.find('input[aria-label="透明度"]');
    await alpha.setValue('50');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('active-change')?.at(-1)).toEqual(['rgba(64, 158, 255, 0.5)']);
  });

  test('does not allow preset or alpha changes when disabled', async () => {
    const wrapper = mount(ColorPicker, {
      props: { teleported: false, modelValue: '#409eff', showAlpha: true, disabled: true, predefine: ['#f00'] }
    });

    expect(wrapper.find('.i-color-picker__trigger').attributes('disabled')).toBeDefined();
    await wrapper.find('.i-color-picker__trigger').trigger('click');
    expect(wrapper.find('.i-color-picker__panel').exists()).toBe(false);
  });

  test('uses hsl model values as the native color input value', async () => {
    const wrapper = mount(ColorPicker, {
      props: { teleported: false, modelValue: 'hsl(120, 100%, 50%)', colorFormat: 'hsl' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    expect((wrapper.find('input[type="color"]').element as HTMLInputElement).value).toBe('#00ff00');
  });

  test('synchronizes alpha when the controlled model value changes', async () => {
    const wrapper = mount(ColorPicker, {
      props: { teleported: false, modelValue: 'rgba(255, 0, 0, 0.5)', showAlpha: true, colorFormat: 'rgb' }
    });

    await wrapper.find('.i-color-picker__trigger').trigger('click');
    await wrapper.setProps({ modelValue: '#00ff00' });

    expect((wrapper.find('input[aria-label="透明度"]').element as HTMLInputElement).value).toBe('100');
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
                  teleported: false,
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
    expect(wrapper.findComponent(ColorPicker).emitted('change')).toBeUndefined();
    await wrapper.find('.i-color-picker__confirm').trigger('click');
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


test('supports show/hide, clear, teleport target and discard on hide', async () => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const wrapper = mount(ColorPicker, { props: { modelValue: '#409eff', appendTo: target } });
  const vm = wrapper.vm as unknown as { show: () => void; hide: () => void };
  vm.show();
  await flushPromises();
  const panel = new DOMWrapper(target);
  expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  await panel.find('input[type="color"]').setValue('#ff0000');
  vm.hide();
  await flushPromises();
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  vm.show();
  await flushPromises();
  expect((panel.find('input[type="color"]').element as HTMLInputElement).value).toBe('#409eff');
  await panel.find('.i-color-picker__clear').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
  expect(wrapper.emitted('change')).toEqual([[null]]);
  expect(panel.find('[role="dialog"]').isVisible()).toBe(false);
  wrapper.unmount();
  target.remove();
});

test('clearable false hides clear and disabled show does not open', async () => {
  const wrapper = mount(ColorPicker, { props: { teleported: false, clearable: false } });
  await wrapper.find('button').trigger('click');
  expect(wrapper.find('.i-color-picker__clear').exists()).toBe(false);
  await wrapper.setProps({ disabled: true });
  (wrapper.vm as unknown as { show: () => void }).show();
  expect(wrapper.find('[role="dialog"]').isVisible()).toBe(false);
  wrapper.unmount();
});

test('predefined alpha colors remain previews until confirmed', async () => {
  const wrapper = mount(ColorPicker, { props: {
    teleported: false, showAlpha: true, colorFormat: 'rgb', predefine: ['rgba(255, 0, 0, 0.5)']
  } });
  await wrapper.find('.i-color-picker__trigger').trigger('click');
  await wrapper.find('.i-color-picker__presets button').trigger('click');
  expect(wrapper.emitted('active-change')).toEqual([['rgba(255, 0, 0, 0.5)']]);
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.find('.i-color-picker__confirm').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([['rgba(255, 0, 0, 0.5)']]);
  wrapper.unmount();
});

test('ColorPicker 清空使用 Provider 工厂一次并接受受控布尔值', async () => {
  let calls = 0;
  const state = reactive({ value: '#409eff' as string | boolean });
  const warnings: string[] = [];
  const wrapper = mount(CoolDesign.ConfigProvider, {
    props: { valueOnClear: () => { calls++; return false; }, emptyValues: [false] },
    global: { config: { warnHandler: (warning) => warnings.push(warning) } },
    slots: { default: () => h(ColorPicker, { modelValue: state.value, teleported: false,
      'onUpdate:modelValue': (next: unknown) => { if (typeof next === 'boolean') state.value = next; } }) }
  });
  const picker = wrapper.getComponent(ColorPicker);
  await picker.get('.i-color-picker__trigger').trigger('click');
  expect(calls).toBe(0);
  await picker.get('.i-color-picker__clear').trigger('click');
  expect(picker.emitted('update:modelValue')).toEqual([[false]]);
  expect(picker.emitted('change')).toEqual([[false]]);
  expect(picker.emitted('clear')).toEqual([[]]);
  expect(state.value).toBe(false);
  expect(calls).toBe(1);
  expect(warnings).toEqual([]);
  wrapper.unmount();
});

test('ColorPicker 受控 undefined 清空后维持空颜色', async () => {
  const state = reactive<{ value?: string }>({ value: '#ff0000' });
  const wrapper = mount(defineComponent({
    setup: () => () => h(ColorPicker, { modelValue: state.value, valueOnClear: () => undefined,
      teleported: false, 'onUpdate:modelValue': () => { state.value = undefined; } })
  }));
  await wrapper.get('.i-color-picker__trigger').trigger('click');
  await wrapper.get('.i-color-picker__clear').trigger('click');
  expect((wrapper.get('.i-color-picker__trigger').element as HTMLElement).style.backgroundColor).toBe('');
  wrapper.unmount();
});

test('ColorPicker 尺寸按组件、FormItem、Form、Provider 顺序继承', async () => {
  const state = reactive<{ size?: 'small' | 'large' }>({});
  const wrapper = mount(CoolDesign.ConfigProvider, {
    props: { size: 'small' },
    slots: { default: () => [
      h(ColorPicker),
      h(CoolDesign.Form, { size: 'large', model: {} }, { default: () => [
        h(ColorPicker),
        h(CoolDesign.FormItem, {}, { default: () => h(ColorPicker) }),
        h(CoolDesign.FormItem, { size: 'small' }, { default: () => h(ColorPicker, { size: state.size }) })
      ] })
    ] }
  });
  const pickers = wrapper.findAll('.i-color-picker');
  expect(pickers[0].classes()).toContain('i-color-picker--small');
  expect(pickers[1].classes()).toContain('i-color-picker--large');
  expect(pickers[2].classes()).toContain('i-color-picker--large');
  expect(pickers[3].classes()).toContain('i-color-picker--small');
  state.size = 'large';
  await wrapper.vm.$nextTick();
  expect(pickers[3].classes()).toContain('i-color-picker--large');
  wrapper.unmount();
});

test('ColorPicker 直挂禁用 Form 时无法打开或提交', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {}, disabled: true },
    slots: { default: () => h(ColorPicker, { modelValue: '#409eff', teleported: false }) }
  });
  const picker = wrapper.getComponent(ColorPicker);
  const trigger = picker.get('.i-color-picker__trigger');
  trigger.element.dispatchEvent(new MouseEvent('click'));
  await wrapper.vm.$nextTick();
  expect(trigger.attributes('disabled')).toBeDefined();
  expect(picker.find('.i-color-picker__confirm').exists()).toBe(false);
  expect(picker.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});

test('动态禁用 ColorPicker 清除草稿并结束展开状态', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {} },
    slots: { default: () => h(ColorPicker, { modelValue: '#409eff', teleported: false }) }
  });
  const picker = wrapper.getComponent(ColorPicker);
  const trigger = picker.get('.i-color-picker__trigger');
  await trigger.trigger('click');
  const input = picker.get('input[type="color"]');
  await input.setValue('#ff0000');
  await wrapper.setProps({ disabled: true });
  expect(trigger.attributes('aria-expanded')).toBe('false');
  await wrapper.setProps({ disabled: false });
  expect(picker.find('.i-color-picker__confirm').isVisible()).toBe(false);
  await trigger.trigger('click');
  expect(picker.get('input[type="color"]').element.value).toBe('#409eff');
  wrapper.unmount();
});

test('keeps a real panel mounted and discards preview on close', async () => {
  const wrapper = mount(ColorPicker, { props: { modelValue: '#ff0000', teleported: false, persistent: true, popperStyle: { width: '300px' } } });
  await wrapper.get('.i-color-picker__trigger').trigger('click');
  const panel = wrapper.getComponent(CoolDesign.ColorPickerPanel);
  expect(wrapper.get('[role="dialog"]').attributes('style')).toContain('300px');
  const native = wrapper.get('input[type="color"]');
  await native.setValue('#00ff00');
  await wrapper.vm.$nextTick();
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('.i-color-picker__trigger').trigger('click');
  expect(wrapper.getComponent(CoolDesign.ColorPickerPanel).vm).toBe(panel.vm);
  await wrapper.get('.i-color-picker__trigger').trigger('click');
  expect(native.element.value).toBe('#ff0000');
});

test('ignores invalid text and accepts repeated text after a native color edit', async () => {
  const wrapper = mount(ColorPicker, { props: { teleported: false, modelValue: '#ff0000' } });
  await wrapper.get('.i-color-picker__trigger').trigger('click');
  const text = wrapper.get('input[aria-label="颜色文本"]');
  await text.setValue('not-a-color');
  expect(text.element.value).toBe('#ff0000');
  await text.setValue('#00ff00');
  await wrapper.get('input[type="color"]').setValue('#0000ff');
  await text.setValue('#00ff00');
  await wrapper.get('.i-color-picker__confirm').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([['#00ff00']]);
});
