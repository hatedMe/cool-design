import { computed, defineComponent, nextTick, ref, type CSSProperties, type PropType } from 'vue';
import { Teleport } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';

const parseTime = (time: string | undefined): number => {
  const matched = (time ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!matched) return 0;
  return Number(matched[1]) * 60 + Number(matched[2]);
};
const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(Math.floor(minutes % 60)).padStart(2, '0')}`;

export default defineComponent({
  name: 'i-time-select',
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean | null>, default: undefined },
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function] as PropType<string | number | boolean | null | (() => unknown)>, default: undefined },
    start: { type: String, default: '09:00' },
    step: { type: String, default: '00:30' },
    end: { type: String, default: '18:00' },
    minTime: { type: String, default: '' },
    maxTime: { type: String, default: '' },
    placeholder: { type: String, default: '请选择' },
    disabled: Boolean,
    clearable: { type: Boolean, default: true },
    size: String as PropType<Size>,
    name: String,
    validateEvent: { type: Boolean, default: true },
    teleported: { type: Boolean, default: true },
    persistent: Boolean,
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['top-start', 'bottom', 'top'] },
    popperOptions: { type: Object as PropType<FloatingOptions>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change'],
  setup(props, { emit, expose }) {
    const field = useField();
    const config = useConfig();
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const hasValue = computed(() => !isEmptyValue(props.modelValue));
    const root = ref<HTMLElement>();
    const dropdown = ref<HTMLElement>();
    const open = ref(false);
    const shownOnce = ref(false);
    const isDisabled = () => props.disabled || !!field?.disabled?.();
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      close: () => setOpen(false)
    });

    const options = computed(() => {
      const start = parseTime(props.start);
      const step = parseTime(props.step) || 30;
      const end = parseTime(props.end);
      const result: Array<{ value: string; disabled: boolean }> = [];
      const min = props.minTime ? parseTime(props.minTime) : undefined;
      const max = props.maxTime ? parseTime(props.maxTime) : undefined;
      for (let time = start; time <= end && result.length < 1000; time += step) {
        result.push({
          value: formatTime(time),
          disabled: (min !== undefined && time < min) || (max !== undefined && time > max)
        });
      }
      return result;
    });

    const setOpen = (value: boolean) => {
      if (isDisabled() || open.value === value) return;
      open.value = value;
      if (value) shownOnce.value = true;
      emit('visible-change', value);
    };
    const choose = (value: string, disabled: boolean) => {
      if (disabled || isDisabled()) return;
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      setOpen(false);
    };
    const clear = () => {
      if (isDisabled()) return;
      const value = getValueOnClear();
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      emit('clear');
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      else if (event.key === 'Enter' || event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
    };

    expose({
      focus: () => root.value?.querySelector<HTMLElement>('.i-time-select__control')?.focus(),
      blur: () => root.value?.querySelector<HTMLElement>('.i-time-select__control')?.blur()
    });

    return () => (
      <span
        ref={root}
        class={[
          'i-time-select',
          `i-control--${props.size ?? field?.size?.() ?? config.value.size}`,
          { 'is-open': open.value, 'is-disabled': isDisabled() }
        ]}>
        <button
          type='button'
          class='i-time-select__control'
          disabled={isDisabled()}
          id={field?.id}
          aria-haspopup='listbox'
          aria-expanded={open.value}
          aria-invalid={field?.invalid() ? 'true' : undefined}
          onClick={() => setOpen(!open.value)}
          onFocus={(event: FocusEvent) => emit('focus', event)}
          onBlur={(event: FocusEvent) => {
            emit('blur', event);
            if (props.validateEvent) nextTick(() => field?.validate('blur'));
          }}
          onKeydown={onKeydown}>
          <span class={hasValue.value ? 'i-time-select__value' : 'i-time-select__placeholder'}>
            {hasValue.value ? String(props.modelValue) : props.placeholder}
          </span>
        </button>
        {props.clearable && hasValue.value && !isDisabled() && (
          <button
            type='button'
            class='i-time-select__clear'
            aria-label='清空'
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              clear();
            }}>
            ×
          </button>
        )}
        <input type='hidden' name={props.name} value={hasValue.value ? String(props.modelValue) : ''} />
        {(() => {
          const kept = props.persistent && shownOnce.value && !open.value;
          if (!open.value && !kept) return null;
          const panel = (
            <div
              ref={dropdown}
              class={['i-time-select__dropdown', `i-time-select__dropdown--${props.effect}`, props.popperClass]}
              role='listbox'
              aria-hidden={kept ? 'true' : undefined}
              data-placement={position.placement.value}
              style={[position.style.value, props.popperStyle, kept ? { display: 'none' } : undefined]}>
              {options.value.map((option) => (
                <div
                  key={option.value}
                  role='option'
                  aria-selected={option.value === props.modelValue}
                  aria-disabled={option.disabled || undefined}
                  class={[
                    'i-time-select__option',
                    { 'is-selected': option.value === props.modelValue, 'is-disabled': option.disabled }
                  ]}
                  onClick={() => choose(option.value, option.disabled)}>
                  {option.value}
                </div>
              ))}
            </div>
          );
          return props.teleported ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
        })()}
      </span>
    );
  }
});
