import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import { Icon } from '../icon';
import type { RateColor, RateIcon, RateProps, RateSize } from './types';

const [name, bem] = createNamespace('rate');

const props = {
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
  size: { type: [String, Number] as PropType<RateSize>, default: 'default' },
  disabled: Boolean,
  allowHalf: Boolean,
  lowThreshold: { type: Number, default: 2 },
  highThreshold: { type: Number, default: 4 },
  colors: { type: [String, Array] as PropType<RateColor>, default: undefined },
  voidColor: String,
  disabledVoidColor: String,
  icons: { type: Array as PropType<RateIcon[]>, default: undefined },
  voidIcon: { type: [String, Object, Function] as PropType<RateIcon>, default: 'star' },
  disabledVoidIcon: { type: [String, Object, Function] as PropType<RateIcon>, default: 'star' },
  showText: Boolean,
  showScore: Boolean,
  textColor: String,
  texts: { type: Array as PropType<string[]>, default: () => [] },
  scoreTemplate: { type: String, default: '{value}' },
  clearable: Boolean,
  id: String,
  ariaLabel: String,
  label: String
};

const normalizeValue = (value: number, max: number, allowHalf: boolean) => {
  const normalizedMax = Math.max(0, Math.floor(max));
  const step = allowHalf ? 0.5 : 1;
  return Math.min(normalizedMax, Math.max(0, Math.round((Number(value) || 0) / step) * step));
};

export default defineComponent({
  name,
  inheritAttrs: false,
  props,
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, expose }) {
    const currentValue = ref(normalizeValue(props.modelValue, props.max, props.allowHalf));
    const hoverValue = ref(0);
    const initialValue = ref(currentValue.value);
    watch(() => [props.modelValue, props.max, props.allowHalf], () => {
      currentValue.value = normalizeValue(props.modelValue, props.max, props.allowHalf);
      initialValue.value = currentValue.value;
    });

    const setCurrentValue = (value: number) => {
      currentValue.value = normalizeValue(value, props.max, props.allowHalf);
    };
    const resetCurrentValue = () => {
      hoverValue.value = 0;
      currentValue.value = initialValue.value;
    };
    const commitValue = (value: number) => {
      if (props.disabled) return;
      const normalized = normalizeValue(value, props.max, props.allowHalf);
      const isSameRating = normalized === currentValue.value;
      const isAdjacentHalf = props.allowHalf && ((Number.isInteger(currentValue.value) && normalized === currentValue.value - 0.5) || (!Number.isInteger(currentValue.value) && normalized === Math.floor(currentValue.value)));
      const next = props.clearable && (isSameRating || isAdjacentHalf) ? 0 : normalized;
      currentValue.value = next;
      initialValue.value = next;
      emit('update:modelValue', next);
      emit('change', next);
    };
    expose({ setCurrentValue, resetCurrentValue });

    const activeValue = computed(() => hoverValue.value || currentValue.value);
    const getColor = (index: number, selected: boolean) => {
      if (!selected) return props.disabled ? props.disabledVoidColor : props.voidColor;
      const colors = Array.isArray(props.colors) ? props.colors : props.colors ? [props.colors] : [];
      if (!colors.length) return undefined;
      const value = activeValue.value;
      return colors[value <= props.lowThreshold ? 0 : value <= props.highThreshold ? 1 : 2] || colors[index];
    };
    const displayText = computed(() => {
      const value = activeValue.value;
      return props.scoreTemplate.replace('{value}', String(value));
    });

    return () => (
      <div
        {...attrs}
        id={props.id}
        class={[bem(), props.disabled && bem('', { disabled: true }), typeof props.size === 'string' && props.size !== 'default' && `i-rate--${props.size}`]}
        role='radiogroup'
        aria-label={props.ariaLabel}
        aria-valuenow={currentValue.value}
        aria-valuemin='0'
        aria-valuemax={Math.max(0, Math.floor(props.max))}
        title={props.label}>
        {Array.from({ length: Math.max(0, Math.floor(props.max)) }, (_, index) => {
          const itemValue = index + 1;
          const selected = activeValue.value >= itemValue;
          const half = props.allowHalf && activeValue.value === itemValue - 0.5;
          const icon = selected || half ? props.icons?.[index] ?? 'star' : props.disabled ? props.disabledVoidIcon : props.voidIcon;
          return (
            <span
              class={bem('item')}
              role='radio'
              aria-checked={selected ? 'true' : 'false'}
              aria-disabled={props.disabled ? 'true' : undefined}
              aria-label={`${half ? itemValue - 0.5 : itemValue}分${half ? '（半星）' : ''}`}
              tabindex={props.disabled ? -1 : 0}
              data-half={half ? 'true' : undefined}
              onClick={(event: MouseEvent) => {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                const value = props.allowHalf && event.clientX - rect.left < rect.width / 2 ? itemValue - 0.5 : itemValue;
                commitValue(value);
              }}
              onMouseenter={(event: MouseEvent) => {
                if (!props.disabled) {
                  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                  hoverValue.value = props.allowHalf && event.clientX - rect.left < rect.width / 2 ? itemValue - 0.5 : itemValue;
                }
              }}
              onMouseleave={() => (hoverValue.value = 0)}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  commitValue(itemValue);
                } else if (props.allowHalf && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                  event.preventDefault();
                  commitValue(currentValue.value + (event.key === 'ArrowRight' ? 0.5 : -0.5));
                }
              }}>
              <Icon class={bem('icon', { half })} icon={icon} color={getColor(index, selected || half)} size={props.size} aria-hidden='true' />
            </span>
          );
        })}
        {(props.showText || props.showScore) && <span class={bem('text')} style={{ color: props.textColor }}>{props.showScore ? displayText.value : props.texts[Math.max(0, Math.ceil(activeValue.value) - 1)]}</span>}
      </div>
    );
  }
});

export type { RateProps } from './types';
