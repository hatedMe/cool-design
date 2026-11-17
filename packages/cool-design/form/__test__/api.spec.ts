import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import Form from '../index';
import type { FormInstance, FormItemInstance } from '../index';
import FormItem from '../../form-item';

test('Form validate 事件逐字段上报校验结果', async () => {
  const model = reactive({ name: '', age: 1 });
  const onValidate = vi.fn();
  const wrapper = mount(Form, {
    props: {
      model,
      rules: { name: [{ required: true, message: '姓名必填' }], age: [{ type: 'number', message: '年龄需为数字' }] },
      onValidate
    },
    slots: {
      default: () => [
        h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')),
        h(FormItem, { prop: 'age', label: '年龄' }, () => h('input'))
      ]
    },
    attachTo: document.body
  });
  const form = wrapper.vm as unknown as FormInstance;
  expect(await form.validate()).toBe(false);
  expect(onValidate).toHaveBeenCalledWith('name', false, '姓名必填');
  expect(onValidate).toHaveBeenCalledWith('age', true, undefined);
  wrapper.unmount();
});

test('FormItem 单项 rules 覆盖表单规则，error 属性手动错误优先', async () => {
  const model = reactive({ name: 'abc' });
  const itemRef = ref<FormItemInstance>();
  const manualError = ref<string | undefined>(undefined);
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ min: 10, message: '表单规则' }] } },
    slots: {
      default: () =>
        h(
          FormItem,
          {
            ref: itemRef,
            prop: 'name',
            label: '姓名',
            error: manualError.value,
            rules: [{ min: 5, message: '单项规则' }]
          },
          () => h('input')
        )
    }
  });
  expect(await itemRef.value!.validate()).toBe(false);
  expect(wrapper.text()).toContain('单项规则');
  expect(wrapper.text()).not.toContain('表单规则');

  manualError.value = '手动错误';
  await flushPromises();
  expect(wrapper.text()).toContain('手动错误');
  expect(wrapper.text()).not.toContain('单项规则');
  manualError.value = undefined;
  await flushPromises();
  expect(wrapper.text()).toContain('单项规则');
});

test('FormItem 实例方法 resetField 与 clearValidate', async () => {
  const model = reactive({ name: '' });
  const itemRef = ref<FormItemInstance>();
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ required: true, message: '姓名必填' }] } },
    slots: { default: () => h(FormItem, { ref: itemRef, prop: 'name', label: '姓名' }, () => h('input')) }
  });
  expect(await itemRef.value!.validate()).toBe(false);
  expect(wrapper.text()).toContain('姓名必填');
  itemRef.value!.clearValidate();
  await flushPromises();
  expect(wrapper.text()).not.toContain('姓名必填');
  model.name = '改动';
  itemRef.value!.resetField();
  expect(model.name).toBe('');
});

test('hide-required-asterisk 与 require-asterisk-position 控制星号', () => {
  const model = reactive({ name: '' });
  const hidden = mount(Form, {
    props: { model, hideRequiredAsterisk: true },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名', required: true }, () => h('input')) }
  });
  expect(hidden.find('.i-form-item__required').exists()).toBe(false);

  const right = mount(Form, {
    props: { model, requireAsteriskPosition: 'right' },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名', required: true }, () => h('input')) }
  });
  expect(right.find('label').text()).toBe('姓名*');
});

test('inline-message 与 status-icon 生效', async () => {
  const model = reactive({ name: '' });
  const wrapper = mount(Form, {
    props: {
      model,
      rules: { name: [{ required: true, message: '姓名必填' }] },
      inlineMessage: true,
      statusIcon: true
    },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  await form.validate();
  await flushPromises();
  expect(wrapper.find('.i-form-item__error').classes()).toContain('is-inline-message');
  expect(wrapper.find('.i-form-item__status-icon').classes()).toContain('is-error');
});

test('无 prop 的 FormItem 仅做布局，fields 不注册', async () => {
  const model = reactive({});
  const wrapper = mount(Form, {
    props: { model },
    slots: { default: () => h(FormItem, { label: '说明' }, () => h('input')) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  expect(await form.validate()).toBe(true);
  expect(wrapper.find('label').text()).toContain('说明');
  expect(form.fields).toHaveLength(0);
});

test('Form scrollToField 与 fields 暴露字段上下文', async () => {
  const model = reactive({ name: '' });
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ required: true, message: '必填' }] } },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) },
    attachTo: document.body
  });
  const form = wrapper.vm as unknown as FormInstance;
  expect(form.fields.map((field) => field.prop)).toEqual(['name']);
  expect(() => form.scrollToField('name')).not.toThrow();
  expect(() => form.scrollToField()).not.toThrow();
  wrapper.unmount();
});
