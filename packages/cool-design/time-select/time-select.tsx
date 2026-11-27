import { computed, defineComponent, inject, nextTick, ref, watch, type CSSProperties, type PropType } from 'vue';
import { Teleport } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import 'dayjs/locale/zh-cn.js';
import { useId } from '../../hooks/use-id';
import Icon from '../icon';
import type { Component } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { fieldDescription, formKey, useFieldControl } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useNamespace } from '../../hooks/use-namespace';
import { useFloating, useFloatingTheme, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';

dayjs.extend(utc);

const parseTime = (time: string): number | undefined => {
  const matched = (time ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!matched || Number(matched[2]) > 59) return undefined;
  return Number(matched[1]) * 60 + Number(matched[2]);
};
const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(Math.floor(minutes % 60)).padStart(2, '0')}`;

export default defineComponent({
  name: 'i-time-select',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean | null>, default: undefined },
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function] as PropType<string | number | boolean | null | (() => unknown)>, default: undefined },
    start: { type: String, default: '09:00' },
    step: { type: String, default: '00:30' },
    end: { type: String, default: '18:00' },
    editable: { type: Boolean, default: true },
    format: { type: String, default: 'HH:mm' },
    includeEndTime: Boolean,
    prefixIcon: { type: [String, Object, Function] as PropType<string | Component>, default: 'icon-clock' },
    clearIcon: { type: [String, Object, Function] as PropType<string | Component>, default: 'icon-close' },
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
  setup(props, { attrs, emit, expose }) {
    const field = useFieldControl((fallback) => (attrs.id as string) || fallback);
    const form = inject(formKey, undefined);
    const config = useConfig();
    const ns = useNamespace('time-select');
    const controlNs = useNamespace('control');
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const hasValue = computed(() => !isEmptyValue(props.modelValue));
    const root = ref<HTMLElement>();
    const dropdown = ref<HTMLElement>();
    const open = ref(false);
    const control = ref<HTMLInputElement>();
    const baseId = useId();
    const query = ref<string>();
    const highlightedIndex = ref(-1);
    const shownOnce = ref(false);
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      close: () => setOpen(false)
    });
    const panelTheme = useFloatingTheme(position.target, () => props.teleported);

    const options = computed(() => {
      const start = parseTime(props.start) ?? 540;
      const step = parseTime(props.step) || 30;
      const end = parseTime(props.end) ?? 1080;
      const min = parseTime(props.minTime);
      const max = parseTime(props.maxTime);
      const date = dayjs.utc(dayjs().format('YYYY-MM-DD')).locale(config.value.locale?.name ?? 'zh-cn');
      const makeOption = (time: number) => ({
        time,
        value: props.format === 'HH:mm'
          ? formatTime(time)
          : date.add(time, 'minute').format(props.format),
        disabled: (min !== undefined && time <= min) || (max !== undefined && time >= max)
      });
      const result: ReturnType<typeof makeOption>[] = [];
      for (let time = start; time <= end; time += step) result.push(makeOption(time));
      if (props.includeEndTime && result[result.length - 1]?.time !== end) result.push(makeOption(end));
      return result;
    });
    const visibleOptions = computed(() => options.value.filter((option) =>
      option.value.toLowerCase().includes((query.value ?? '').toLowerCase())));
    watch([open, visibleOptions, () => props.editable], ([opened, options, editable]) => {
      highlightedIndex.value = opened && editable ? options.findIndex((item) => !item.disabled) : -1;
    });
    const activeOption = computed(() => visibleOptions.value[highlightedIndex.value]);

    const setOpen = (value: boolean) => {
      if (open.value === value || (value && isDisabled())) return;
      open.value = value;
      highlightedIndex.value = -1;
      if (value) shownOnce.value = true;
      else query.value = undefined;
      emit('visible-change', value);
    };
    watch(isDisabled, (disabled) => { if (disabled) setOpen(false); });
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
      if (isDisabled() || event.isComposing) return;
      if (event.key === 'Escape' || event.key === 'Tab') {
        setOpen(false);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (!open.value) setOpen(true);
        else {
          const option = activeOption.value;
          if (option) choose(option.value, option.disabled);
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const length = visibleOptions.value.length;
        let index = highlightedIndex.value < 0 ? (step > 0 ? 0 : length - 1) : highlightedIndex.value + step;
        for (let seen = 0; seen < length; seen++, index += step) {
          const wrapped = (index + length) % length;
          if (!visibleOptions.value[wrapped].disabled) {
            highlightedIndex.value = wrapped;
            nextTick(() => dropdown.value?.querySelector('.is-highlighted')?.scrollIntoView?.({ block: 'nearest' }));
            break;
          }
        }
      }
    };

    expose({ focus: () => control.value?.focus(), blur: () => control.value?.blur() });

    const getInputId = () => (attrs.id as string) || field?.id || `${baseId.value}-input`;
    const getListId = () => getInputId() === baseId.value ? `${baseId.value}-listbox` : baseId.value;
    const getOptionId = (time: number) => {
      const id = `${getListId()}-${time}`;
      return id === getInputId() ? `${id}-option` : id;
    };

    return () => (
      <span
        {...attrs}
        id={undefined}
        aria-label={undefined}
        aria-labelledby={undefined}
        aria-describedby={undefined}
        ref={root}
        class={[
          ns.b(),
          controlNs.m(props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size),
          { 'is-open': open.value, 'is-disabled': isDisabled() }
        ]}>
        {props.prefixIcon && <Icon class={ns.e('prefix')} icon={props.prefixIcon} aria-hidden='true' />}
        <input
          ref={control}
          type='text'
          class={ns.e('control')}
          role='combobox'
          aria-label={attrs['aria-label'] as string}
          aria-labelledby={attrs['aria-labelledby'] as string}
          disabled={isDisabled()}
          readonly={!props.editable}
          aria-describedby={fieldDescription(field, attrs['aria-describedby'])}
          id={getInputId()}
          value={query.value ?? (hasValue.value ? String(props.modelValue) : '')}
          placeholder={props.placeholder}
          aria-haspopup='listbox'
          aria-expanded={open.value}
          aria-controls={open.value ? getListId() : undefined}
          aria-activedescendant={open.value && activeOption.value ? getOptionId(activeOption.value.time) : undefined}
          aria-invalid={field?.invalid() ? 'true' : undefined}
          onClick={() => setOpen(props.editable || !open.value)}
          onInput={(event: Event) => {
            if (!props.editable || isDisabled()) return;
            setOpen(true);
            query.value = (event.target as HTMLInputElement).value;
            highlightedIndex.value = -1;
          }}
          onFocus={(event: FocusEvent) => emit('focus', event)}
          onBlur={(event: FocusEvent) => {
            setOpen(false);
            emit('blur', event);
            if (props.validateEvent) nextTick(() => field?.validate('blur'));
          }}
          onKeydown={onKeydown}
        />
        {props.clearable && hasValue.value && !isDisabled() && (
          <button
            type='button'
            class={ns.e('clear')}
            aria-label='清空'
            onMousedown={(event: MouseEvent) => event.preventDefault()}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              clear();
            }}>
            <Icon icon={props.clearIcon} aria-hidden='true' />
          </button>
        )}
        <input type='hidden' name={props.name} disabled={isDisabled()} value={hasValue.value ? String(props.modelValue) : ''} />
        {(() => {
          const kept = props.persistent && shownOnce.value && !open.value;
          if (!open.value && !kept) return null;
          const panel = (
            <div
              ref={dropdown}
              class={[ns.e('dropdown'), ns.em('dropdown', props.effect), panelTheme.value.scopeClass, props.popperClass]}
              id={getListId()}
              role='listbox'
              aria-hidden={kept ? 'true' : undefined}
              data-theme={panelTheme.value.theme}
              data-placement={position.placement.value}
              style={[panelTheme.value.style ?? {}, position.style.value, props.popperStyle ?? {}, kept ? { display: 'none' } : {}]}>
              {visibleOptions.value.map((option, index) => (
                <div
                  key={option.time}
                  id={getOptionId(option.time)}
                  role='option'
                  aria-selected={option.value === props.modelValue}
                  aria-disabled={option.disabled || undefined}
                  class={[
                    ns.e('option'),
                    { 'is-selected': option.value === props.modelValue, 'is-disabled': option.disabled, 'is-highlighted': index === highlightedIndex.value }
                  ]}
                  onMousedown={(event: MouseEvent) => event.preventDefault()}
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
