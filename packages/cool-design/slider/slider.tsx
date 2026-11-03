import { computed, defineComponent, nextTick, onBeforeUnmount, type CSSProperties, type PropType, ref } from 'vue';
import { useField } from '../form/context';

type SliderValue = number | number[];
type Mark = string | { style?: CSSProperties; label?: string };

type SliderProps = {
  modelValue: SliderValue;
  min: number;
  max: number;
  step: number | 'mark';
  disabled: boolean;
  range: boolean;
  vertical: boolean;
  showInput: boolean;
  showInputControls: boolean;
  showStops: boolean;
  showTooltip: boolean;
  persistent: boolean;
  formatTooltip?: (value: number) => string;
  formatValueText?: (value: number) => string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  tooltipClass?: string;
  height?: string | number;
  inputSize?: 'large' | 'default' | 'small';
  debounce: number;
  validateEvent: boolean;
  label?: string;
  ariaLabel?: string;
  rangeStartLabel?: string;
  rangeEndLabel?: string;
  marks?: Record<number, Mark>;
  size?: 'large' | 'default' | 'small';
};

export default defineComponent({
  name: 'i-slider',
  inheritAttrs: false,
  props: {
    modelValue: { type: [Number, Array] as PropType<SliderValue>, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: [Number, String] as PropType<number | 'mark'>, default: 1 },
    disabled: Boolean,
    range: Boolean,
    vertical: Boolean,
    showInput: Boolean,
    showInputControls: { type: Boolean, default: true },
    showStops: Boolean,
    showTooltip: { type: Boolean, default: true },
    persistent: { type: Boolean, default: true },
    formatTooltip: Function as PropType<SliderProps['formatTooltip']>,
    formatValueText: Function as PropType<SliderProps['formatValueText']>,
    placement: { type: String as PropType<SliderProps['placement']>, default: 'top' },
    tooltipClass: String,
    height: [String, Number] as PropType<string | number>,
    inputSize: String as PropType<SliderProps['inputSize']>,
    debounce: { type: Number, default: 0 },
    validateEvent: { type: Boolean, default: true },
    label: String,
    ariaLabel: String,
    rangeStartLabel: String,
    rangeEndLabel: String,
    marks: Object as PropType<Record<number, Mark>>,
    size: { type: String as PropType<SliderProps['size']>, default: 'default' }
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { emit, slots, attrs }) {
    const activeHandle = ref(0);
    const focusedHandle = ref<number | null>(null);
    const field = useField();
    const bounds = computed(() => {
      const min = Number.isFinite(props.min) ? props.min : 0;
      const max = Number.isFinite(props.max) && props.max > min ? props.max : min + 100;
      const step = props.step === 'mark' ? 1 : Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
      return { min, max, step };
    });

    const precision = (value: number) => {
      const stepText = String(bounds.value.step);
      const decimals = stepText.includes('.') ? stepText.split('.')[1].length : 0;
      return Number(value.toFixed(Math.min(decimals, 12)));
    };

    const normalizeNumber = (value: number) => {
      const { min, max, step } = bounds.value;
      const numeric = Number.isFinite(value) ? value : min;
      if (props.step === 'mark') {
        const markValues = Object.keys(props.marks || {}).map(Number).filter((mark) => mark >= min && mark <= max);
        if (markValues.length) return markValues.reduce((nearest, mark) => Math.abs(mark - numeric) < Math.abs(nearest - numeric) ? mark : nearest);
      }
      const stepped = min + Math.round((numeric - min) / step) * step;
      return precision(Math.min(max, Math.max(min, stepped)));
    };

    const values = computed(() => {
      if (!props.range) return [normalizeNumber(Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue)];
      const source = Array.isArray(props.modelValue) && props.modelValue.length >= 2
        ? props.modelValue.slice(0, 2)
        : [bounds.value.min, bounds.value.max];
      return source.map(normalizeNumber).sort((a, b) => a - b);
    });

    const percentage = (value: number) => ((value - bounds.value.min) / (bounds.value.max - bounds.value.min)) * 100;
    const displayValue = (value: number) => (props.formatTooltip ? props.formatTooltip(value) : String(value));
    const cssHeight = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height));
    const resolvedInputSize = computed(() => props.inputSize || props.size);
    const output = (next: number[]) => (props.range ? next : next[0]);
    const commitValue = (result: SliderValue) => {
      emit('change', result);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };

    const update = (value: number, handle = activeHandle.value, commit = true) => {
      if (props.disabled) return;
      const next = [...values.value];
      next[handle] = normalizeNumber(value);
      if (props.range) {
        if (next[0] > next[1]) {
          if (handle === 0) next[1] = next[0];
          else next[0] = next[1];
        }
      }
      const result = output(next);
      emit('update:modelValue', result);
      emit('input', result);
      if (commit) commitValue(result);
    };

    let dragging = false;
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || props.disabled) return;
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const ratio = props.vertical ? 1 - (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
      update(bounds.value.min + ratio * (bounds.value.max - bounds.value.min), activeHandle.value, false);
    };
    const stopDragging = () => {
      if (dragging) commitValue(output(values.value));
      dragging = false;
    };
    const startDragging = (event: PointerEvent, handle: number) => {
      if (props.disabled) return;
      activeHandle.value = handle;
      dragging = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    };

    const updateFromKeyboard = (event: KeyboardEvent, handle: number) => {
      if (props.disabled) return;
      const current = values.value[handle];
      const distance = bounds.value.max - bounds.value.min;
      const jump = event.key === 'PageUp' || event.key === 'PageDown' ? bounds.value.step * 10 : bounds.value.step;
      let next = current;
      if (event.key === 'ArrowRight' || (!props.vertical && event.key === 'ArrowUp')) next += jump;
      if (event.key === 'ArrowLeft' || (!props.vertical && event.key === 'ArrowDown')) next -= jump;
      if (props.vertical && event.key === 'ArrowUp') next += jump;
      if (props.vertical && event.key === 'ArrowDown') next -= jump;
      if (event.key === 'PageUp') next += distance / 10;
      if (event.key === 'PageDown') next -= distance / 10;
      if (event.key === 'Home') next = bounds.value.min;
      if (event.key === 'End') next = bounds.value.max;
      if (next !== current) {
        event.preventDefault();
        activeHandle.value = handle;
        update(next, handle);
      }
    };

    const handleTrackClick = (event: MouseEvent) => {
      if (props.disabled) return;
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const ratio = props.vertical ? 1 - (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width;
      const value = bounds.value.min + ratio * (bounds.value.max - bounds.value.min);
      const handle = props.range && Math.abs(value - values.value[1]) < Math.abs(value - values.value[0]) ? 1 : 0;
      const nextValue = normalizeNumber(value);
      if (nextValue === values.value[handle]) return;
      activeHandle.value = handle;
      update(nextValue, handle);
    };

    let inputTimer: ReturnType<typeof setTimeout> | undefined;
    onBeforeUnmount(() => {
      if (inputTimer) clearTimeout(inputTimer);
    });
    const inputValue = (event: Event, handle: number, immediate = false) => {
      const value = Number((event.target as HTMLInputElement).value);
      if (inputTimer) clearTimeout(inputTimer);
      if (immediate || props.debounce <= 0) update(value, handle);
      else inputTimer = setTimeout(() => update(value, handle), props.debounce);
    };
    const stops = computed(() => {
      if (!props.showStops) return [];
      if (props.step === 'mark') return Object.keys(props.marks || {}).map(Number).filter((value) => value >= bounds.value.min && value <= bounds.value.max).sort((a, b) => a - b);
      const result: number[] = [];
      for (let value = bounds.value.min; value <= bounds.value.max; value += bounds.value.step) result.push(precision(value));
      return result;
    });
    const markEntries = computed(() => Object.entries(props.marks || {}).map(([value, mark]) => ({ value: Number(value), mark })).filter(({ value }) => value >= bounds.value.min && value <= bounds.value.max));

    return () => (
      <div {...attrs} class={{ 'i-slider': true, 'is-vertical': props.vertical, 'is-disabled': props.disabled, [`i-slider--${props.vertical ? 'default' : props.size}`]: true }} style={props.vertical && cssHeight.value ? { ...(attrs.style as Record<string, string> || {}), height: cssHeight.value } : attrs.style as string | undefined}>
        {props.rangeStartLabel && <span class='i-slider__label'>{props.rangeStartLabel}</span>}
        <div class='i-slider__body'>
          <div class='i-slider__track' onClick={handleTrackClick} onPointermove={handlePointerMove} onPointerup={stopDragging} onPointercancel={stopDragging}>
            <div class='i-slider__bar' style={props.vertical
              ? (props.range
                ? { bottom: `${percentage(values.value[0])}%`, height: `${percentage(values.value[1]) - percentage(values.value[0])}%` }
                : { height: `${percentage(values.value[0])}%` })
              : (props.range
                ? { left: `${percentage(values.value[0])}%`, width: `${percentage(values.value[1]) - percentage(values.value[0])}%` }
                : { width: `${percentage(values.value[0])}%` })} />
            {stops.value.map((stop) => <span class='i-slider__stop' style={props.vertical ? { bottom: `${percentage(stop)}%` } : { left: `${percentage(stop)}%` }} />)}
            {markEntries.value.map(({ value, mark }) => {
              const markValue = typeof mark === 'string' ? mark : mark.label;
              const style = typeof mark === 'string' ? {} : mark.style;
              return <span class='i-slider__mark' style={{ ...(props.vertical ? { bottom: `${percentage(value)}%` } : { left: `${percentage(value)}%` }), ...style }}>{slots.mark ? slots.mark({ value, label: markValue }) : markValue}</span>;
            })}
            {values.value.map((value, index) => (
              <span
                class='i-slider__handle'
                role='slider'
                tabindex={props.disabled ? -1 : 0}
                aria-valuemin={bounds.value.min}
                aria-valuemax={bounds.value.max}
                aria-valuenow={value}
                aria-valuetext={props.formatValueText ? props.formatValueText(value) : undefined}
                aria-orientation={props.vertical ? 'vertical' : 'horizontal'}
                aria-disabled={props.disabled ? 'true' : undefined}
                aria-label={props.range
                  ? (index === 0 ? props.rangeStartLabel || `${props.ariaLabel || props.label || attrs['aria-label'] || ''}起始值` : props.rangeEndLabel || `${props.ariaLabel || props.label || attrs['aria-label'] || ''}结束值`)
                  : props.ariaLabel || props.label || String(attrs['aria-label'] || '滑块')}
                style={props.vertical ? { bottom: `${percentage(value)}%` } : { left: `${percentage(value)}%` }}
                onFocus={() => { activeHandle.value = index; focusedHandle.value = index; }}
                onBlur={() => { focusedHandle.value = null; }}
                onPointerdown={(event: PointerEvent) => { focusedHandle.value = index; startDragging(event, index); }}
                onPointerup={() => { focusedHandle.value = null; }}
                onKeydown={(event: KeyboardEvent) => updateFromKeyboard(event, index)}
              >
                {props.showTooltip && (props.persistent || focusedHandle.value === index || (dragging && activeHandle.value === index)) && <span class={{ 'i-slider__tooltip': true, 'is-hidden': focusedHandle.value !== index && !dragging, [props.tooltipClass || '']: Boolean(props.tooltipClass), [`is-${props.placement}`]: true }}>{displayValue(value)}</span>}
              </span>
            ))}
          </div>
        </div>
        {props.rangeEndLabel && <span class='i-slider__label'>{props.rangeEndLabel}</span>}
        {props.showInput && !props.range && props.step !== 'mark' && values.value.map((value) => (
          <div class={{ 'i-slider__input-wrap': true, [`i-slider__input-wrap--${resolvedInputSize.value}`]: true }}>
            {props.showInputControls && <button type='button' aria-label='减少' disabled={props.disabled || value <= bounds.value.min} onClick={() => update(value - bounds.value.step, 0)}>-</button>}
            <input class='i-slider__number' type='number' min={bounds.value.min} max={bounds.value.max} step={bounds.value.step} value={value} disabled={props.disabled} onInput={(event: Event) => inputValue(event, 0)} onChange={(event: Event) => inputValue(event, 0, true)} />
            {props.showInputControls && <button type='button' aria-label='增加' disabled={props.disabled || value >= bounds.value.max} onClick={() => update(value + bounds.value.step, 0)}>+</button>}
          </div>
        ))}
      </div>
    );
  }
});
