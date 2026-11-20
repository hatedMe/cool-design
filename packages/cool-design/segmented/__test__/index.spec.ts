import { mount } from '@vue/test-utils';
import { defineComponent, h, reactive, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import Segmented from '..';
import ConfigProvider from '../../config-provider';
import Form from '../../form';
import FormItem from '../../form-item';

const options = [
  { label: '列表', value: 'list' },
  { label: '卡片', value: 'card' },
  { label: '日历', value: 'calendar', disabled: true }
];

describe('test `Segmented` component', () => {
  test('点击切换选中并触发事件', async () => {
    const wrapper = mount(Segmented, {
      props: { options, modelValue: 'list' }
    });
    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('aria-checked')).toBe('true');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['card']]);
    expect(wrapper.emitted('change')).toEqual([['card']]);
    await buttons[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
  });

  test('字符串选项归一化为 value/label', () => {
    const wrapper = mount(Segmented, {
      props: { options: ['a', 'b'], modelValue: 'a' }
    });
    const buttons = wrapper.findAll('button');
    expect(buttons.map((item) => item.text())).toEqual(['a', 'b']);
    expect(buttons[0].attributes('aria-checked')).toBe('true');
  });

  test('键盘方向键跳过禁用项并切换', async () => {
    const wrapper = mount(Segmented, {
      props: { options, modelValue: 'list' }
    });
    await wrapper.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toEqual([['card']]);
    // 卡片 → 日历被禁用，跳回列表
    await wrapper.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    await wrapper.trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('update:modelValue')![1][0]).toBe('card');
  });

  test('disabled 时不可交互', async () => {
    const wrapper = mount(Segmented, {
      props: { options, modelValue: 'list', disabled: true }
    });
    await wrapper.findAll('button')[1].trigger('click');
    await wrapper.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.classes()).toContain('is-disabled');
  });

  test('block 撑满容器并均分选项', () => {
    const wrapper = mount(Segmented, { props: { options, block: true } });
    expect(wrapper.classes()).toContain('i-segmented--block');
  });

  test('默认插槽元素映射为选项并可切换', async () => {
    const value = ref(1);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Segmented,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (v: string | number) => {
                value.value = v as number;
              }
            },
            () => [
              h('span', { value: 1 }, '日'),
              h('span', { value: 2 }, '周'),
              h('span', { value: 3, disabled: true }, '月')
            ]
          )
      })
    );
    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].text()).toBe('日');
    expect(buttons[0].attributes('aria-checked')).toBe('true');
    const segmented = wrapper.getComponent(Segmented);
    await buttons[1].trigger('click');
    expect(segmented.emitted('update:modelValue')).toEqual([[2]]);
    await buttons[2].trigger('click');
    expect(segmented.emitted('update:modelValue')).toHaveLength(1);
    await wrapper.trigger('keydown', { key: 'ArrowRight' });
    // 月被禁用，方向键跳回“日”。
    expect(segmented.emitted('update:modelValue')![1][0]).toBe(1);
  });
});

test('继承尺寸和禁用状态，并按 validateEvent 控制表单校验', async () => {
  const state = reactive({ disabled: true, validateEvent: false, value: 'list' });
  const checks: unknown[] = [];
  const wrapper = mount({
    render: () => h(ConfigProvider, { size: 'small' }, { default: () =>
      h(Form, { model: state, size: 'large', disabled: state.disabled, onValidate: (...args: unknown[]) => checks.push(args) }, {
        default: () => h(FormItem, { prop: 'value', size: 'small', rules: { required: true, trigger: 'change' } }, {
          default: () => h(Segmented, { options, modelValue: state.value, direction: 'vertical',
            ariaLabel: '视图', validateEvent: state.validateEvent,
            'onUpdate:modelValue': (value: string | number) => { state.value = String(value); } })
        })
      })
    })
  });
  const group = wrapper.get('[role="radiogroup"]');
  expect(group.classes()).toContain('i-segmented--small');
  expect(group.attributes('aria-orientation')).toBe('vertical');
  expect(group.attributes('aria-label')).toBe('视图');
  await group.trigger('keydown', { key: 'ArrowDown' });
  await group.findAll('button')[1].trigger('click');
  expect(state.value).toBe('list');
  state.disabled = false;
  await wrapper.vm.$nextTick();
  await group.findAll('button')[1].trigger('click');
  expect(state.value).toBe('card');
  expect(checks).toHaveLength(0);
  state.validateEvent = true;
  await wrapper.vm.$nextTick();
  await group.findAll('button')[0].trigger('click');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(checks).toHaveLength(1);
  wrapper.unmount();
});

test('未显式配置名称时关联 FormItem 标签', () => {
  const wrapper = mount(Form, {
    slots: { default: () => h(FormItem, { label: '展示方式' }, { default: () => h(Segmented, { options }) }) }
  });
  const group = wrapper.get('[role="radiogroup"]');
  const label = wrapper.get('.i-form-item__label');
  expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'));
  expect(group.attributes('aria-label')).toBeUndefined();
  wrapper.unmount();
});
