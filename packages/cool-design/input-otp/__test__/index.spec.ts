import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import InputOtp from '..';
import Form from '../../form';

const mountOtp = (props: Record<string, unknown> = {}, slots?: Record<string, unknown>, initial = '') => {
  const value = ref(initial);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(InputOtp, { ...props, modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }, slots)
    }),
    { attachTo: document.body }
  );
  return { wrapper, value, inputs: wrapper.findAll('input') };
};

describe('test `InputOtp` component', () => {
  test('逐格输入自动前进并更新 v-model', async () => {
    const { wrapper, value, inputs } = mountOtp({ length: 3 });
    await inputs[0].setValue('1');
    expect(value.value).toBe('1');
    await inputs[1].setValue('2');
    await inputs[2].setValue('3');
    expect(value.value).toBe('123');
    expect(inputs).toHaveLength(3);
    expect(document.activeElement).toBe(inputs[2].element);
    wrapper.unmount();
  });

  test('validator 拒绝非法字符', async () => {
    const { wrapper, value, inputs } = mountOtp({ length: 2, validator: (char: string) => /^\d$/.test(char) });
    await inputs[0].setValue('a');
    expect(value.value).toBe('');
    await inputs[0].setValue('7');
    expect(value.value).toBe('7');
    wrapper.unmount();
  });

  test('Backspace 清除当前格并回退', async () => {
    const { wrapper, value, inputs } = mountOtp({ length: 3 }, undefined, '123');
    await inputs[2].trigger('keydown', { key: 'Backspace' });
    expect(value.value).toBe('12');
    await inputs[1].trigger('keydown', { key: 'Backspace' });
    expect(value.value).toBe('1');
    await inputs[0].trigger('keydown', { key: 'Backspace' });
    expect(value.value).toBe('');
    wrapper.unmount();
  });

  test('粘贴分发字符，填满触发 finish', async () => {
    const { wrapper, value } = mountOtp({ length: 4 });
    const input = wrapper.findAll('input')[0];
    const event = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => '1234' } });
    input.element.dispatchEvent(event);
    await wrapper.vm.$nextTick();
    expect(value.value).toBe('1234');
    expect(wrapper.findComponent(InputOtp).emitted('finish')).toHaveLength(1);
    wrapper.unmount();
  });

  test('separator 字符串与插槽、mask 与类型尺寸类名', async () => {
    const { wrapper } = mountOtp({ length: 3, separator: '-' });
    expect(wrapper.findAll('.i-input-otp__separator')).toHaveLength(2);
    expect(wrapper.find('.i-input-otp__separator').text()).toBe('-');

    const slotted = mountOtp({ length: 2 }, { separator: () => h('span', '*') });
    expect(slotted.wrapper.find('.i-input-otp__separator').text()).toBe('*');

    const masked = mountOtp({ length: 2, mask: true, type: 'filled', size: 'large' });
    expect((masked.inputs[0].element as HTMLInputElement).type).toBe('password');
    expect(masked.wrapper.classes()).toEqual(expect.arrayContaining(['i-input-otp--filled', 'i-control--large']));
  });

  test('失焦触发 change，表单校验联动', async () => {
    const { wrapper, inputs } = mountOtp({ length: 2 });
    await inputs[0].setValue('9');
    const otp = wrapper.findComponent(InputOtp);
    expect(otp.emitted('change')).toBeUndefined();
    await inputs[0].trigger('blur');
    expect(otp.emitted('change')).toEqual([['9']]);
    expect(otp.emitted('focus')).toHaveLength(1);
    wrapper.unmount();
  });
});

test('InputOTP 直挂 Form 时继承尺寸和禁用', () => {
  const wrapper = mount(Form, {
    props: { model: {}, disabled: true, size: 'small' },
    slots: { default: () => h(InputOtp, { modelValue: '1234' }) }
  });
  const otp = wrapper.getComponent(InputOtp);
  const input = otp.get('input');
  input.element.value = '5';
  input.element.dispatchEvent(new Event('input'));
  expect(otp.emitted('update:modelValue')).toBeUndefined();
  expect(input.attributes('disabled')).toBeDefined();
  expect(otp.classes()).toContain('i-control--small');
  wrapper.unmount();
});

test('reports each newly completed value including edits to a full code', async () => {
  const wrapper = mount(InputOtp, { props: { length: 2, modelValue: '12' } });
  await wrapper.findAll('input')[1].setValue('3');
  await wrapper.findAll('input')[1].setValue('4');
  expect(wrapper.emitted('finish')).toEqual([['13'], ['14']]);
});
