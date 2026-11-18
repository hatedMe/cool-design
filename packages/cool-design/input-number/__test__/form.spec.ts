import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import { expect, test } from 'vitest';
import Form from '../../form';
import type { FormInstance } from '../../form';
import FormItem from '../../form-item';
import InputNumber from '..';

test('InputNumber 接入表单校验，变更后触发 change 校验', async () => {
  const model = reactive<{ count: number | null }>({ count: null });
  const wrapper = mount(Form, {
    props: { model, rules: { count: [{ required: true, type: 'number', message: '数量必填' }] } },
    slots: {
      default: () =>
        h(
          FormItem,
          { prop: 'count', label: '数量' },
          () => h(InputNumber, { modelValue: model.count, 'onUpdate:modelValue': (v: number | null) => (model.count = v) })
        )
    }
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validate()).rejects.toEqual({ count: ['数量必填'] });
  await flushPromises();
  expect(wrapper.text()).toContain('数量必填');

  await wrapper.find('button[aria-label="增加"]').trigger('click');
  await flushPromises();
  expect(model.count).toBe(1);
  expect(wrapper.text()).not.toContain('数量必填');
});

test('InputNumber validateEvent=false 不触发表单校验', async () => {
  const model = reactive<{ count: number | null }>({ count: null });
  const wrapper = mount(Form, {
    props: { model, rules: { count: [{ required: true, type: 'number', message: '数量必填' }] } },
    slots: {
      default: () =>
        h(
          FormItem,
          { prop: 'count', label: '数量' },
          () =>
            h(InputNumber, {
              modelValue: model.count,
              validateEvent: false,
              'onUpdate:modelValue': (v: number | null) => (model.count = v)
            })
        )
    }
  });
  await wrapper.find('button[aria-label="增加"]').trigger('click');
  await flushPromises();
  expect(model.count).toBe(1);
  expect(wrapper.text()).not.toContain('数量必填');
});
