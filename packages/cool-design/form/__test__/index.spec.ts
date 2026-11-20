import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
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

test('自定义校验收到规则和字段值，并可通过同步回调返回错误', async () => {
  const { w, form } = createForm([
    {
      validator: (rule, value, callback) => {
        callback(value === '初始值' ? new Error(`请修改 ${rule.field}`) : undefined);
      }
    }
  ]);
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '请修改 name' }] });
  expect(w.get('[role="alert"]').text()).toBe('请修改 name');
  w.unmount();
});

test('校验器只完成一次，重复回调和随后拒绝的 Promise 不会抢在其他规则前结束', async () => {
  const { w, form } = createForm([
    {
      validator: (_rule, _value, callback) => {
        callback();
        callback(new Error('重复错误'));
        return Promise.reject(new Error('迟到错误'));
      }
    },
    {
      asyncValidator: () => Promise.reject(new Error('第二条规则失败'))
    }
  ]);
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '第二条规则失败' }] });
  expect(w.get('[role="alert"]').text()).toBe('第二条规则失败');
  w.unmount();
});

test('较早的异步回调不覆盖同一字段较新的校验状态', async () => {
  let finishOld: ((error?: Error | string) => void) | undefined;
  const { w, form, model } = createForm([
    {
      validator: (_rule, value, callback) => {
        if (value === '初始值') finishOld = callback;
        else callback(new Error('最新错误'));
      }
    }
  ]);
  const old = form.validateField('name');
  expect(finishOld).toBeTypeOf('function');
  model.name = '新值';
  await expect(form.validateField('name')).rejects.toHaveProperty('name');
  finishOld?.();
  await expect(old).rejects.toEqual({});
  expect(w.get('[role="alert"]').text()).toBe('最新错误');
  w.unmount();
});

test('自定义校验器可以通过 Promise 成功并将抛错转换为校验失败', async () => {
  const { w, form, model } = createForm([
    {
      validator: (rule, value) => {
        if (value === '初始值') throw new Error(`${rule.field} 不可保留初值`);
        return Promise.resolve();
      }
    }
  ]);
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: 'name 不可保留初值' }] });
  model.name = '新值';
  await expect(form.validate()).resolves.toBe(true);
  w.unmount();
});

test('必填规则失败后立即结束当前字段的校验', async () => {
  let laterRuleCalled = false;
  const { w, form, model } = createForm([
    { required: true, message: '姓名必填' },
    {
      validator: (_rule, value, callback) => {
        laterRuleCalled = true;
        if (value) callback();
      }
    }
  ]);
  model.name = '';
  const validation = form.validate().catch((errors: unknown) => errors);
  await flushPromises();
  expect(laterRuleCalled).toBe(false);
  await expect(validation).resolves.toEqual({
    name: [{ message: '姓名必填', field: 'name', fieldValue: '' }]
  });
  w.unmount();
});

test('同一规则可以通过 Input 的 change 和 blur 触发', async () => {
  const { w, form } = createForm([{ required: true, message: '两个事件均校验', trigger: ['change', 'blur'] }]);
  const input = w.get('input');
  await input.setValue('');
  await flushPromises();
  expect(w.get('[role="alert"]').text()).toBe('两个事件均校验');
  form.clearValidate();
  await flushPromises();
  expect(w.find('[role="alert"]').exists()).toBe(false);
  await input.trigger('blur');
  await flushPromises();
  expect(w.get('[role="alert"]').text()).toBe('两个事件均校验');
  w.unmount();
});

test.each([{ prop: 'items[0].name' }, { prop: 'items.0.name' }, { prop: ['items', '0', 'name'] }])(
  '将字段路径 $prop 注册为统一的键，并按路径校验和重置',
  async ({ prop }) => {
    const model = reactive({ items: [{ name: '初始值' }] });
    const wrapper = mount(Form, {
      props: { model, rules: { 'items[0].name': [{ required: true, message: '名称必填' }] } },
      slots: { default: () => h(FormItem, { prop }) }
    });
    const form = wrapper.vm as unknown as FormInstance;
    expect(form.fields.map((field) => field.prop)).toEqual(['items.0.name']);
    model.items[0].name = '';
    await expect(form.validateField('items[0].name')).rejects.toMatchObject({ 'items.0.name': [expect.any(Object)] });
    await expect(form.validate()).rejects.toMatchObject({ 'items.0.name': [{ message: '名称必填' }] });
    expect(wrapper.emitted('validate')).toEqual([
      [prop, false, '名称必填'],
      [prop, false, '名称必填']
    ]);
    form.resetFields();
    expect(model.items[0].name).toBe('初始值');
    wrapper.unmount();
  }
);

test('删除数组行后随存活实例迁移注册路径和重置初值', async () => {
  const model = reactive({ items: [{ id: 'first', name: '第一行' }, { id: 'second', name: '第二行' }] });
  const enabled = ref(true);
  let finishOld: ((error?: Error | string) => void) | undefined;
  const rules: Record<string, FormRule[]> = {
    'items.0.name': [{ required: true, message: '当前行必填' }],
    'items.1.name': [
      {
        validator: (_rule, _value, callback) => {
          finishOld = callback;
        }
      }
    ]
  };
  const wrapper = mount(Form, {
    props: { model, rules },
    slots: {
      default: () =>
        model.items.map(({ id }, index) =>
          h(FormItem, { key: id, prop: enabled.value ? ['items', String(index), 'name'] : undefined })
        )
    }
  });
  const form = wrapper.vm as unknown as FormInstance;
  const old = form.validateField('items.1.name');
  expect(finishOld).toBeTypeOf('function');
  model.items.shift();
  await nextTick();
  expect(form.fields.map((field) => field.prop)).toEqual(['items.0.name']);
  model.items[0].name = '';
  await expect(form.validateField('items.0.name')).rejects.toMatchObject({ 'items.0.name': [expect.any(Object)] });
  await expect(form.validate()).rejects.toMatchObject({ 'items.0.name': [{ message: '当前行必填' }] });
  finishOld?.(new Error('旧路径错误'));
  await expect(old).rejects.toEqual({});
  expect(wrapper.get('[role="alert"]').text()).toBe('当前行必填');
  form.resetFields();
  expect(model.items[0].name).toBe('第二行');
  enabled.value = false;
  await nextTick();
  expect(form.fields).toHaveLength(0);
  enabled.value = true;
  await nextTick();
  expect(form.fields.map((field) => field.prop)).toEqual(['items.0.name']);
  wrapper.unmount();
  expect(form.fields).toHaveLength(0);
});

test.each([0, 1])('卸载同路径的第 %i 个实例后仍能校验另一个字段', async (removed) => {
  const model = reactive({ items: [{ name: '' }] });
  const visible = ref([0, 1]);
  const paths = ['items[0].name', 'items.0.name'];
  const wrapper = mount(Form, {
    props: { model },
    slots: {
      default: () =>
        visible.value.map((index) =>
          h(FormItem, {
            key: index,
            prop: paths[index],
            rules: { required: true, message: `字段 ${index} 必填` }
          })
        )
    }
  });
  const form = wrapper.vm as unknown as FormInstance;
  expect(form.fields.map((field) => field.prop)).toEqual(['items.0.name', 'items.0.name']);
  visible.value = visible.value.filter((index) => index !== removed);
  await nextTick();
  expect(form.fields.map((field) => field.prop)).toEqual(['items.0.name']);
  await expect(form.validateField(paths[removed])).rejects.toMatchObject({ 'items.0.name': [expect.any(Object)] });
  await expect(form.validate()).rejects.toMatchObject({ 'items.0.name': [{ message: `字段 ${1 - removed} 必填` }] });
  wrapper.unmount();
});

test.each([false, true])('字段迁移后旧整表校验不读取当前错误或聚焦（返回原路径：%s）', async (returnToOriginal) => {
  const model = reactive({ first: '', second: '' });
  const prop = ref(['first']);
  let finishOld: ((error?: Error | string) => void) | undefined;
  const rules: FormRule = {
    validator: (_rule, _value, callback) => {
      if (!finishOld) finishOld = callback;
      else callback(new Error('当前路径错误'));
    }
  };
  const wrapper = mount(Form, {
    props: { model },
    slots: {
      default: () => [
        h(FormItem, { prop: prop.value, rules }, () => h('input')),
        h('button', { type: 'button' }, '其他操作')
      ]
    },
    attachTo: document.body
  });
  const form = wrapper.vm as unknown as FormInstance;
  const old = form.validate().catch((errors: unknown) => errors);
  expect(finishOld).toBeTypeOf('function');
  prop.value = ['second'];
  await nextTick();
  if (returnToOriginal) {
    prop.value = ['first'];
    await nextTick();
  }
  await expect(form.validateField(prop.value[0])).rejects.toEqual(expect.any(Object));
  const button = wrapper.get('button').element;
  button.focus();
  finishOld?.(new Error('旧路径错误'));
  const oldErrors = await old;
  expect(document.activeElement).toBe(button);
  expect(oldErrors).toEqual({});
  expect(wrapper.get('[role="alert"]').text()).toBe('当前路径错误');
  wrapper.unmount();
});

test('整表校验按实例登记顺序合并同路径的错误', async () => {
  const model = reactive({ items: [{ name: '' }] });
  const wrapper = mount(Form, {
    props: { model },
    slots: {
      default: () => [
        h(FormItem, { prop: 'items[0].name', rules: { required: true, message: '首个字段必填' } }),
        h(FormItem, { prop: ['items', '0', 'name'], rules: { required: true, message: '第二个字段必填' } })
      ]
    }
  });
  const form = wrapper.vm as unknown as FormInstance;
  await expect(form.validate()).rejects.toMatchObject({ 'items.0.name': [{ message: '首个字段必填' }, { message: '第二个字段必填' }] });
  wrapper.unmount();
});

test('必填错误关联字段，校验聚焦，重置恢复初值', async () => {
  const { w, model, form } = createForm();
  model.name = '   ';
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '姓名必填' }] });
  await flushPromises();
  expect(w.text()).toContain('姓名必填');
  expect(w.find('input').attributes('aria-invalid')).toBe('true');
  expect(document.activeElement).toBe(w.find('input').element);
  expect(w.find('label').attributes('for')).toBe(w.find('input').attributes('id'));
  model.name = '有效姓名';
  await expect(form.validate()).resolves.toBe(true);
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
  const old = form.validate().catch(() => 'rejected');
  model.name = '新值';
  await expect(form.validate()).resolves.toBe(true);
  rejectOld(new Error('旧错误'));
  await expect(old).resolves.toBe('rejected');
  await flushPromises();
  expect(w.text()).not.toContain('旧错误');
  model.name = '旧值';
  const pending = form.validate().catch(() => 'rejected');
  form.clearValidate();
  rejectOld(new Error('清除后的错误'));
  await expect(pending).resolves.toBe('rejected');
  await flushPromises();
  expect(w.text()).not.toContain('清除后的错误');
  w.unmount();
});

test('仅 blur 触发的规则不会被无对应规则的 change 清空错误', async () => {
  const { w, form } = createForm([{ required: true, message: '姓名必填', trigger: 'blur' }]);
  const input = w.find('input').element;
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await expect(form.validate()).rejects.toMatchObject({ name: [{ message: '姓名必填' }] });
  await flushPromises();
  expect(w.text()).toContain('姓名必填');
  w.unmount();
});

test('异步校验过程中修改字段，即使没有 change 规则也不能通过旧值校验', async () => {
  let finish!: () => void;
  const { w, model, form } = createForm([
    { trigger: 'blur', validator: () => new Promise<void>((resolve) => (finish = resolve)) }
  ]);
  const pending = form.validate().catch(() => 'rejected');
  model.name = '尚未校验的新值';
  finish();
  expect(await pending).toBe('rejected');
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
  const pending = form.value!.validate().catch(() => 'rejected');
  await flushPromises();
  model.name = '';
  finish();
  expect(await pending).toBe('rejected');
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
  await expect(form.value!.validate()).rejects.toMatchObject({ 'user.name': [{ message: '请输入姓名' }] });
  expect(w.text()).toContain('请输入姓名');
  model.user.name = '小明';
  expect(await form.value!.validateField('user.name')).toBe(true);
  w.unmount();
});

test('labelSuffix 追加到表单标签文本', () => {
  const model = reactive({ name: 'x' });
  const w = mount(Form, {
    props: { model, labelSuffix: '：' },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  expect(w.find('label').text()).toBe('姓名：');
  w.unmount();
});

test('labelWidth 支持表单项覆盖表单，数字按 px 处理', () => {
  const model = reactive({ name: 'x', age: 1 });
  const w = mount(Form, {
    props: { model, labelWidth: 100 },
    slots: {
      default: () => [
        h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')),
        h(FormItem, { prop: 'age', label: '年龄', labelWidth: '80px' }, () => h('input'))
      ]
    }
  });
  const items = w.findAll('.i-form-item');
  expect(items[0].attributes('style')).toContain('--i-form-item-label-width: 100px');
  expect(items[1].attributes('style')).toContain('--i-form-item-label-width: 80px');
  w.unmount();
});

test('labelPosition 表单项可覆盖表单级布局', () => {
  const model = reactive({ name: 'x', age: 1 });
  const w = mount(Form, {
    props: { model, labelPosition: 'left' },
    slots: {
      default: () => [
        h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')),
        h(FormItem, { prop: 'age', label: '年龄', labelPosition: 'top' }, () => h('input'))
      ]
    }
  });
  const items = w.findAll('.i-form-item');
  expect(items[0].classes()).toContain('i-form-item--label-left');
  expect(items[1].classes()).toContain('i-form-item--label-top');
  w.unmount();
});

test('inline 表单渲染 is-inline 类', () => {
  const model = reactive({ name: 'x' });
  const w = mount(Form, {
    props: { model, inline: true },
    slots: { default: () => h(FormItem, { prop: 'name', label: '姓名' }, () => h('input')) }
  });
  expect(w.classes()).toContain('is-inline');
  w.unmount();
});
