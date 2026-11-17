import { computed, defineComponent, ref, type PropType } from 'vue';

export interface SegmentedOption {
  label?: string;
  value: string | number;
  disabled?: boolean;
}
export type SegmentedValue = string | number;
export type SegmentedRawOption = string | number | SegmentedOption;

export default defineComponent({
  name: 'i-segmented',
  props: {
    options: { type: Array as PropType<SegmentedRawOption[]>, default: () => [] },
    modelValue: [String, Number] as PropType<SegmentedValue>,
    disabled: Boolean,
    size: String as PropType<'large' | 'default' | 'small'>
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const focusedValue = ref<SegmentedValue>();
    const normalized = computed<SegmentedOption[]>(() =>
      props.options.map((option) =>
        typeof option === 'object' && option !== null
          ? option
          : { value: option, label: String(option) }
      )
    );
    const select = (option: SegmentedOption) => {
      if (props.disabled || option.disabled || option.value === props.modelValue) return;
      emit('update:modelValue', option.value);
      emit('change', option.value);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      const items = normalized.value;
      if (!items.length) return;
      const current = items.findIndex((item) => item.value === (focusedValue.value ?? props.modelValue));
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        for (let step = 1; step <= items.length; step++) {
          const candidate = items[(current + step + items.length) % items.length];
          if (!candidate.disabled) {
            focusedValue.value = candidate.value;
            select(candidate);
            break;
          }
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        for (let step = 1; step <= items.length; step++) {
          const candidate = items[(current - step + items.length * 2) % items.length];
          if (!candidate.disabled) {
            focusedValue.value = candidate.value;
            select(candidate);
            break;
          }
        }
      }
    };
    return () => (
      <div
        class={['i-segmented', props.size && `i-segmented--${props.size}`, props.disabled && 'is-disabled']}
        role='radiogroup'
        aria-disabled={props.disabled || undefined}
        onKeydown={onKeydown}>
        {normalized.value.map((option) => {
          const selected = option.value === props.modelValue;
          return (
            <button
              key={String(option.value)}
              type='button'
              role='radio'
              aria-checked={selected}
              tabindex={selected || (props.modelValue === undefined && focusedValue.value === option.value) ? 0 : -1}
              class={['i-segmented__item', { 'is-selected': selected, 'is-disabled': option.disabled }]}
              disabled={props.disabled || option.disabled}
              onClick={() => {
                focusedValue.value = option.value;
                select(option);
              }}>
              {option.label ?? String(option.value)}
            </button>
          );
        })}
      </div>
    );
  }
});
