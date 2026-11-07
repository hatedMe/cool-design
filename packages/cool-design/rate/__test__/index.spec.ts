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
    const secondItem = wrapper.findAll('[role="radio"]')[1];
    Object.defineProperty(secondItem.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await secondItem.trigger('click', { clientX: 75 });
    expect(wrapper.emitted('change')).toContainEqual([0]);
  });

  test('uses the horizontal position for half-star hover and click without exceeding bounds', async () => {
    const wrapper = mount(Rate, { props: { allowHalf: true, max: 3 } });
    const item = wrapper.findAll('[role="radio"]')[1];
    Object.defineProperty(item.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await item.trigger('mouseenter', { clientX: 25 });
    expect(wrapper.findAll('[data-half="true"]')).toHaveLength(1);
    await item.trigger('mouseleave');
    await item.trigger('click', { clientX: 75 });
    expect(wrapper.emitted('change')).toContainEqual([2]);
    const thirdItem = wrapper.findAll('[role="radio"]')[2];
    Object.defineProperty(thirdItem.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await thirdItem.trigger('click', { clientX: 0 });
    expect(wrapper.emitted('change')).toContainEqual([2.5]);
  });

  test('applies void colors to empty items and disabled void colors when disabled', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1, voidColor: 'red', disabledVoidColor: 'blue' } });
    expect(wrapper.findAll('.i-rate__icon')[1].attributes('style')).toContain('color: red');
    await wrapper.setProps({ disabled: true });
    expect(wrapper.findAll('.i-rate__icon')[1].attributes('style')).toContain('color: blue');
  });

  test('clears an integer when its left half is selected', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, allowHalf: true, clearable: true } });
    const item = wrapper.findAll('[role="radio"]')[1];
    Object.defineProperty(item.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await item.trigger('click', { clientX: 25 });
    expect(wrapper.emitted('change')).toContainEqual([0]);
  });

  test('announces the current half value and supports half-step keyboard changes', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1.5, allowHalf: true } });
    expect(wrapper.find('[data-half="true"]').attributes('aria-label')).toBe('1.5分（半星）');
    await wrapper.findAll('[role="radio"]')[1].trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')).toContainEqual([2]);
    await wrapper.findAll('[role="radio"]')[1].trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('change')).toContainEqual([1.5]);
  });

  test('resolves array colors and icons by threshold', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3, colors: ['red', 'orange', 'green'], icons: ['low', 'medium', 'high'] } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).toContain('color: orange');
    expect(wrapper.findAll('.i-rate__icon')).toHaveLength(5);
  });

  test('resolves object thresholds and excluded scores', () => {
    const wrapper = mount(Rate, { props: { modelValue: 4, colors: { 2: 'red', 4: 'orange', 5: 'green' } } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).toContain('color: orange');
    const excluded = mount(Rate, { props: { modelValue: 4, colors: { 2: 'red', 4: 'orange', 5: 'green', excluded: [4] } } });
    expect(excluded.find('.i-rate__icon').attributes('style') || '').not.toContain('color: orange');
  });

  test('renders custom icons, score template, text color, and size classes', () => {
    const CustomIcon = { template: '<b class="custom-icon" />' };
    const wrapper = mount(Rate, { props: { modelValue: 2, voidIcon: CustomIcon, showScore: true, textColor: 'purple', scoreTemplate: 'Score: {value}', size: 'small' } });
    expect(wrapper.findAll('.custom-icon')).toHaveLength(3);
    expect(wrapper.get('.i-rate__text').text()).toBe('Score: 2');
    expect(wrapper.get('.i-rate__text').attributes('style')).toContain('color: purple');
    expect(wrapper.classes()).toContain('i-rate--small');
  });
});
