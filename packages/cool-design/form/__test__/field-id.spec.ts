import { mount } from '@vue/test-utils';
import { defineComponent, h, KeepAlive, nextTick, ref, type Component } from 'vue';
import { expect, test } from 'vitest';
import { CheckboxButton, CheckboxGroup, ColorPicker, DatePicker, Form, FormItem, Input, InputNumber, InputOtp, InputTag, Radio, RadioButton, RadioGroup, Segmented, Slider, TimePicker, Transfer, TreeSelect } from '../../index';

test('字段标签跟随实际输入及挂载数量，错误消息保留用户说明', async () => {
  const explicit = ref('caller');
  const extra = ref(false);
  const visible = ref(true);
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '名称', error: '请输入', showMessage: visible.value }, () => [
      h(Input, { id: explicit.value, 'aria-describedby': 'help' }),
      extra.value && h(Input)
    ])
  } });
  try {
    await nextTick();
    const label = wrapper.get('label').element;
    const input = wrapper.get('input').element;
    expect(label.control).toBe(input);
    expect(input.getAttribute('aria-describedby')).toBe('help ' + wrapper.get('[role=alert]').element.id);
    explicit.value = '';
    await nextTick();
    expect(input.id).toBeTruthy();
    expect(label.control).toBe(input);
    extra.value = true;
    await nextTick();
    expect(label.control).toBeNull();
    expect(new Set(wrapper.findAll('input').map(node => node.element.id)).size).toBe(2);
    extra.value = false;
    visible.value = false;
    await nextTick();
    expect(label.control).toBe(input);
    expect(input.getAttribute('aria-describedby')).toBe('help');
  } finally {
    wrapper.unmount();
  }
});

test('单选组由字段标签命名且原生 ID 唯一', async () => {
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '类型' }, () => h(RadioGroup, {}, () => [h(Radio, { value: 1 }), h(Radio, { value: 2 })]))
  } });
  try {
    await nextTick();
    expect(new Set(wrapper.findAll('input').map(node => node.element.id)).size).toBe(2);
    const label = wrapper.get('.i-form-item__label').element as HTMLLabelElement;
    expect(label.control).toBeNull();
    expect(wrapper.get('[role=radiogroup]').attributes('aria-labelledby')).toBe(label.id);
  } finally {
    wrapper.unmount();
  }
});

test('显式 for 随外部目标变化，清除后恢复原生输入关联', async () => {
  const target = ref<string>();
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () => [
    h('input', { id: 'external' }),
    h(FormItem, { label: '名称', for: target.value }, () => h(Input, { id: 'inside' }))
  ] } });
  try {
    await nextTick();
    const label = wrapper.get('label').element;
    expect(label.control?.id).toBe('inside');
    target.value = 'external';
    await nextTick();
    expect(label.control?.id).toBe('external');
    target.value = undefined;
    await nextTick();
    expect(label.control?.id).toBe('inside');
  } finally {
    wrapper.unmount();
  }
});

test('显式输入 ID 与字段标签或错误 ID 相同时，更新字段内部引用', async () => {
  const id = ref<string>();
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '名称', error: '必填' }, () => h(Input, { id: id.value }))
  } });
  try {
    await nextTick();
    const input = wrapper.get('input').element;
    const label = wrapper.get('label').element;
    const error = wrapper.get('[role=alert]').element;
    for (const collision of [label.id, error.id]) {
      id.value = collision;
      await nextTick();
      expect(input.id).toBe(collision);
      expect(new Set([input.id, label.id, error.id]).size).toBe(3);
      expect(label.control).toBe(input);
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
    }
  } finally {
    wrapper.unmount();
  }
});

test.each([
  [Slider, { showInput: true }, '.i-slider input'],
  [DatePicker, { type: 'daterange' }, '.i-date-picker input:last-child'],
  [TimePicker, { isRange: true }, '.i-time-picker input']
] as [Component, Record<string, unknown>, string][])('派生输入 ID 避开兄弟显式 ID', async (control, props, selector) => {
  const id = ref('other');
  const wrapper = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '区间' }, () => [h(control, props), h(Input, { id: id.value })])
  } });
  try {
    const input = wrapper.findAll(selector).at(-1)!.element as HTMLInputElement;
    id.value = input.id;
    await nextTick();
    expect(wrapper.get('.i-input input').element.id).toBe(id.value);
    expect(input.id).not.toBe(id.value);
  } finally { wrapper.unmount(); }
});

test('错误插槽仅在可见时调用并保留其显式 ID', async () => {
  const shown = ref(true), explicit = ref('message');
  let calls = 0;
  const w = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '名称', error: '必填', showMessage: shown.value }, {
      default: () => h(Input), error: () => { calls++; return h('span', { id: explicit.value }); }
    })
  } });
  try {
    await nextTick();
    explicit.value = w.get('label').element.id;
    await nextTick();
    expect(w.get('label').element.id).not.toBe(explicit.value);
    expect(w.get('[role=alert] span').element.id).toBe(explicit.value);
    const before = calls;
    shown.value = false;
    await nextTick();
    expect(calls).toBe(before);
  } finally { w.unmount(); }
});

test('缓存组件的标签仅指向当前显示的输入框', async () => {
  const one = ref(true);
  const panel = (id: string) => defineComponent({ setup: () => () => h(Input, { id }) });
  const A = panel('one'), B = panel('two');
  const w = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, { label: '姓名' }, () =>
    h(KeepAlive, {}, () => h(one.value ? A : B))) } });
  try {
    await nextTick();
    const label = w.get('label').element, original = w.get('input').element;
    one.value = false;
    await nextTick();
    expect(label.control).toBe(w.get('input').element);
    one.value = true;
    await nextTick();
    expect(label.control).toBe(original);
  } finally { w.unmount(); }
});

test.each([InputOtp, InputTag, TreeSelect, Transfer] as Component[])('无表单时保留外部 ARIA 状态', control => {
  const w = mount(control, { attrs: { class: 'caller', 'aria-invalid': 'true', 'aria-disabled': 'false' } });
  try {
    expect(w.classes()).toContain('caller');
    expect(w.attributes('aria-invalid')).toBe('true');
    expect(w.attributes('aria-disabled')).toBe('false');
  } finally { w.unmount(); }
});

test.each([
  [RadioGroup, '[role=radiogroup]', RadioButton], [CheckboxGroup, '[role=group].i-checkbox-group', CheckboxButton],
  [Segmented, '[role=radiogroup]'], [Slider, '[role=slider]'], [TreeSelect, 'button[role=combobox]'],
  [RadioButton, 'input'], [CheckboxButton, 'button']
] as [Component, string, Component?][])('错误描述与用户说明在实际组或焦点入口合并', (control, selector, child) => {
  const w = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, { error: '必填' }, () =>
    h(control, { 'aria-describedby': 'help' }, child ? () => h(child) : undefined)) } });
  try {
    expect(w.get(selector).attributes('aria-describedby')).toBe('help ' + w.get('[role=alert]').element.id);
  } finally { w.unmount(); }
});

test.each([[InputNumber, 'input'], [TreeSelect, '[role=combobox]'], [InputTag, '.i-input-tag'], [InputOtp, '.i-input-otp']] as [Component,string][])('清空显式 ID 时恢复同一回退 ID', async (control, selector) => {
  const id = ref<string>();
  const w = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, {label:'值'}, () => h(control,{id:id.value})) } });
  try {
    const target = w.get(selector).element, base = target.id;
    expect(base).toBeTruthy();
    for (const value of ['explicit', '', 'again', undefined]) {
      id.value = value;
      await nextTick();
      expect(target.id).toBe(value || base);
      if (target.matches('input,button')) expect(w.get('label').element.control).toBe(target);
    }
  } finally { w.unmount(); }
});

test('颜色触发按钮响应动态命名属性并可使用字段标签', async () => {
  const name = ref<string>('自定义'), labelled = ref<string>();
  const w = mount(Form, { props: { model: {} }, slots: { default: () => h(FormItem, {label:'颜色'}, () =>
    h(ColorPicker, {'aria-label': name.value, 'aria-labelledby': labelled.value})) } });
  try {
    const button = w.get('button');
    expect(button.attributes('aria-label')).toBe('自定义');
    labelled.value = 'heading';
    await nextTick();
    expect(button.attributes('aria-labelledby')).toBe('heading');
    name.value = labelled.value = undefined;
    await nextTick();
    expect(button.attributes('aria-label')).toBeUndefined();
    expect(w.get('label').element.control).toBe(button.element);
  } finally { w.unmount(); }
});

test.each([undefined, 'other'])('多控件颜色按钮使用字段标签命名（for=%s）', async target => {
  const w = mount(Form, { props: { model: {} }, slots: { default: () =>
    h(FormItem, { label: '颜色', for: target }, () => [h(ColorPicker), h(Input, { id: 'other' })])
  } });
  try {
    await nextTick();
    const button = w.get('button');
    expect(w.get('label').element.control).not.toBe(button.element);
    expect(button.attributes('aria-labelledby')).toBe(w.get('label').element.id);
  } finally { w.unmount(); }
});
