import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { fieldKey } from '../../form/context';
import Slider from '../index';

describe('Slider', () => {
  test('规范化单值和范围值，并在交互更新时区分 input/change', async () => {
    const wrapper = mount(Slider, {
      props: { modelValue: 13, min: 0, max: 10, step: 3 }
    });

    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('10');
    expect(wrapper.emitted('change')).toBeUndefined();

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('input')?.at(-1)).toEqual([10]);
    expect(wrapper.emitted('change')?.at(-1)).toEqual([10]);

    const range = mount(Slider, {
      props: { modelValue: [9, 2], min: 0, max: 10, step: 1, range: true }
    });
    expect(range.findAll('[role="slider"]')[0].attributes('aria-valuenow')).toBe('2');
    expect(range.findAll('[role="slider"]')[1].attributes('aria-valuenow')).toBe('9');
  });

  test('支持键盘边界、范围滑块和 disabled', async () => {
    const wrapper = mount(Slider, {
      props: { modelValue: [20, 80], min: 0, max: 100, range: true }
    });
    const handles = wrapper.findAll('[role="slider"]');

    await handles[0].trigger('keydown', { key: 'Home' });
    expect(wrapper.emitted('input')?.at(-1)).toEqual([[0, 80]]);

    await wrapper.setProps({ modelValue: [0, 80] });
    await wrapper.findAll('[role="slider"]')[1].trigger('keydown', { key: 'End' });
    expect(wrapper.emitted('input')?.at(-1)).toEqual([[0, 100]]);

    const disabled = mount(Slider, { props: { modelValue: 50, disabled: true } });
    await disabled.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    expect(disabled.emitted('input')).toBeUndefined();
  });

  test('支持输入框、控制按钮、提示格式化和范围标签', async () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: [20, 40],
        range: true,
        showInput: true,
        showInputControls: true,
        showTooltip: true,
        formatTooltip: (value: number) => `${value}%`,
        rangeStartLabel: '起始',
        rangeEndLabel: '结束'
      }
    });

    expect(wrapper.findAll('input[type="number"]')).toHaveLength(0);
    expect(wrapper.findAll('[aria-label="增加"]').length).toBe(0);
    expect(wrapper.text()).toContain('起始');
    expect(wrapper.text()).toContain('结束');
    expect(wrapper.findAll('.i-slider__tooltip')).toHaveLength(2);
    expect(wrapper.findAll('.i-slider__tooltip.is-hidden')).toHaveLength(2);

    await wrapper.findAll('[role="slider"]')[0].trigger('focus');
    expect(wrapper.find('.i-slider__tooltip').text()).toBe('20%');
  });

  test('支持拖动滑块并在结束时触发 change', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 20 } });
    const trackWrapper = wrapper.get('.i-slider__track');
    const track = trackWrapper.element as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 6, right: 100, bottom: 6, x: 0, y: 0, toJSON: () => ({}) });
    const handle = wrapper.get('[role="slider"]');

    await handle.trigger('pointerdown', { clientX: 20, clientY: 0, pointerId: 1 });
    await trackWrapper.trigger('pointermove', { clientX: 70, clientY: 0, pointerId: 1 });
    expect(wrapper.emitted('input')?.at(-1)).toEqual([70]);
    expect(wrapper.emitted('change')).toBeUndefined();
    await wrapper.setProps({ modelValue: 70 });
    await trackWrapper.trigger('pointerup', { clientX: 70, clientY: 0, pointerId: 1 });
    expect(wrapper.emitted('change')?.at(-1)).toEqual([70]);
  });

  test('垂直进度条使用高度，非法 min 和空范围值保持有效', () => {
    const vertical = mount(Slider, { props: { modelValue: 25, vertical: true } });
    expect(vertical.get('.i-slider__bar').attributes('style')).toContain('height: 25%');

    const invalid = mount(Slider, { props: { modelValue: 10, min: Number.NaN } });
    expect(invalid.get('[role="slider"]').attributes('aria-valuenow')).not.toBe('NaN');

    const emptyRange = mount(Slider, { props: { modelValue: [], range: true } });
    expect(emptyRange.findAll('[role="slider"]')).toHaveLength(2);
  });

  test('show-input 仅在单值模式显示，Tooltip 仅在交互时显示', async () => {
    const range = mount(Slider, { props: { modelValue: [20, 40], range: true, showInput: true } });
    expect(range.findAll('input[type="number"]')).toHaveLength(0);

    const wrapper = mount(Slider, { props: { modelValue: 20, showTooltip: true } });
    expect(wrapper.find('.i-slider__tooltip').classes()).toContain('is-hidden');
    await wrapper.get('[role="slider"]').trigger('focus');
    expect(wrapper.find('.i-slider__tooltip').exists()).toBe(true);
    await wrapper.get('[role="slider"]').trigger('blur');
    expect(wrapper.find('.i-slider__tooltip').classes()).toContain('is-hidden');

    const persistent = mount(Slider, { props: { modelValue: 20, showTooltip: true, persistent: true } });
    expect(persistent.find('.i-slider__tooltip').exists()).toBe(true);
  });

  test('支持垂直 height、tooltip 属性和 aria value 文本', () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 20,
        vertical: true,
        height: '320px',
        placement: 'bottom',
        tooltipClass: 'custom-tooltip',
        formatValueText: (value: number) => `当前 ${value}`,
        inputSize: 'small',
        debounce: 100,
        validateEvent: false,
        persistent: true
      }
    });

    expect(wrapper.attributes('style')).toContain('height: 320px');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuetext')).toBe('当前 20');
    expect(wrapper.get('.i-slider__tooltip').classes()).toContain('custom-tooltip');
    expect(wrapper.get('.i-slider__tooltip').classes()).toContain('is-bottom');
  });

  test('支持 step=mark、四向 tooltip 和当前 handle 显示', async () => {
    const wrapper = mount(Slider, {
      attrs: { 'aria-label': '进度' },
      props: { modelValue: 40, min: 0, max: 100, step: 'mark', marks: { 0: '0', 40: '40', 100: '100' }, placement: 'right', showStops: true }
    });
    await wrapper.get('[role="slider"]').trigger('focus');
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('40');
    expect(wrapper.get('.i-slider__tooltip').classes()).toContain('is-right');
    expect(wrapper.get('[role="slider"]').attributes('aria-label')).toBe('进度');
    expect(wrapper.findAll('.i-slider__stop')).toHaveLength(3);

    await wrapper.setProps({ placement: 'left' });
    expect(wrapper.get('.i-slider__tooltip').classes()).toContain('is-left');

    const range = mount(Slider, { props: { modelValue: [20, 80], range: true, marks: { 20: '20', 80: '80' } } });
    await range.findAll('[role="slider"]')[0].trigger('focus');
    expect(range.findAll('.i-slider__tooltip.is-hidden')).toHaveLength(1);
  });

  test('persistent 只控制隐藏时是否保留 Tooltip，不改变显示状态', async () => {
    const defaultWrapper = mount(Slider, { props: { modelValue: 20 } });
    expect(defaultWrapper.props('persistent')).toBe(true);
    expect(defaultWrapper.find('.i-slider__tooltip').exists()).toBe(true);
    expect(defaultWrapper.find('.i-slider__tooltip').classes()).toContain('is-hidden');
    expect(defaultWrapper.find('.i-slider__tooltip').attributes('style') || '').not.toContain('display: none');
    await defaultWrapper.get('[role="slider"]').trigger('focus');
    expect(defaultWrapper.find('.i-slider__tooltip').classes()).not.toContain('is-hidden');
    await defaultWrapper.get('[role="slider"]').trigger('blur');
    expect(defaultWrapper.find('.i-slider__tooltip').classes()).toContain('is-hidden');

    const transient = mount(Slider, { props: { modelValue: 20, persistent: false } });
    expect(transient.find('.i-slider__tooltip').exists()).toBe(false);
  });

  test('点击当前位置不重复触发值变更事件', async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 } });
    const track = wrapper.get('.i-slider__track');
    (track.element as HTMLElement).getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 6, right: 100, bottom: 6, x: 0, y: 0, toJSON: () => ({}) });
    await track.trigger('click', { clientX: 50, clientY: 0 });
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  test('input-size 未设置时继承 Slider size，显式设置时优先', () => {
    const large = mount(Slider, { props: { modelValue: 20, size: 'large', showInput: true } });
    expect(large.find('.i-slider__input-wrap').classes()).toContain('i-slider__input-wrap--large');

    const explicit = mount(Slider, { props: { modelValue: 20, size: 'large', inputSize: 'small', showInput: true } });
    expect(explicit.find('.i-slider__input-wrap').classes()).toContain('i-slider__input-wrap--small');
  });

  test('step=mark 时不显示 show-input', () => {
    const wrapper = mount(Slider, { props: { modelValue: 20, step: 'mark', marks: { 0: '0', 20: '20' }, showInput: true } });
    expect(wrapper.find('input[type="number"]').exists()).toBe(false);
  });

  test('拖动结束时触发表单校验', async () => {
    const validate = vi.fn();
    const wrapper = mount(Slider, {
      props: { modelValue: 20 },
      global: { provide: { [fieldKey as symbol]: { id: 'field', validate } } }
    });
    const track = wrapper.get('.i-slider__track');
    (track.element as HTMLElement).getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 6, right: 100, bottom: 6, x: 0, y: 0, toJSON: () => ({}) });
    await wrapper.get('[role="slider"]').trigger('pointerdown', { clientX: 20, pointerId: 1 });
    await track.trigger('pointermove', { clientX: 70, pointerId: 1 });
    await track.trigger('pointerup', { clientX: 70, pointerId: 1 });
    expect(validate).toHaveBeenCalledWith('change');
  });

  test('支持 label 和 aria-label 兼容属性', () => {
    const label = mount(Slider, { props: { modelValue: 20, label: '音量' } });
    expect(label.get('[role="slider"]').attributes('aria-label')).toBe('音量');
    const ariaLabel = mount(Slider, { props: { modelValue: 20, label: '音量', ariaLabel: '主音量' } });
    expect(ariaLabel.get('[role="slider"]').attributes('aria-label')).toBe('主音量');
  });

  test('validate-event 触发表单校验，debounce 延迟输入框更新', async () => {
    const validate = vi.fn();
    const wrapper = mount(Slider, {
      props: { modelValue: 10, showInput: true, debounce: 20 },
      global: { provide: { [fieldKey as symbol]: { id: 'field', validate } } }
    });
    const input = wrapper.get('input[type="number"]');
    (input.element as HTMLInputElement).value = '20';
    await input.trigger('input');
    expect(wrapper.emitted('input')).toBeUndefined();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(wrapper.emitted('input')?.at(-1)).toEqual([20]);
    expect(validate).toHaveBeenCalledWith('change');
  });

  test('渲染 stops 和 marks', () => {
    const wrapper = mount(Slider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        step: 25,
        showStops: true,
        marks: { 0: '零', 50: '中点', 100: '满' }
      }
    });

    expect(wrapper.findAll('.i-slider__stop')).toHaveLength(5);
    expect(wrapper.findAll('.i-slider__mark')).toHaveLength(3);
    expect(wrapper.text()).toContain('中点');
  });
});
