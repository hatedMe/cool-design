import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import { Icon } from '../icon';
import type { RateColor, RateIcon, RateIconMap, RateSize, RateThresholdValue } from './types';

const [name, bem] = createNamespace('rate');

const props = {
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
  size: { type: [String, Number] as PropType<RateSize>, default: 'default' },
  disabled: Boolean,
  allowHalf: Boolean,
  lowThreshold: { type: Number, default: 2 },
  highThreshold: { type: Number, default: 4 },
  colors: { type: [String, Array, Object] as PropType<RateColor>, default: undefined },
  voidColor: String,
  disabledVoidColor: String,
  icons: { type: [Array, Object] as PropType<RateIconMap>, default: undefined },
  voidIcon: { type: [String, Object, Function] as PropType<RateIcon>, default: 'icon-collection_fill' },
  disabledVoidIcon: { type: [String, Object, Function] as PropType<RateIcon>, default: 'icon-browse_fill' },
  showText: Boolean,
  showScore: Boolean,
  textColor: String,
  texts: { type: Array as PropType<string[]>, default: () => ['Extremely bad', 'Disappointed', 'Fair', 'Satisfied', 'Surprise'] },
  scoreTemplate: { type: String, default: '{value}' },
  clearable: Boolean,
  id: String,
  ariaLabel: String,
  label: String
};

const normalizeValue = (value: number, max: number) => {
  const normalizedMax = Math.max(0, Number(max) || 0);
  const numericValue = Number(value);
  return Math.min(normalizedMax, Math.max(0, Number.isFinite(numericValue) ? numericValue : 0));
};

const interactionValue = (value: number, allowHalf: boolean) => {
  const step = allowHalf ? 0.5 : 1;
  return Math.round(value / step) * step;
};

export default defineComponent({
  name,
  inheritAttrs: false,
  props,
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, expose }) {
    const currentValue = ref(normalizeValue(props.modelValue, props.max));
    const hoverValue = ref(0);
    watch(() => [props.modelValue, props.max], () => {
      currentValue.value = normalizeValue(props.modelValue, props.max);
    });

    const setCurrentValue = (value: number) => {
      currentValue.value = normalizeValue(value, props.max);
    };
    const resetCurrentValue = () => {
      hoverValue.value = 0;
      currentValue.value = normalizeValue(props.modelValue, props.max);
    };
    const commitValue = (value: number) => {
      if (props.disabled) return;
      const normalized = normalizeValue(interactionValue(value, props.allowHalf), props.max);
      const next = props.clearable && normalized === currentValue.value ? 0 : normalized;
      const changed = next !== currentValue.value;
      currentValue.value = next;
      emit('update:modelValue', next);
      if (changed) emit('change', next);
    };
    expose({ setCurrentValue, resetCurrentValue });

    const activeValue = computed(() => hoverValue.value || currentValue.value);
    const displayText = computed(() => {
      const value = props.disabled ? normalizeValue(props.modelValue, props.max) : activeValue.value;
      return props.showScore
        ? props.scoreTemplate.replace(/\{\s*value\s*\}/g, String(value))
        : value > 0 ? props.texts[Math.max(0, Math.ceil(value) - 1)] || '' : '';
    });
    const resolveThreshold = <T,>(value: T | T[] | Record<number, T | RateThresholdValue<T>> | undefined, score: number, fallback?: T) => {
      if (Array.isArray(value)) {
        const segment = score < props.lowThreshold ? 0 : score < props.highThreshold ? 1 : 2;
        return value[Math.min(segment, value.length - 1)] ?? fallback;
      }
      if (value && typeof value === 'object') {
        const legacyExcluded = (value as Record<string, unknown>).excluded;
        if (Array.isArray(legacyExcluded) && legacyExcluded.includes(score)) return fallback;
        const entries = Object.entries(value)
          .filter(([key]) => key !== 'excluded')
          .map(([threshold, item]) => [Number(threshold), item] as const)
          .sort(([a], [b]) => a - b);
        const itemValue = (item: T | RateThresholdValue<T>): T | undefined => {
          if (item && typeof item === 'object' && 'value' in item) {
            const thresholdValue = item as RateThresholdValue<T>;
            return thresholdValue.excluded ? undefined : thresholdValue.value;
          }
          return item as T;
        };
        const matched = entries.find(([threshold, item]) => score <= threshold && itemValue(item) !== undefined);
        if (matched) return itemValue(matched[1]) ?? fallback;
        for (const [, item] of entries) {
          const resolved = itemValue(item);
          if (resolved !== undefined) return resolved;
        }
        return fallback;
      }
      return value ?? fallback;
    };
    const activeColor = '#f7ba2a';
    const getColor = (selected: boolean) => selected
      ? resolveThreshold(props.colors, activeValue.value, activeColor)
      : props.disabled ? props.disabledVoidColor : props.voidColor;
    const getIcon = (selected: boolean, half: boolean) => {
      if (!selected && !half) return props.disabled ? props.disabledVoidIcon : props.voidIcon;
      return resolveThreshold(props.icons, activeValue.value, 'icon-collection_fill');
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      commitValue(currentValue.value + direction * (props.allowHalf ? 0.5 : 1));
    };

    return () => (
      <div
        {...attrs}
        id={props.id}
        class={[bem(), `i-rate--${props.size === 'default' ? 'default' : props.size}`, props.disabled && bem('', { disabled: true })]}
        role='slider'
        aria-label={props.ariaLabel || props.label || 'rating'}
        title={props.label}
        data-role='rate-slider'
        aria-valuetext={(props.showText || props.showScore) && displayText.value ? displayText.value : undefined}
        aria-valuenow={currentValue.value}
        aria-valuemin='0'
        aria-valuemax={Math.max(0, Number(props.max) || 0)}
        aria-disabled={props.disabled ? 'true' : undefined}
        {...(!props.disabled ? { tabindex: 0 } : {})}
        onKeydown={handleKeydown}>
        {Array.from({ length: Math.max(0, Math.ceil(props.max)) }, (_, index) => {
          const itemValue = index + 1;
          const selected = activeValue.value === itemValue;
          const partial = (props.allowHalf || props.disabled) && activeValue.value > itemValue - 1 && activeValue.value < itemValue;
          const partialPercent = Math.round((activeValue.value - (itemValue - 1)) * 100);
          const half = props.allowHalf && activeValue.value === itemValue - 0.5;
          const filled = activeValue.value >= itemValue;
          return (
            <span
              class={bem('item')}
              aria-disabled={props.disabled ? 'true' : undefined}
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
              onKeydown={() => undefined}>
              <Icon class={bem('icon', { half: half || partial, partial: partial && !half })} icon={getIcon(filled || selected, half || partial)} color={getColor(filled || selected || half || partial)} size={props.size} aria-hidden='true' style={{ '--i-rate-fill-percent': `${partialPercent}%`, '--i-rate-active-color': getColor(true), '--i-rate-fill-color': props.colors ? getColor(true) : undefined, '--i-rate-void-color': props.disabled ? (props.disabledVoidColor || 'var(--el-rate-disabled-void-color, #c0c4cc)') : props.voidColor, '--i-rate-disabled-void-color': props.disabledVoidColor || 'var(--el-rate-disabled-void-color, #c0c4cc)', '--i-rate-text-color': props.textColor } as Record<string, string | undefined>} />
            </span>
          );
        })}
        {props.showScore && <span class={bem('score')} style={{ color: props.textColor }}>{displayText.value}</span>}
        {!props.showScore && props.showText && <span class={bem('text')} style={{ color: props.textColor }}>{activeValue.value > 0 ? props.texts[Math.max(0, Math.ceil(activeValue.value) - 1)] : ''}</span>}
      </div>
    );
  }
});

export type { RateProps } from './types';
