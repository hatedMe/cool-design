import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, reactive, ref } from 'vue';
import { expect, test } from 'vitest';
import Form from '../index';
import type { FormInstance, FormRule } from '../index';
import FormItem from '../../form-item';
import Input from '../../input';

function createForm(rules: FormRule[] = [{ required: true, message: '姓名必填' }]) {
  const formRef = ref<FormInstance>();
  const model = reactive({ name: '初始值' });
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(
          Form,
          { ref: formRef, model, rules: { name: rules } },
          {
            default: () =>
              h(
                FormItem,
                { prop: 'name', label: '姓名' },
                {
                  default: () =>
                    h(Input, {
                      modelValue: model.name,
                      'onUpdate:modelValue': (v: string) => (model.name = v)
                    })
                }
              )
          }
        )
    }),
    { attachTo: document.body }
  );
  return { w, model, form: formRef.value! };
}

test('必填错误关联字段，校验聚焦，重置恢复初值', async () => {
  const { w, model, form } = createForm();
  model.name = '   ';
  expect(await form.validate()).toBe(false);
  await flushPromises();
  expect(w.text()).toContain('姓名必填');
  expect(w.find('input').attributes('aria-invalid')).toBe('true');
  expect(document.activeElement).toBe(w.find('input').element);
  expect(w.find('label').attributes('for')).toBe(w.find('input').attributes('id'));
  model.name = '有效姓名';
  expect(await form.validate()).toBe(true);
  form.resetFields();
  expect(model.name).toBe('初始值');
  w.unmount();
});

test('过期异步校验不覆盖新结果，清除错误使待完成校验失效', async () => {
  let rejectOld!: (e: Error) => void;
  const { w, model, form } = createForm([
    {
      validator: (value) =>
        value === '旧值' ? new Promise<void>((_, reject) => (rejectOld = reject)) : Promise.resolve()
    }
  ]);
  model.name = '旧值';
  const old = form.validate();
  model.name = '新值';
  expect(await form.validate()).toBe(true);
  rejectOld(new Error('旧错误'));
  await old;
  await flushPromises();
  expect(w.text()).not.toContain('旧错误');
  model.name = '旧值';
  const pending = form.validate();
  form.clearValidate();
  rejectOld(new Error('清除后的错误'));
  await pending;
  await flushPromises();
  expect(w.text()).not.toContain('清除后的错误');
  w.unmount();
});

test('仅 blur 触发的规则不会被无对应规则的 change 清空错误', async () => {
  const { w, form } = createForm([{ required: true, message: '姓名必填', trigger: 'blur' }]);
  const input = w.find('input').element;
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(await form.validate()).toBe(false);
  await flushPromises();
  expect(w.text()).toContain('姓名必填');
  w.unmount();
});

test('异步校验过程中修改字段，即使没有 change 规则也不能通过旧值校验', async () => {
  let finish!: () => void;
  const { w, model, form } = createForm([
    { trigger: 'blur', validator: () => new Promise<void>((resolve) => (finish = resolve)) }
  ]);
  const pending = form.validate();
  model.name = '尚未校验的新值';
  finish();
  expect(await pending).toBe(false);
  w.unmount();
});

test('等待另一字段时修改已通过字段，整体校验也应失败', async () => {
  let finish!: () => void;
  const model = reactive({ name: '有效姓名', status: 'enabled' });
  const form = ref<FormInstance>();
  const rules: Record<string, FormRule[]> = {
    name: [{ required: true, trigger: 'blur' }],
    status: [{ validator: () => new Promise<void>((resolve) => (finish = resolve)) }]
  };
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(Form, { model, rules, ref: form }, () => [h(FormItem, { prop: 'name' }), h(FormItem, { prop: 'status' })])
    })
  );
  const pending = form.value!.validate();
  await flushPromises();
  model.name = '';
  finish();
  expect(await pending).toBe(false);
  w.unmount();
});

test('使用 async-validator 校验嵌套路径', async () => {
  const model = reactive({ user: { name: '' } });
  const form = ref<FormInstance>();
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(Form, { ref: form, model, rules: { 'user.name': [{ required: true, message: '请输入姓名' }] } }, () =>
          h(FormItem, { prop: 'user.name', label: '姓名' }, () =>
            h(Input, {
              modelValue: model.user.name,
              'onUpdate:modelValue': (v: string) => (model.user.name = v)
            })
          )
        )
    })
  );
  expect(await form.value!.validate()).toBe(false);
  expect(w.text()).toContain('请输入姓名');
  model.user.name = '小明';
  expect(await form.value!.validateField('user.name')).toBe(true);
  w.unmount();
});
