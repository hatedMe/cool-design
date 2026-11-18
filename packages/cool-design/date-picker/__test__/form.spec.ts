import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import { expect, test } from 'vitest';
import Form from '../../form';
import type { FormInstance } from '../../form';
import FormItem from '../../form-item';
import DatePicker from '../date-picker';
import DateTimePicker from '../date-time-picker';

test('DatePicker 清空触发表单 change 校验，validateEvent=false 不触发', async () => {
  const model = reactive<{ date: Date | null }>({ date: new Date() });
  const wrapper = mount(Form, {
    props: {
      model,
      rules: { date: [{ required: true, type: 'date', message: '日期必填', trigger: 'change' }] }
    },
    slots: {
      default: () =>
        h(
          FormItem,
          { prop: 'date', label: '日期' },
          () =>
            h(DatePicker, {
              modelValue: model.date,
              clearable: true,
              'onUpdate:modelValue': (v: Date | null) => (model.date = v)
            })
        )
    }
  });
  expect(wrapper.text()).not.toContain('日期必填');
  await wrapper.find('button[aria-label="清空"]').trigger('click');
  await flushPromises();
  expect(wrapper.text()).toContain('日期必填');

  const silentModel = reactive<{ date: Date | null }>({ date: new Date() });
  const silent = mount(Form, {
    props: {
      model: silentModel,
      rules: { date: [{ required: true, type: 'date', message: '日期必填', trigger: 'change' }] }
    },
    slots: {
      default: () =>
        h(
          FormItem,
          { prop: 'date', label: '日期' },
          () =>
            h(DatePicker, {
              modelValue: silentModel.date,
              clearable: true,
              validateEvent: false,
              'onUpdate:modelValue': (v: Date | null) => (silentModel.date = v)
            })
        )
    }
  });
  await silent.find('button[aria-label="清空"]').trigger('click');
  await flushPromises();
  expect(silent.text()).not.toContain('日期必填');
});

test('Form validate 后校验失败聚焦首个错误字段', async () => {
  const model = reactive<{ date: Date | null }>({ date: null });
  const wrapper = mount(Form, {
    props: { model, rules: { date: [{ required: true, type: 'date', message: '日期必填' }] } },
    slots: {
      default: () =>
        h(
          FormItem,
          { prop: 'date', label: '日期' },
          () => h(DatePicker, { modelValue: model.date, 'onUpdate:modelValue': (v: Date | null) => (model.date = v) })
        )
    },
    attachTo: document.body
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validate()).rejects.toEqual({ date: ['日期必填'] });
  await flushPromises();
  expect(document.activeElement).toBe(wrapper.find('input').element);
  wrapper.unmount();
});

test('DateTimePicker 转发 date 单元格插槽', async () => {
  const wrapper = mount(DateTimePicker, {
    props: { modelValue: null, teleported: false },
    slots: { default: () => '自定义单元格' }
  });
  await wrapper.find('input').trigger('click');
  expect(wrapper.text()).toContain('自定义单元格');
});
