import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import TimeSelect from '..';
import Form from '../../form';
import FormItem from '../../form-item';

describe('test `TimeSelect` component', () => {
  test('按 start/step/end 生成时间点并选中', async () => {
    const wrapper = mount(TimeSelect, {
      props: { start: '09:00', step: '00:30', end: '10:00', modelValue: '' }
    });
    await wrapper.find('.i-time-select__control').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options.map((item) => item.text())).toEqual(['09:00', '09:30', '10:00']);
    await options[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['09:30']]);
    expect(wrapper.emitted('change')).toEqual([['09:30']]);
  });

  test('minTime/maxTime 禁用越界选项', async () => {
    const wrapper = mount(TimeSelect, {
      props: { start: '09:00', step: '01:00', end: '12:00', minTime: '10:00', maxTime: '11:00', modelValue: '' }
    });
    await wrapper.find('.i-time-select__control').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options.map((item) => item.classes().includes('is-disabled'))).toEqual([
      true,
      false,
      false,
      true
    ]);
    await options[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('清空输出空字符串并触发 clear', async () => {
    const wrapper = mount(TimeSelect, {
      props: { modelValue: '09:00' }
    });
    await wrapper.find('.i-time-select__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['']]);
    expect(wrapper.emitted('clear')).toHaveLength(1);
  });

  test('接入表单校验', async () => {
    const model = reactive<{ time: string }>({ time: '' });
    const wrapper = mount(Form, {
      props: { model, rules: { time: [{ required: true, message: '时间必填' }] } },
      slots: {
        default: () =>
          h(
            FormItem,
            { prop: 'time', label: '时间' },
            () =>
              h(TimeSelect, {
                modelValue: model.time,
                'onUpdate:modelValue': (v: string) => (model.time = v)
              })
          )
      }
    });
    await wrapper.find('.i-time-select__control').trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('时间必填');
    await wrapper.find('.i-time-select__control').trigger('click');
    await wrapper.findAll('[role="option"]')[0].trigger('click');
    await flushPromises();
    expect(wrapper.text()).not.toContain('时间必填');
  });
});
