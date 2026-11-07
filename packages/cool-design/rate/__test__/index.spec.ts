import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Rate from '..';

describe('Rate', () => {
  test('renders five focusable rating items by default', () => {
    const wrapper = mount(Rate);
    const items = wrapper.findAll('[role="radio"]');
    expect(items).toHaveLength(5);
    expect(items.every((item) => item.attributes('tabindex') === '0')).toBe(true);
  });

  test('normalizes modelValue to the valid range and supports max', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 8, max: 3 } });
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-valuenow')).toBe('3');
    expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(3);

    await wrapper.setProps({ modelValue: -2, max: 4 });
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-valuenow')).toBe('0');
    expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(0);
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(4);
  });

  test('supports size and passes accessibility attributes to the group', () => {
    const wrapper = mount(Rate, { props: { size: 'large', id: 'rating', ariaLabel: '评分', label: '产品评分' } });
    const group = wrapper.get('[role="radiogroup"]');
    expect(group.attributes('id')).toBe('rating');
    expect(group.attributes('aria-label')).toBe('评分');
    expect(group.attributes('title')).toBe('产品评分');
    expect(wrapper.classes()).toContain('i-rate--large');
  });

  test('does not change or focus items when disabled', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, disabled: true } });
    const item = wrapper.get('[role="radio"]');
    expect(item.attributes('aria-disabled')).toBe('true');
    expect(item.attributes('tabindex')).toBe('-1');
    await item.trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('emits update:modelValue and change when selecting an item', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1 } });
    await wrapper.findAll('[role="radio"]')[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]]);
    expect(wrapper.emitted('change')).toEqual([[3]]);
  });

  test('exposes setCurrentValue and resetCurrentValue', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    const exposed = wrapper.vm as unknown as { setCurrentValue: (value: number) => void; resetCurrentValue: () => void };
    exposed.setCurrentValue(4);
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-valuenow')).toBe('4');
    exposed.resetCurrentValue();
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-valuenow')).toBe('2');
  });

  test('supports half selection and clearable selection', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2.5, allowHalf: true, clearable: true } });
    expect(wrapper.findAll('[data-half="true"]')).toHaveLength(1);
    await wrapper.findAll('[role="radio"]')[1].trigger('click');
    expect(wrapper.emitted('change')).toContainEqual([0]);
  });
});
