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
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '姓名必填' }] });
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
  await form.validate().catch(() => undefined);
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

test('validate 失败拒绝并携带无效字段映射，通过时 resolve true', async () => {
  const model = reactive({ name: '' });
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ required: true, message: '姓名必填' }] } },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '姓名必填' }] });
  model.name = '有效值';
  await expect(form.validate()).resolves.toBe(true);
});

test('validate-on-rule-change 控制规则变化时的自动校验', async () => {
  const model = reactive({ name: '' });
  const rules = ref<Record<string, Array<{ required: boolean; message?: string }>>>({});
  const wrapper = mount(Form, {
    props: { model, rules: rules.value },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  await flushPromises();
  expect(wrapper.text()).not.toContain('自动规则');

  rules.value = { name: [{ required: true, message: '自动规则' }] };
  await wrapper.setProps({ rules: rules.value });
  await flushPromises();
  expect(wrapper.text()).toContain('自动规则');
  wrapper.unmount();

  const manual = mount(Form, {
    props: { model, rules: { name: [{ required: true, message: '关闭规则' }] }, validateOnRuleChange: false },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  await manual.setProps({ rules: { name: [{ required: true, message: '关闭规则' }] } });
  await flushPromises();
  expect(manual.text()).not.toContain('关闭规则');
});

test('scroll-to-error 与 scrollToErrorOffset 滚动定位无效字段', async () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  const model = reactive({ name: '' });
  const wrapper = mount(Form, {
    props: {
      model,
      rules: { name: [{ required: true, message: '必填' }] },
      scrollToError: true,
      scrollToErrorOffset: 20
    },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) },
    attachTo: document.body
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '必填' }] });
  expect(scrollTo).toHaveBeenCalled();
  scrollTo.mockRestore();
  wrapper.unmount();
});
test('Form 支持校验回调、字段状态、选择性操作和初始值更新', async () => {
  const model = reactive({ user: { name: '' }, age: '' });
  const name = ref<FormItemInstance>();
  const callback = vi.fn();
  const wrapper = mount(Form, {
    props: { model, scrollIntoViewOptions: { block: 'end' } },
    slots: {
      default: () => [
        h(FormItem, { ref: name, prop: ['user', 'name'], rules: { required: true, message: '必填' } }),
        h(FormItem, { prop: 'age', rules: { required: true, message: '年龄必填' }, validateStatus: 'success' })
      ]
    }
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validateField([['user', 'name']], callback)).resolves.toBe(false);
  expect(callback).toHaveBeenCalledWith(false, {
    'user.name': [{ message: '必填', field: 'user.name', fieldValue: '' }]
  });
  expect(name.value!.validateState).toBe('error');
  expect(form.getField(['user', 'name'])).toBe(form.fields[0]);
  expect(form.getField('age')?.validateState).toBe('success');
  const scrollIntoView = vi.fn();
  Object.defineProperty(wrapper.find('.i-form-item').element, 'scrollIntoView', { value: scrollIntoView });
  form.scrollToField('user.name');
  expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' });
  await expect(form.validate()).rejects.toHaveProperty('age');
  form.clearValidate('user.name');
  expect(name.value!.validateState).toBe('');
  expect(form.getField('age')?.validateState).toBe('error');
  const initial = { user: { name: '初始值' }, age: '18' };
  form.setInitialValues(initial);
  expect(model.user.name).toBe('');
  initial.user.name = '外部修改';
  form.resetFields([['user', 'name']]);
  expect(model).toEqual({ user: { name: '初始值' }, age: '' });
  await expect(form.validateField('user.name', callback)).resolves.toBe(true);
  expect(callback).toHaveBeenLastCalledWith(true);
});

test('复审：同路径字段迁移后保留字段可更新初值', async () => {
  const path = ref('name');
  const model = reactive({ name: '当前值', other: '' });
  const wrapper = mount(Form, {
    props: { model },
    slots: { default: () => [h(FormItem, { prop: path.value }), h(FormItem, { prop: 'name' })] }
  });
  const form = wrapper.vm as unknown as FormInstance;
  path.value = 'other';
  await flushPromises();
  form.setInitialValues({ name: '新初值', other: '其他' });
  form.resetFields('name');
  expect(model.name).toBe('新初值');
});

test('复审：值变更取消旧校验状态并保留更新一轮的状态', async () => {
  const pending: Array<(error?: Error) => void> = [];
  const model = reactive({ name: '旧值' });
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ validator: (_rule, _value, done) => { pending.push(done); } }] } },
    slots: { default: () => h(FormItem, { prop: 'name' }) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const field = form.getField('name')!;
  const old = field.validate();
  expect(field.validateState).toBe('validating');
  model.name = '新值';
  pending[0]();
  await expect(old).resolves.toBe(false);
  expect(field.validateState).toBe('');
  const abandoned = field.validate();
  model.name = '最新值';
  const current = field.validate();
  pending[1]();
  await expect(abandoned).resolves.toBe(false);
  expect(field.validateState).toBe('validating');
  pending[2](new Error('最新错误'));
  await expect(current).resolves.toBe(false);
  expect(field.validateState).toBe('error');
});

test('复审：滚动支持直接数组路径、旧字段列表和空列表', () => {
  const wrapper = mount(Form, {
    props: { model: { items: [{ name: '' }], other: '' } },
    slots: { default: () => [h(FormItem, { prop: 'items.0.name' }), h(FormItem, { prop: 'other' })] }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const scrolls = wrapper.findAll('.i-form-item').map(({ element }) => {
    const scroll = vi.fn();
    Object.defineProperty(element, 'scrollIntoView', { value: scroll });
    return scroll;
  });
  form.scrollToField(['items', '0', 'name']);
  expect(scrolls[0]).toHaveBeenCalledTimes(1);
  form.scrollToField(['other', 'items.0.name']);
  expect(scrolls[1]).toHaveBeenCalledTimes(1);
  form.scrollToField([]);
  expect(scrolls[0]).toHaveBeenCalledTimes(1);
  form.scrollToField();
  expect(scrolls[0]).toHaveBeenCalledTimes(2);
});

test('复审：重置复制类型化数组及其缓冲区', () => {
  const model = reactive({ value: new Uint8Array([0]) });
  const wrapper = mount(Form, {
    props: { model },
    slots: { default: () => h(FormItem, { prop: 'value' }) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const value = new Uint8Array([1]);
  form.setInitialValues({ value });
  value[0] = 2;
  form.resetFields();
  expect(model.value.length).toBe(1);
  expect(model.value[0]).toBe(1);
  model.value[0] = 3;
  form.resetFields();
  expect(model.value[0]).toBe(1);
});

test('二轮：外部进行状态在模型变更和旧内部校验完成后保持', async () => {
  let finish: (() => void) | undefined;
  const model = reactive({ name: '初值' });
  const status = ref<FormItemInstance['validateState']>('validating');
  const wrapper = mount(Form, {
    props: { model, rules: { name: [{ validator: (_rule, _value, done) => { finish = done; } }] } },
    slots: { default: () => h(FormItem, { prop: 'name', validateStatus: status.value }) }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const field = form.getField('name')!;
  model.name = '编辑';
  expect(field.validateState).toBe('validating');
  const pending = field.validate();
  status.value = 'success';
  await flushPromises();
  status.value = 'validating';
  await flushPromises();
  model.name = '再次编辑';
  finish?.();
  await expect(pending).resolves.toBe(false);
  expect(field.validateState).toBe('validating');
});

test('二轮：重置保留类方法并隔离有自有函数的实例初值', () => {
  class Value {
    constructor(public data: { count: number }) {}
    read() { return this.data.count; }
  }
  class WithFunction extends Value {
    format = function (this: Value) { return String(this.read()); };
  }
  const model = reactive({ plain: new Value({ count: 0 }), withFunction: new WithFunction({ count: 0 }) });
  const wrapper = mount(Form, {
    props: { model },
    slots: { default: () => [h(FormItem, { prop: 'plain' }), h(FormItem, { prop: 'withFunction' })] }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const plain = new Value({ count: 1 });
  const withFunction = new WithFunction({ count: 2 });
  form.setInitialValues({ plain, withFunction });
  plain.data.count = 3;
  withFunction.data.count = 4;
  form.resetFields();
  expect(model.plain.read()).toBe(1);
  expect(model.withFunction).toBeInstanceOf(WithFunction);
  expect(model.withFunction.format()).toBe('2');
  model.withFunction.data.count = 5;
  form.resetFields();
  expect(model.withFunction.format()).toBe('2');
});
