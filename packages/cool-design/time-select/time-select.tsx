import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, type PropType } from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';

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
    modelValue: String,
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
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change'],
  setup(props, { emit, expose }) {
    const field = useField();
    const config = useConfig();
    const root = ref<HTMLElement>();
    const open = ref(false);
    const isDisabled = () => props.disabled || !!field?.disabled?.();

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
      emit('update:modelValue', '');
      emit('change', '');
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      emit('clear');
    };
    const onOutside = (event: MouseEvent) => {
      if (open.value && root.value && !root.value.contains(event.target as Node)) setOpen(false);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      else if (event.key === 'Enter' || event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
    };
    // 在挂载后绑定，避免 SSR 环境访问 document
    onMounted(() => document.addEventListener('mousedown', onOutside));
    onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));

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
          <span class={props.modelValue ? 'i-time-select__value' : 'i-time-select__placeholder'}>
            {props.modelValue || props.placeholder}
          </span>
        </button>
        {props.clearable && props.modelValue && !isDisabled() && (
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
        <input type='hidden' name={props.name} value={props.modelValue ?? ''} />
        {open.value && (
          <div class='i-time-select__dropdown' role='listbox'>
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
        )}
      </span>
    );
  }
});
