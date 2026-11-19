import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import Segmented from '..';

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
