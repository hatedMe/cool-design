import { mount } from '@vue/test-utils';
import { defineComponent, h, reactive, ref } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { fieldKey } from '../../form/context';
import Slider from '../index';
import * as CoolDesign from '../../index';

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

    expect(wrapper.findAll('.i-slider__input-wrap')).toHaveLength(2);
    expect(wrapper.findAll('.i-input-number')).toHaveLength(2);
    expect(wrapper.findAll('[aria-label="增加"]')).toHaveLength(2);
    expect(wrapper.findAll('[aria-label="减少"]')).toHaveLength(2);
    expect(wrapper.findAll('input')[0].attributes('aria-label')).toBe('起始');
    expect(wrapper.findAll('input')[1].attributes('aria-label')).toBe('结束');
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
    expect(wrapper.find('.i-slider__inputs').exists()).toBe(false);
    expect(wrapper.find('.i-input-number').exists()).toBe(false);
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
    const input = wrapper.get('.i-input-number input');
    (input.element as HTMLInputElement).value = '20';
    await input.trigger('input');
    expect(wrapper.emitted('input')).toBeUndefined();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(wrapper.emitted('input')?.at(-1)).toEqual([20]);
    expect(wrapper.emitted('change')).toBeUndefined();
    await input.trigger('blur');
    expect(wrapper.emitted('change')?.at(-1)).toEqual([20]);
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

  test('表单内继承禁用与尺寸，全局配置尺寸兜底', async () => {
    const model = reactive({ volume: 30 });
    const Host = defineComponent({
      setup: () => () =>
        h(CoolDesign.Form, { model, size: 'large', disabled: true }, () =>
          h(CoolDesign.FormItem, { prop: 'volume', label: '音量' }, () =>
            h(CoolDesign.Slider, { modelValue: model.volume, showInput: true })
          )
        )
    });
    const wrapper = mount(Host);
    const slider = wrapper.find('.i-slider');
    expect(slider.classes()).toContain('is-disabled');
    expect(slider.classes()).toContain('i-slider--large');
    expect(wrapper.find('.i-slider__input-wrap--large').exists()).toBe(true);
    expect(wrapper.get('[role="slider"]').attributes('tabindex')).toBe('-1');
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('input')).toBeUndefined();
    expect(wrapper.get('.i-input-number input').attributes('disabled')).toBeDefined();
    wrapper.unmount();

    const GlobalHost = defineComponent({
      setup: () => () => h(CoolDesign.ConfigProvider, { size: 'small' }, () => h(CoolDesign.Slider, { modelValue: 10 }))
    });
    const global = mount(GlobalHost);
    expect(global.find('.i-slider').classes()).toContain('i-slider--small');
    global.unmount();

    const fallback = mount(Slider, { props: { modelValue: 10 } });
    expect(fallback.find('.i-slider').classes()).toContain('i-slider--default');
  });

  test('range 模式双输入框相互约束', async () => {
    const mountRange = () => {
      const model = ref<[number, number]>([20, 40]);
      const wrapper = mount(Slider, {
        props: {
          modelValue: model.value,
          range: true,
          min: 0,
          max: 100,
          showInput: true,
          'onUpdate:modelValue': (value: number | number[]) => {
            model.value = [...value] as [number, number];
            wrapper.setProps({ modelValue: model.value });
          }
        }
      });
      return { model, wrapper };
    };

    const upper = mountRange();
    const upperInputs = upper.wrapper.findAll('.i-input-number input');
    expect(upperInputs).toHaveLength(2);
    (upperInputs[0].element as HTMLInputElement).value = '60';
    await upperInputs[0].trigger('input');
    // 起始输入框受结束值 40 约束，超出时吸附到 40
    expect(upper.model.value[0]).toBe(40);

    const lower = mountRange();
    const lowerInputs = lower.wrapper.findAll('.i-input-number input');
    (lowerInputs[1].element as HTMLInputElement).value = '10';
    await lowerInputs[1].trigger('input');
    // 结束输入框受起始值 20 约束，低于时吸附到 20
    expect(lower.model.value[1]).toBe(20);
  });
});

test('Slider 直挂禁用 Form 时继承尺寸并拦截方向键', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {}, size: 'small', disabled: true },
    slots: { default: () => h(Slider, { modelValue: 10 }) }
  });
  const slider = wrapper.getComponent(Slider);
  await slider.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
  expect(slider.emitted('update:modelValue')).toBeUndefined();
  expect(slider.classes()).toContain('i-slider--small');
  wrapper.unmount();
});

test('Slider 禁用 Form 后拦截在途拖拽提交', async () => {
  const wrapper = mount(CoolDesign.Form, {
    props: { model: {} },
    slots: { default: () => h(Slider, { modelValue: 10 }) }
  });
  const slider = wrapper.getComponent(Slider);
  const handle = slider.get('[role="slider"]');
  const track = slider.get('.i-slider__track');
  await handle.trigger('pointerdown', { pointerId: 1 });
  await wrapper.setProps({ disabled: true });
  await track.trigger('pointermove', { pointerId: 1, clientX: 70 });
  await track.trigger('pointerup', { pointerId: 1 });
  expect(slider.emitted('update:modelValue')).toBeUndefined();
  expect(slider.emitted('change')).toBeUndefined();
  wrapper.unmount();
});
