import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import Input from '../index';
import Select from '../../select/index';
import SelectOption from '../../select-option/index';
import Checkbox from '../../checkbox/index';
import Switch from '../../switch/index';
import { h } from 'vue';

test('输入框支持受控值、清空和禁用', async () => {
  const w = mount(Input, { props: { modelValue: '原值', clearable: true } });
  expect(w.find('input').element.value).toBe('原值');
  await w.find('input').setValue('新值');
  expect(w.emitted('update:modelValue')?.[0]).toEqual(['新值']);
  await w.find('button').trigger('click');
  expect(w.emitted('update:modelValue')?.[1]).toEqual(['']);
  await w.setProps({ modelValue: '父级值', disabled: true });
  expect(w.find('input').element.value).toBe('父级值');
  expect(w.find('button').attributes('disabled')).toBeDefined();
});

test('支持密码显示切换、文本域、长度统计和前后缀插槽', async () => {
  const w = mount(Input, {
    props: { modelValue: 'secret', type: 'password', showPassword: true, maxlength: 10, showWordLimit: true },
    slots: { prefix: () => '前', suffix: () => '后' }
  });
  expect(w.find('input').attributes('type')).toBe('password');
  expect(w.text()).toContain('6/10');
  expect(w.text()).toContain('前');
  await w.get('[aria-label="显示密码"]').trigger('click');
  expect(w.find('input').attributes('type')).toBe('text');
  const textarea = mount(Input, { props: { type: 'textarea', modelValue: '多行', rows: 3 } });
  expect(textarea.find('textarea').attributes('rows')).toBe('3');
});

test('选择器保留数字类型，清空得到 undefined', async () => {
  const w = mount(Select, {
    props: { modelValue: 1, clearable: true },
    slots: {
      default: () => [h(SelectOption, { value: 1, label: '启用' }), h(SelectOption, { value: 2, label: '停用' })]
    }
  });
  await w.find('select').setValue('2');
  expect(w.emitted('update:modelValue')?.[0]).toEqual([2]);
  await w.find('button').trigger('click');
  expect(w.emitted('update:modelValue')?.[1]).toEqual([undefined]);
});

test('复选框与开关发出布尔值，禁用不改变值', async () => {
  for (const component of [Checkbox, Switch]) {
    const w = mount(component, { props: { modelValue: false } });
    await w.find('input').setValue(true);
    expect(w.emitted('update:modelValue')?.[0]).toEqual([true]);
    await w.setProps({ disabled: true });
    await w.find('input').trigger('change');
    expect(w.emitted('update:modelValue')).toHaveLength(1);
  }
});

test('formatter 只改变展示值，parser 写入模型，textarea 支持 autosize', async () => {
  const w = mount(Input, {
    props: {
      modelValue: '1234',
      formatter: (value: string) => `¥${value}`,
      parser: (value: string) => value.replace(/^¥/, ''),
      type: 'textarea',
      autosize: { minRows: 2, maxRows: 4 }
    }
  });
  expect(w.get('textarea').element.value).toBe('¥1234');
  await w.get('textarea').setValue('¥5678');
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['5678']);
});

test('普通输入框输入时应用 parser', async () => {
  const w = mount(Input, {
    props: {
      modelValue: '1234',
      formatter: (value: string) => `¥${value}`,
      parser: (value: string) => value.replace(/^¥/, '')
    }
  });
  await w.get('input').setValue('¥5678');
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['5678']);
});

test('textarea 聚焦时触发 focus 事件', async () => {
  const w = mount(Input, { props: { type: 'textarea' } });
  await w.get('textarea').trigger('focus');
  expect(w.emitted('focus')).toHaveLength(1);
});

test('实例方法支持选择文本、调整高度和受限清空', async () => {
  const w = mount(Input, { props: { modelValue: '内容', clearable: true } });
  const exposed = w.vm as unknown as { select: () => void; resize: () => void; clear: () => void };
  expect(() => exposed.select()).not.toThrow();
  expect(() => exposed.resize()).not.toThrow();
  exposed.clear();
  expect(w.emitted('clear')).toHaveLength(1);
  expect(w.emitted('change')?.at(-1)).toEqual(['']);

  await w.setProps({ modelValue: '不可清空', disabled: true });
  exposed.clear();
  expect(w.emitted('update:modelValue')).toHaveLength(1);
});

test('支持 prepend、append、password-icon 和外置字数统计', async () => {
  const w = mount(Input, {
    props: { modelValue: 'secret', type: 'password', showPassword: true, maxlength: 10, showWordLimit: true, wordLimitPosition: 'outside' },
    slots: {
      prepend: () => '前置',
      append: () => '后置',
      'password-icon': ({ visible }: { visible: boolean }) => (visible ? '已显示' : '未显示')
    }
  });
  expect(w.text()).toContain('前置');
  expect(w.text()).toContain('后置');
  expect(w.text()).toContain('未显示');
  expect(w.find('.i-input__count').exists()).toBe(true);
  await w.get('button').trigger('click');
  expect(w.text()).toContain('已显示');
});

test('textarea 支持 resize 属性', () => {
  const w = mount(Input, { props: { type: 'textarea', resize: 'none' } });
  expect(w.get('textarea').attributes('style')).toContain('resize: none');
});

test('支持自定义字符计数和输入样式', () => {
  const w = mount(Input, {
    props: {
      modelValue: '😀',
      maxlength: 2,
      showWordLimit: true,
      countGraphemes: (value: string) => Array.from(value).length,
      inputStyle: { color: 'red' }
    }
  });
  expect(w.find('.i-input__count').text()).toBe('1/2');
  expect(w.get('input').attributes('style')).toContain('color: red');
});

test('支持组件形式的前缀、后缀和清空图标', async () => {
  const Icon = { setup: () => () => '图标' };
  const w = mount(Input, {
    props: { modelValue: '内容', clearable: true, prefixIcon: Icon, suffixIcon: Icon, clearIcon: Icon },
  });
  expect(w.text()).toContain('图标');
  await w.get('[aria-label="清空"]').trigger('click');
  expect(w.text()).toContain('图标');
});

test('透传原生属性并发出键盘和组合输入事件', async () => {
  const w = mount(Input, { attrs: { name: 'username', autocomplete: 'off', inputmode: 'email' } });
  expect(w.get('input').attributes()).toMatchObject({ name: 'username', autocomplete: 'off', inputmode: 'email' });
  await w.get('input').trigger('keydown', { key: 'a' });
  await w.get('input').trigger('compositionupdate');
  expect(w.emitted('keydown')).toHaveLength(1);
  expect(w.emitted('compositionupdate')).toHaveLength(1);
});

test('change 仅在值变化后由 Enter 或失焦触发一次', async () => {
  const w = mount(Input, { props: { modelValue: '' } });
  await w.get('input').setValue('新值');
  await w.get('input').trigger('keydown', { key: 'Enter' });
  await w.get('input').trigger('change');
  expect(w.emitted('change')).toHaveLength(1);
  await w.get('input').trigger('blur');
  expect(w.emitted('change')).toHaveLength(1);
});
