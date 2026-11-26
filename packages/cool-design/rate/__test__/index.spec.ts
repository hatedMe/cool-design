import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, provide, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import { formKey } from '../../form/context';
import FormItem from '../../form-item';
import Rate from '..';
import type { RateColor } from '..';
import * as CoolDesign from '../../index';

describe('Rate', () => {
  test('inherits the FormItem field id and label association', () => {
    const Root = defineComponent({
      components: { FormItem, Rate },
      setup() {
        const model = { score: 3 };
        provide(formKey, { model: () => model, rules: () => ({}), register: () => undefined, unregister: () => undefined });
        return { model };
      },
      template: '<FormItem prop="score" label="评分"><Rate v-model="model.score" /></FormItem>'
    });
    const wrapper = mount(Root);
    const label = wrapper.get('label');
    const rate = wrapper.get('[role="slider"]');
    expect(label.attributes('for')).toBeUndefined();
    expect(rate.attributes('id')).toBeTruthy();
    expect(rate.attributes('aria-labelledby')).toBeTruthy();
    expect(rate.attributes('aria-labelledby')).toBe(label.attributes('id'));
    expect(rate.attributes('aria-label')).toBeUndefined();
  });
  test('preserves explicit aria attributes passed to Rate', () => {
    const wrapper = mount(Rate, { attrs: { 'aria-label': 'custom rating', 'aria-labelledby': 'custom-label' } });
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-label')).toBe('custom rating');
    expect(slider.attributes('aria-labelledby')).toBe('custom-label');
  });
  test('keeps the default accessible name when FormItem has no label', () => {
    const Root = defineComponent({
      components: { FormItem, Rate },
      setup() {
        const model = { score: 3 };
        provide(formKey, { model: () => model, rules: () => ({}), register: () => undefined, unregister: () => undefined });
        return { model };
      },
      template: '<FormItem prop="score"><Rate v-model="model.score" /></FormItem>'
    });
    const wrapper = mount(Root);
    const rate = wrapper.get('[role="slider"]');
    expect(wrapper.find('label').exists()).toBe(false);
    expect(rate.attributes('aria-labelledby')).toBeUndefined();
    expect(rate.attributes('aria-label')).toBe('rating');
  });
  test('inherits disabled and size from the Form context', () => {
    const Host = defineComponent({
      setup() {
        provide(formKey, {
          model: () => ({}),
          rules: () => ({}),
          register: () => undefined,
          unregister: () => undefined,
          disabled: () => true,
          size: () => 'small'
        });
        return () => h(Rate);
      }
    });
    const wrapper = mount(Host);
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-disabled')).toBe('true');
    expect(slider.attributes('tabindex')).toBeUndefined();
    expect(slider.classes()).toContain('i-rate--small');
  });

  test('uses disabled void colors from the Form context', () => {
    const Host = defineComponent({
      setup() {
        provide(formKey, {
          model: () => ({}),
          rules: () => ({}),
          register: () => undefined,
          unregister: () => undefined,
          disabled: () => true,
          size: () => 'default'
        });
        return () => h(Rate, { modelValue: 1 });
      }
    });
    const wrapper = mount(Host);
    expect(wrapper.find('.i-rate__icon').attributes('style')).toContain('--i-rate-void-color: var(--el-rate-disabled-void-color');
  });

  test('explicit size overrides Form size while Form disabled is enforced', () => {
    const Host = defineComponent({
      setup() {
        provide(formKey, {
          model: () => ({}),
          rules: () => ({}),
          register: () => undefined,
          unregister: () => undefined,
          disabled: () => true,
          size: () => 'small'
        });
        return () => h(Rate, { disabled: false, size: 'default' });
      }
    });
    const wrapper = mount(Host);
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-disabled')).toBe('true');
    expect(slider.attributes('tabindex')).toBeUndefined();
    expect(slider.classes()).toContain('i-rate--default');
  });

  test('local disabled and size override the Form context', () => {
    const Host = defineComponent({
      setup() {
        provide(formKey, {
          model: () => ({}),
          rules: () => ({}),
          register: () => undefined,
          unregister: () => undefined,
          disabled: () => false,
          size: () => 'large'
        });
        return () => h(Rate, { disabled: true, size: 'small' });
      }
    });
    const wrapper = mount(Host);
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-disabled')).toBe('true');
    expect(slider.attributes('tabindex')).toBeUndefined();
    expect(slider.classes()).toContain('i-rate--small');
  });

  test('uses the root slider as the only focusable rating control', () => {
    const wrapper = mount(Rate);
    const slider = wrapper.get('[role="slider"]');
    const items = wrapper.findAll('.i-rate__item');
    expect(slider.attributes('tabindex')).toBe('0');
    expect(items).toHaveLength(5);
    expect(items.every((item) => item.attributes('role') === undefined)).toBe(true);
    expect(items.every((item) => item.attributes('tabindex') === undefined)).toBe(true);
    expect(items.every((item) => item.attributes('aria-checked') === undefined)).toBe(true);
  });

  test('normalizes modelValue to the valid range and supports max', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 8, max: 3 } });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('3');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined();

    await wrapper.setProps({ modelValue: -2, max: 4 });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('0');
    expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(0);
    expect(wrapper.findAll('.i-rate__item')).toHaveLength(4);
  });

  test('supports size and passes accessibility attributes to the group', () => {
    const wrapper = mount(Rate, { props: { size: 'large', id: 'rating', ariaLabel: '评分', label: '产品评分' } });
    const group = wrapper.get('[role="slider"]');
    expect(group.attributes('id')).toBe('rating');
    expect(group.attributes('aria-label')).toBe('评分');
    expect(group.attributes('tabindex')).toBe('0');
    expect(wrapper.classes()).toContain('i-rate--large');
  });

  test('does not change or focus items when disabled', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, disabled: true } });
    const item = wrapper.get('.i-rate__item');
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-disabled')).toBe('true');
    expect(slider.attributes('tabindex')).toBeUndefined();
    await item.trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('emits update:modelValue and change when selecting an item', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1 } });
    await wrapper.findAll('.i-rate__item')[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]]);
    expect(wrapper.emitted('change')).toEqual([[3]]);
  });

  test('exposes setCurrentValue and resetCurrentValue', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    const exposed = wrapper.vm as unknown as { setCurrentValue: (value: number) => void; resetCurrentValue: () => void };
    exposed.setCurrentValue(4);
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('4');
    exposed.resetCurrentValue();
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('2');
  });

  test('supports half selection and clearable selection', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2.5, allowHalf: true, clearable: true } });
    expect(wrapper.findAll('[data-half="true"]')).toHaveLength(1);
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined();
    expect(wrapper.find('.i-rate__icon--half').exists()).toBe(true);
    const secondItem = wrapper.findAll('.i-rate__item')[1];
    Object.defineProperty(secondItem.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await secondItem.trigger('click', { clientX: 75 });
    expect(wrapper.emitted('change')).toContainEqual([2]);
  });

  test('uses the horizontal position for half-star hover and click without exceeding bounds', async () => {
    const wrapper = mount(Rate, { props: { allowHalf: true, max: 3 } });
    const item = wrapper.findAll('.i-rate__item')[1];
    Object.defineProperty(item.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await item.trigger('mouseenter', { clientX: 25 });
    expect(wrapper.findAll('[data-half="true"]')).toHaveLength(1);
    await item.trigger('mouseleave');
    await item.trigger('click', { clientX: 75 });
    expect(wrapper.emitted('change')).toContainEqual([2]);
    const thirdItem = wrapper.findAll('.i-rate__item')[2];
    Object.defineProperty(thirdItem.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await thirdItem.trigger('click', { clientX: 0 });
    expect(wrapper.emitted('change')).toContainEqual([2.5]);
  });

  test('updates the preview while moving across the same star', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1, allowHalf: true, showScore: true, scoreTemplate: '{value}/5' } });
    const slider = wrapper.get('[role="slider"]');
    const third = wrapper.findAll('.i-rate__item')[2];
    Object.defineProperty(third.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await third.trigger('mouseenter', { clientX: 25 });
    expect(wrapper.get('.i-rate__score').text()).toBe('2.5/5');
    expect(third.attributes('data-half')).toBe('true');
    const leftAria = slider.attributes('aria-valuenow');

    await third.trigger('mousemove', { clientX: 75 });
    expect(wrapper.get('.i-rate__score').text()).toBe('3/5');
    expect(third.attributes('data-half')).toBeUndefined();
    expect(slider.attributes('aria-valuenow')).toBe('3');
    expect(leftAria).toBe('2.5');
    expect(slider.attributes('aria-valuetext')).toBe('3/5');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('shows selection and clearing immediately while the pointer stays on the same star', async () => {
    const model = ref(1);
    const events: [string, number][] = [];
    const Host = defineComponent({
      setup: () => () => h(Rate, {
        modelValue: model.value,
        allowHalf: true,
        clearable: true,
        showScore: true,
        'onUpdate:modelValue': (value: number) => {
          events.push(['update', value]);
          model.value = value;
        },
        onChange: (value: number) => events.push(['change', value])
      })
    });
    const wrapper = mount(Host);
    const third = wrapper.findAll('.i-rate__item')[2];
    Object.defineProperty(third.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await third.trigger('mouseenter', { clientX: 75 });
    for (const value of [3, 0]) {
      await third.trigger('click', { clientX: 75 });
      expect(model.value).toBe(value);
      expect(wrapper.get('.i-rate__score').text()).toBe(String(value));
      expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe(String(value));
    }
    expect(events).toEqual([['update', 3], ['change', 3], ['update', 0], ['change', 0]]);
  });

  test('shows external model changes during hover', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1, allowHalf: true, showText: true, texts: ['一', '二', '三', '四'] } });
    const third = wrapper.findAll('.i-rate__item')[2];
    Object.defineProperty(third.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await third.trigger('mouseenter', { clientX: 25 });
    expect(wrapper.get('.i-rate__text').text()).toBe('三');

    await wrapper.setProps({ modelValue: 4 });
    expect(wrapper.get('.i-rate__text').text()).toBe('四');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('4');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  test('consumes handled half-step arrows and lets Tab bubble', async () => {
    const model = ref(2.5);
    const events: [string, number][] = [];
    const parentKeys: string[] = [];
    const Host = defineComponent({
      setup: () => () => h('div', { onKeydown: (event: KeyboardEvent) => parentKeys.push(event.key) }, [
        h(Rate, {
          modelValue: model.value,
          allowHalf: true,
          'onUpdate:modelValue': (value: number) => {
            events.push(['update', value]);
            model.value = value;
          },
          onChange: (value: number) => events.push(['change', value])
        })
      ])
    });
    const wrapper = mount(Host);
    const slider = wrapper.get('[role="slider"]');
    for (const [key, value] of [['ArrowRight', 3], ['ArrowLeft', 2.5]] as const) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      slider.element.dispatchEvent(event);
      await nextTick();
      expect(event.defaultPrevented).toBe(true);
      expect(slider.attributes('aria-valuenow')).toBe(String(value));
    }
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    slider.element.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(parentKeys).toEqual(['Tab']);
    expect(events).toEqual([['update', 3], ['change', 3], ['update', 2.5], ['change', 2.5]]);
  });

  test.each([
    { model: 1, item: 3, x: 25, preview: 2.5, display: 3, events: [['update', 3], ['change', 3]], handled: true },
    { model: 1, item: 5, x: 75, preview: 5, display: 5, events: [], handled: false },
    { model: 5, item: 3, x: 25, preview: 2.5, display: 3, events: [['update', 3], ['change', 3]], handled: true },
    { model: 3, item: 3, x: 25, preview: 2.5, display: 3, events: [['update', 3], ['change', 3]], handled: true }
  ])('uses the preview $preview for ArrowRight with model $model', async ({ model, item, x, preview, display, events, handled }) => {
    const recordedEvents: [string, number][] = [];
    const wrapper = mount(Rate, {
      props: {
        modelValue: model,
        allowHalf: true,
        clearable: true,
        showScore: true,
        'onUpdate:modelValue': (value: number) => recordedEvents.push(['update', value]),
        onChange: (value: number) => recordedEvents.push(['change', value])
      }
    });
    const slider = wrapper.get('[role="slider"]');
    const star = wrapper.findAll('.i-rate__item')[item - 1];
    Object.defineProperty(star.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await star.trigger('mousemove', { clientX: x });
    expect(slider.attributes('aria-valuenow')).toBe(String(preview));

    const parent = document.createElement('div');
    parent.append(slider.element);
    const keys: string[] = [];
    parent.addEventListener('keydown', (event) => keys.push(event.key));
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    slider.element.dispatchEvent(arrow);
    await nextTick();

    expect(recordedEvents).toEqual(events);
    expect(slider.attributes('aria-valuenow')).toBe(String(display));
    expect(wrapper.get('.i-rate__score').text()).toBe(String(display));
    expect(arrow.defaultPrevented).toBe(handled);
    expect(keys).toEqual(handled ? [] : ['ArrowRight']);
  });

  test('applies void colors to empty items and disabled void colors when disabled', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1, voidColor: 'red', disabledVoidColor: 'blue' } });
    expect(wrapper.findAll('.i-rate__icon')[1].attributes('style')).toContain('color: red');
    await wrapper.setProps({ disabled: true });
    expect(wrapper.findAll('.i-rate__icon')[1].attributes('style')).toContain('color: blue');
  });

  test('clears an integer when its left half is selected', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, allowHalf: true, clearable: true } });
    const item = wrapper.findAll('.i-rate__item')[1];
    Object.defineProperty(item.element, 'getBoundingClientRect', { value: () => ({ left: 0, width: 100 }) });
    await item.trigger('click', { clientX: 25 });
    expect(wrapper.emitted('change')).toContainEqual([1.5]);
  });

  test('announces the current half value and supports half-step keyboard changes', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 1.5, allowHalf: true } });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined();
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')).toContainEqual([2]);
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('change')).not.toContainEqual([1.5]);
    expect(wrapper.emitted('update:modelValue')).toContainEqual([1.5]);
  });

  test('resolves array colors and icons by threshold', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3, colors: ['red', 'orange', 'green'], icons: ['low', 'medium', 'high'] } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).toContain('color: orange');
    expect(wrapper.findAll('.i-rate__icon')).toHaveLength(5);
    expect(wrapper.find('.i-rate__icon').classes()).toContain('medium');
    expect(wrapper.findAll('.i-rate__icon')[2].classes()).toContain('medium');
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
    expect(wrapper.get('.i-rate__score').text()).toBe('Score: 2');
    expect(wrapper.get('.i-rate__score').attributes('style')).toContain('color: purple');
    expect(wrapper.classes()).toContain('i-rate--small');
  });

  test('showScore takes precedence over showText without overriding global fill color', () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, showText: true, showScore: true, texts: ['one', 'two'], scoreTemplate: '{value}' } });
    expect(wrapper.find('.i-rate__score').exists()).toBe(true);
    expect(wrapper.find('.i-rate__text').exists()).toBe(false);
    expect(wrapper.find('.i-rate__icon').attributes('style')).not.toContain('color: rgb(247, 186, 42)');
    expect(wrapper.findAll('.i-rate__icon')[0].classes()).toContain('i-rate__icon--filled');
    expect(wrapper.findAll('.i-rate__icon')[0].attributes('style')).toContain('--i-rate-fill-color');
  });

  test('uses clamped text for disabled showText and raw value for showScore', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 8, max: 5, disabled: true, showText: true } });
    // 默认文案为中文。
    expect(wrapper.get('.i-rate__text').text()).toBe('惊喜');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('惊喜');
    await wrapper.setProps({ showText: false, showScore: true, scoreTemplate: 'Score: {value}' });
    expect(wrapper.get('.i-rate__score').text()).toBe('Score: 8');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('Score: 8');
  });

  test('keeps filled class when hovering selected icons', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    const icon = wrapper.findAll('.i-rate__icon')[0];
    expect(icon.classes()).toContain('i-rate__icon--filled');
    await wrapper.findAll('.i-rate__item')[0].trigger('mouseenter', { clientX: 80 });
    expect(icon.classes()).toContain('i-rate__icon--filled');
  });

  test('preserves decimal model values and exposes slider semantics', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3.7, disabled: true } });
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-valuenow')).toBe('3.7');
    expect(slider.attributes('aria-valuetext')).toBeUndefined();
    expect(slider.attributes('aria-disabled')).toBe('true');
    expect(slider.attributes('tabindex')).toBeUndefined();
  });

  test('uses threshold boundaries and object entries', () => {
    const wrapper = mount(Rate, { props: { modelValue: 4, colors: ['red', 'orange', 'green'] } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).toContain('color: green');
    const object = mount(Rate, { props: { modelValue: 2, colors: { 2: { value: 'red', excluded: true }, 4: 'green' } as RateColor } });
    expect(object.find('.i-rate__icon').attributes('style')).not.toContain('red');
  });

  test('emits no events when keyboard movement is clamped at a boundary', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 0, max: 3 } });
    const slider = wrapper.get('[role="slider"]');
    await slider.trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();

    await wrapper.setProps({ modelValue: 3 });
    await slider.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  test('restores the controlled modelValue after hover leaves a stale internal value', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    await wrapper.findAll('.i-rate__item')[2].trigger('click');
    await wrapper.findAll('.i-rate__item')[3].trigger('mouseenter', { clientX: 80 });
    await wrapper.findAll('.i-rate__item')[3].trigger('mouseleave');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('2');
  });

  test('emits update without change when selecting the current value', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    await wrapper.findAll('.i-rate__item')[1].trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]]);
  });

  test('supports root slider keyboard control and spaced score templates', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, scoreTemplate: 'Score: { value }' } });
    const slider = wrapper.get('[role="slider"]');
    await slider.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')).toContainEqual([3]);
    expect(wrapper.find('.i-rate__score').exists()).toBe(false);
    await wrapper.setProps({ showScore: true });
    expect(wrapper.get('.i-rate__score').text()).toBe('Score: 3');
  });

  test('uses the controlled model value for clearable decisions', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, clearable: true } });
    const item = wrapper.findAll('.i-rate__item')[1];
    await item.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]]);
    await item.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[0], [0]]);
    await wrapper.setProps({ modelValue: 0 });
    await item.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[0], [0], [2]]);
  });

  test('renders arbitrary decimal partial fill and disabled colors', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3.25, disabled: true } });
    const partial = wrapper.findAll('.i-rate__icon--partial');
    expect(partial).toHaveLength(1);
    expect(partial[0].attributes('style')).toContain('--i-rate-fill-percent: 25%');
    expect(partial[0].attributes('style')).toContain('--i-rate-disabled-void-color');
  });

  test('exposes text and score through aria-valuetext', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, showText: true, texts: ['one', 'two'] } });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('two');
    await wrapper.setProps({ showScore: true, scoreTemplate: 'Score: {value}' });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('Score: 2');
    await wrapper.setProps({ showText: false, showScore: false });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined();
  });

  test('resetCurrentValue follows the current modelValue and handles max bounds', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    const exposed = wrapper.vm as unknown as { resetCurrentValue: () => void };
    await wrapper.setProps({ modelValue: 4 });
    exposed.resetCurrentValue();
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('4');
    await wrapper.setProps({ modelValue: 3.7, max: 3.5 });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('3.5');
  });

  test('uses ariaLabel over label and handles empty max values', () => {
    const wrapper = mount(Rate, { props: { ariaLabel: 'accessible rating', label: 'legacy label', max: 0 } });
    const slider = wrapper.get('[role="slider"]');
    expect(slider.attributes('aria-label')).toBe('accessible rating');
    expect(slider.attributes('title')).toBe('legacy label');
    expect(wrapper.findAll('.i-rate__item')).toHaveLength(0);
  });

  test('clearable follows the controlled modelValue when props lag', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 2, clearable: true } });
    const third = wrapper.findAll('.i-rate__item')[2];
    await third.trigger('click');
    await third.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[3], [3]]);
  });

  test('does not show partial fill for an interactive decimal without allowHalf', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3.25 } });
    expect(wrapper.find('.i-rate__icon--partial').exists()).toBe(false);
  });

  test('uses a distinct disabled void icon by default', () => {
    const wrapper = mount(Rate, { props: { disabled: true } });
    const icons = wrapper.findAll('.i-rate__icon');
    expect(icons[0].classes()).toContain('icon-browse_fill');
    expect(icons[0].classes()).not.toContain('icon-collection_fill');
  });

  test('empty text has no aria-valuetext at zero', () => {
    const wrapper = mount(Rate, { props: { modelValue: 0, showText: true, texts: ['one'] } });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBeUndefined();
  });

  test('clearable compares the raw modelValue when it exceeds max', async () => {
    const wrapper = mount(Rate, { props: { modelValue: 8, max: 5, clearable: true } });
    await wrapper.findAll('.i-rate__item')[4].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[5]]);
    expect(wrapper.emitted('change')).toEqual([[5]]);
  });

  test('disabled score templates preserve the raw modelValue', () => {
    const wrapper = mount(Rate, { props: { modelValue: 8, max: 5, disabled: true, showScore: true, scoreTemplate: 'Score: {value}' } });
    expect(wrapper.get('.i-rate__score').text()).toBe('Score: 8');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('Score: 8');
  });

  test('replaces only the first score template placeholder', () => {
    const wrapper = mount(Rate, { props: { modelValue: 3, showScore: true, scoreTemplate: '{ value } / {value}' } });
    expect(wrapper.get('.i-rate__score').text()).toBe('3 / {value}');
  });

  test('allows the global fill color variable when colors are omitted', () => {
    const wrapper = mount(Rate, { props: { modelValue: 2 } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).not.toContain('color: rgb(247, 186, 42)');
  });

  test('does not fall back to unrelated excluded threshold entries', () => {
    const wrapper = mount(Rate, { props: {
      modelValue: 3,
      colors: { 2: { value: 'red', excluded: true }, 4: { value: 'green', excluded: true } }
    } });
    expect(wrapper.find('.i-rate__icon').attributes('style')).not.toContain('green');
    expect(wrapper.find('.i-rate__icon').attributes('style')).not.toContain('red');
  });

  test('falls back to the global config size when no size source is set', () => {
    const Host = defineComponent({
      setup: () => () => h(CoolDesign.ConfigProvider, { size: 'small' }, () => h(Rate))
    });
    const wrapper = mount(Host);
    expect(wrapper.find('.i-rate').classes()).toContain('i-rate--small');
    wrapper.unmount();

    const outside = mount(Rate);
    expect(outside.classes()).toContain('i-rate--default');
  });
});

test('禁用 Form 优先于 Rate 显式 disabled=false', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {}, disabled: true },
    slots: { default: () => h(Rate, { modelValue: 1, disabled: false }) }
  });
  const rate = wrapper.getComponent(Rate);
  await rate.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
  expect(rate.get('[role="slider"]').attributes('aria-disabled')).toBe('true');
  expect(rate.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});
