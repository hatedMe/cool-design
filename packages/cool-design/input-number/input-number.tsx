import { computed, defineComponent, ref, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import './index.scss';

const [componentName, bem] = createNamespace('input-number');

type Size = 'large' | 'default' | 'small';
type ControlsPosition = '' | 'right';

const decimalPlaces = (value: number) => {
  const text = String(value);
  return text.includes('e-') ? Number(text.split('e-')[1]) : (text.split('.')[1] || '').length;
};

const round = (value: number, precision?: number) => {
  if (precision === undefined) return value;
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export default defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    modelValue: { type: [Number, null] as PropType<number | null>, default: 0 },
    value: { type: [Number, null] as PropType<number | null>, default: undefined },
    min: { type: Number, default: Number.MIN_SAFE_INTEGER },
    max: { type: Number, default: Number.MAX_SAFE_INTEGER },
    step: { type: Number, default: 1 },
    stepStrictly: Boolean,
    strictly: Boolean,
    precision: Number,
    controls: { type: Boolean, default: true },
    controlsPosition: { type: String as PropType<ControlsPosition>, default: '' },
    disabled: Boolean,
    readonly: Boolean,
    size: String as PropType<Size>,
    placeholder: String,
    name: String,
    id: String,
    inputmode: String as PropType<'text' | 'search' | 'none' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal'>,
    tabindex: [String, Number],
    ariaLabel: String,
    formatter: Function as PropType<(value: number | null) => string>,
    parser: Function as PropType<(value: string) => number | null>,
    valueOnClear: [Number, String, null] as PropType<number | null | 'min' | 'max'>
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  setup(props, { attrs, emit, expose, slots }) {
    const input = ref<HTMLInputElement>();
    const editing = ref(false);
    const draft = ref('');
    const isStrict = computed(() => props.stepStrictly || props.strictly);
    const precision = computed(() => props.precision ?? decimalPlaces(props.step));
    const currentValue = computed(() => (props.value !== undefined ? props.value : props.modelValue));
    const displayValue = computed(() => {
      if (editing.value) return draft.value;
      return props.formatter ? props.formatter(currentValue.value) : currentValue.value == null ? '' : String(currentValue.value);
    });

    const clamp = (value: number) => Math.min(props.max, Math.max(props.min, value));
    const alignStep = (value: number) => {
      if (!isStrict.value || !props.step) return value;
      return props.min + Math.round((value - props.min) / props.step) * props.step;
    };
    const normalize = (value: number) => round(clamp(alignStep(value)), precision.value);
    const emitValue = (value: number | null) => {
      emit('update:modelValue', value);
      emit('change', value);
    };
    const parse = (text: string): number | null => {
      if (props.parser) return props.parser(text);
      if (text.trim() === '') return null;
      const value = Number(text);
      return Number.isFinite(value) ? value : null;
    };
    const updateBy = (amount: number) => {
      if (props.disabled || props.readonly) return;
      const base = currentValue.value ?? 0;
      emitValue(normalize(base + amount));
    };
    const clearValue = () => {
      if (props.disabled || props.readonly) return;
      const value = props.valueOnClear === 'min' ? props.min : props.valueOnClear === 'max' ? props.max : props.valueOnClear ?? null;
      emitValue(value);
    };
    const handleInput = (event: Event) => {
      if (props.disabled || props.readonly) return;
      const text = (event.target as HTMLInputElement).value;
      draft.value = text;
      const value = parse(text);
      if (value !== null) emit('update:modelValue', normalize(value));
      else if (text.trim() === '') emit('update:modelValue', null);
    };
    const handleBlur = (event: FocusEvent) => {
      editing.value = false;
      const value = parse(draft.value);
      if (value === null) {
        if (draft.value.trim() === '') clearValue();
      } else {
        emitValue(normalize(value));
      }
      emit('blur', event);
    };
    const focus = () => input.value?.focus();
    const blur = () => input.value?.blur();
    expose({ focus, blur });

    return () => {
      const disabled = props.disabled;
      const buttonClass = (type: 'increase' | 'decrease') => bem(type, { disabled: disabled || (type === 'increase' ? currentValue.value! >= props.max : currentValue.value! <= props.min) });
      const inputAttrs = {
        ...attrs,
        id: props.id,
        name: props.name,
        inputmode: props.inputmode,
        tabindex: props.tabindex,
        'aria-label': props.ariaLabel,
        placeholder: props.placeholder,
        disabled,
        readonly: props.readonly,
        value: displayValue.value
      };
      const inputNode = (
        <input
          {...inputAttrs}
          ref={input}
          type='text'
          onFocus={(event) => {
            editing.value = true;
            draft.value = currentValue.value == null ? '' : String(currentValue.value);
            emit('focus', event);
          }}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeydown={(event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              updateBy(props.step);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              updateBy(-props.step);
            } else if (event.key === 'Enter') {
              handleBlur(event as unknown as FocusEvent);
            }
          }}
        />
      );
      return (
        <div class={[bem({ disabled }), `i-control--${props.size || 'default'}`, props.controlsPosition === 'right' && 'is-controls-right']}>
          {slots.prefix?.()}
          {props.controls && props.controlsPosition !== 'right' && (
            <button type='button' class={buttonClass('decrease')} aria-label='减少' disabled={disabled || currentValue.value! <= props.min} onClick={() => updateBy(-props.step)}>
              {slots['decrease-icon']?.() ?? '-'}
            </button>
          )}
          {inputNode}
          {props.controls && props.controlsPosition !== 'right' && (
            <button type='button' class={buttonClass('increase')} aria-label='增加' disabled={disabled || currentValue.value! >= props.max} onClick={() => updateBy(props.step)}>
              {slots['increase-icon']?.() ?? '+'}
            </button>
          )}
          {props.controls && props.controlsPosition === 'right' && (
            <span class={bem('controls')}>
              <button type='button' class={buttonClass('increase')} aria-label='增加' disabled={disabled || currentValue.value! >= props.max} onClick={() => updateBy(props.step)}>{slots['increase-icon']?.() ?? '+'}</button>
              <button type='button' class={buttonClass('decrease')} aria-label='减少' disabled={disabled || currentValue.value! <= props.min} onClick={() => updateBy(-props.step)}>{slots['decrease-icon']?.() ?? '-'}</button>
            </span>
          )}
          {slots.suffix?.()}
        </div>
      );
    };
  }
});
