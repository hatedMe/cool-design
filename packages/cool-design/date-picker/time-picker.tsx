import { Teleport, computed, defineComponent, h, markRaw, nextTick, onBeforeUnmount, onMounted, ref, toRaw, type Component, type ComponentPublicInstance, type PropType } from 'vue';
import { useConfig, type Size } from '../config-provider/context';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';
import { emitValue, formatTimeParts, parseTimeParts, timeInputValue, type DateValue, type TimeParts } from './date';
import TimePickerPanel, { type TimeDisabledRule, type TimeUnit } from './time-picker-panel';

export default defineComponent({
  name: 'i-time-picker',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    format: { type: String, default: 'HH:mm:ss' },
    valueFormat: String,
    placeholder: String,
    startPlaceholder: String,
    endPlaceholder: String,
    rangeSeparator: { type: String, default: '-' },
    disabled: Boolean,
    readonly: Boolean,
    clearable: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
    isRange: Boolean,
    size: String as PropType<Size>,
    disabledHours: Function as PropType<TimeDisabledRule>,
    disabledMinutes: Function as PropType<TimeDisabledRule>,
    disabledSeconds: Function as PropType<TimeDisabledRule>,
    arrowControl: Boolean,
    showConfirm: { type: Boolean, default: false },
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    saveOnBlur: { type: Boolean, default: true },
    emptyValues: Array as PropType<DateValue[]>,
    name: String,
    tabindex: [String, Number],
    ariaLabel: String,
    prefixIcon: [String, Object],
    clearIcon: [String, Object],
    popperStyle: [String, Object, Array],
    popperOptions: Object as PropType<FloatingOptions>,
    valueOnClear: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    teleported: { type: Boolean, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    fallbackPlacements: Array as PropType<Placement[]>
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change'],
  setup(props, { attrs, emit, expose }) {
    const config = useConfig();
    const root = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    const inputRefs = ref<Array<HTMLInputElement | undefined>>([]);
    const open = ref(false);
    const activeIndex = ref(0);
    const draft = ref<TimeParts>({ hour: 0, minute: 0, second: 0 });
    const rangeDraft = ref<Array<DateValue | null>>([null, null]);
    const draftValue = ref<DateValue | Array<DateValue | null> | null>(null);
    const lastInputValues: Array<string | undefined> = [];
    const pendingInputs: Array<string | undefined> = [];
    const range = computed(() => props.isRange || Array.isArray(props.modelValue));
    const values = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]));
    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      options: () => props.popperOptions,
      close: () => close(),
      closeOnOutside: () => true
    });
    const disabledFor = (unit: TimeUnit, value: number, context = draft.value) => {
      if (unit === 'hour') return props.disabledHours?.()?.includes(value) || false;
      if (unit === 'minute') return props.disabledMinutes?.(context.hour)?.includes(value) || false;
      return props.disabledSeconds?.(context.hour, context.minute)?.includes(value) || false;
    };
    const parseAt = (index: number) => parseTimeParts(values.value[index]) || { hour: 0, minute: 0, second: 0 };
    const setOpen = (value: boolean) => {
      if (props.disabled || props.readonly || open.value === value) return;
      open.value = value;
      emit('visible-change', value);
      if (value) {
        rangeDraft.value = [values.value[0] ?? null, values.value[1] ?? null];
        draft.value = parseAt(range.value ? activeIndex.value : 0);
        if (!values.value[activeIndex.value] && props.defaultValue) draft.value = parseTimeParts(Array.isArray(props.defaultValue) ? props.defaultValue[activeIndex.value] : props.defaultValue) || draft.value;
        nextTick(() => position.update());
      }
    };
    const close = () => setOpen(false);
    const confirm = () => {
      if (draftValue.value !== null) {
        const value = draftValue.value;
        draftValue.value = null;
        emit('update:modelValue', value);
        emit('change', value);
      }
      close();
    };
    const cancel = () => { draftValue.value = null; close(); };
    const displayValue = (value: DateValue | null | undefined) => timeInputValue(value, props.format);
    const renderIcon = (icon: string | Component | undefined, className: string) => typeof icon === 'string' ? <i class={[className, icon]} aria-hidden='true' /> : icon ? h(markRaw(toRaw(icon))) : null;
    const commit = (parts: TimeParts, index = 0) => {
      if (disabledFor('hour', parts.hour) || disabledFor('minute', parts.minute) || disabledFor('second', parts.second)) return;
      const next = emitValue(`1970-01-01T${formatTimeParts(parts, 'HH:mm:ss')}`, props.valueFormat, true);
      if (props.showConfirm) {
        if (range.value) {
          const nextRange = [...rangeDraft.value];
          nextRange[index] = next;
          rangeDraft.value = nextRange;
          draftValue.value = nextRange;
          if (index === 0) {
            activeIndex.value = 1;
            draft.value = parseAt(1);
          }
        } else draftValue.value = next;
        return;
      }
      if (!range.value) {
        emit('update:modelValue', next);
        emit('change', next);
        return;
      }
      const nextValues = rangeDraft.value.map((item) => {
        const itemParts = parseTimeParts(item);
        return itemParts ? emitValue(`1970-01-01T${formatTimeParts(itemParts, 'HH:mm:ss')}`, props.valueFormat, true) : null;
      });
      nextValues[index] = next;
      rangeDraft.value = nextValues;
      if (index === 0) {
        activeIndex.value = 1;
        draft.value = parseAt(1);
      } else {
        if (parseTimeParts(nextValues[0]) && parseTimeParts(nextValues[0])!.hour * 3600 + parseTimeParts(nextValues[0])!.minute * 60 + parseTimeParts(nextValues[0])!.second > parts.hour * 3600 + parts.minute * 60 + parts.second) return;
        emit('update:modelValue', nextValues);
        emit('change', nextValues);
        close();
      }
    };
    const choose = (unit: TimeUnit, value: number) => {
      if (disabledFor(unit, value)) return;
      const next = { ...draft.value, [unit]: value };
      draft.value = next;
      const complete = unit === 'minute' && !props.format.includes('ss') || unit === 'second';
      if (complete) commit(next, range.value ? activeIndex.value : 0);
    };
    const updateInput = (index: number | undefined, value: string) => {
      if (!value) {
        pendingInputs[index ?? 0] = '';
        return;
      }
      if (value === pendingInputs[index ?? 0]) return;
      pendingInputs[index ?? 0] = value;
    };
    const commitInput = (index: number | undefined) => {
      const value = pendingInputs[index ?? 0];
      if (!value || props.emptyValues?.some((emptyValue) => String(emptyValue) === value)) {
        clear(index);
        return;
      }
      if (value === lastInputValues[index ?? 0]) return;
      const parts = parseTimeParts(value);
      if (!parts || disabledFor('hour', parts.hour, parts) || disabledFor('minute', parts.minute, parts) || disabledFor('second', parts.second, parts)) return;
      lastInputValues[index ?? 0] = value;
      const next = emitValue(`1970-01-01T${formatTimeParts(parts, 'HH:mm:ss')}`, props.valueFormat, true);
      if (index == null) {
        emit('update:modelValue', next);
        emit('change', next);
      } else {
        const nextValues = [...rangeDraft.value];
        nextValues[index] = next;
        rangeDraft.value = nextValues;
        emit('update:modelValue', nextValues);
        emit('change', nextValues);
      }
    };
    const renderInput = (value: DateValue | null | undefined, index?: number) => (
      <input
        {...attrs}
        ref={(element: Element | ComponentPublicInstance | null) => { inputRefs.value[index ?? 0] = element as HTMLInputElement | undefined; }}
        role='combobox'
        aria-haspopup='dialog'
        aria-expanded={open.value}
        aria-disabled={props.disabled || undefined}
        aria-label={props.ariaLabel}
        name={props.name}
        tabindex={props.tabindex}
        class='i-time-picker__input'
        type='text'
        value={displayValue(value)}
        placeholder={index === 0 ? props.startPlaceholder || props.placeholder : props.endPlaceholder || props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly || !props.editable}
        onClick={() => {
          if (index != null) activeIndex.value = index;
          setOpen(true);
        }}
        onInput={(event: Event) => updateInput(index, (event.target as HTMLInputElement).value)}
        onChange={() => commitInput(index)}
        onFocus={(event: FocusEvent) => emit('focus', event)}
        onBlur={(event: FocusEvent) => { if (!props.showConfirm) commitInput(index); if (props.showConfirm && props.saveOnBlur) confirm(); emit('blur', event); }}
        onKeydown={(event: KeyboardEvent) => {
          if (event.key === 'Escape') close();
          if (event.key === 'Enter') setOpen(!open.value);
        }}
      />
    );
    const clear = (index?: number) => {
      if (props.disabled || props.readonly) return;
      lastInputValues.length = 0;
      pendingInputs.length = 0;
      const currentRange = rangeDraft.value.some(Boolean) ? rangeDraft.value : values.value;
      const next = props.valueOnClear !== null ? props.valueOnClear : range.value ? index == null ? [null, null] : currentRange.map((item, itemIndex) => itemIndex === index ? null : item) : null;
      rangeDraft.value = range.value && Array.isArray(next) ? next : [null, null];
      emit('update:modelValue', next);
      emit('change', next);
      emit('clear');
    };
    const onOutside = (event: MouseEvent) => {
      if (root.value && !root.value.contains(event.target as Node) && !floating.value?.contains(event.target as Node)) close();
    };
    onMounted(() => document.addEventListener('mousedown', onOutside));
    onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
    expose({ focus: () => inputRefs.value[activeIndex.value]?.focus(), blur: () => inputRefs.value[activeIndex.value]?.blur(), handleOpen: () => setOpen(true), handleClose: close });
    return () => {
      const panel = open.value ? (
        <div ref={floating} class={['i-time-picker__dropdown', props.popperClass]} style={[position.style.value, props.popperStyle as Record<string, string>]}>
          {props.arrowControl && <div class='i-time-picker__arrows'>
            {(['hour', 'minute', 'second'] as TimeUnit[]).filter((unit) => props.format.includes(unit === 'hour' ? 'HH' : unit === 'minute' ? 'mm' : 'ss')).map((unit) => <><button type='button' aria-label={`增加${unit === 'hour' ? '小时' : unit === 'minute' ? '分钟' : '秒'}`} onClick={() => choose(unit, Math.min(unit === 'hour' ? 23 : 59, draft.value[unit] + 1))}>↑</button><button type='button' aria-label={`减少${unit === 'hour' ? '小时' : unit === 'minute' ? '分钟' : '秒'}`} onClick={() => choose(unit, Math.max(0, draft.value[unit] - 1))}>↓</button></>)}
          </div>}
          <TimePickerPanel value={draft.value} format={props.format} disabledHours={props.disabledHours} disabledMinutes={props.disabledMinutes} disabledSeconds={props.disabledSeconds} onSelect={choose} />
          {props.showConfirm && <div class='i-time-picker__footer'><button type='button' aria-label='确认' onClick={confirm}>确认</button><button type='button' aria-label='取消' onClick={cancel}>取消</button></div>}
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      const value = props.modelValue;
      return (
        <span ref={root} class={['i-time-picker', `i-control--${props.size || config.value.size}`, range.value && 'is-range']}>
          {range.value ? <><div ref={reference}>{props.prefixIcon && <span class='i-time-picker__prefix-icon'>{renderIcon(props.prefixIcon as string | Component, 'i-time-picker__icon')}</span>}{renderInput(Array.isArray(value) ? value[0] : null, 0)}</div><span class='i-time-picker__separator'>{props.rangeSeparator}</span><div>{renderInput(Array.isArray(value) ? value[1] : null, 1)}</div></> : <div ref={reference}>{props.prefixIcon && <span class='i-time-picker__prefix-icon'>{renderIcon(props.prefixIcon as string | Component, 'i-time-picker__icon')}</span>}{renderInput(value as DateValue | null)}</div>}
          {props.clearable && (range.value ? Array.isArray(value) && value.some(Boolean) : value) && <button type='button' class='i-time-picker__clear' disabled={props.disabled || props.readonly} aria-label='清空' onClick={() => clear()}>{props.clearIcon ? <span class='i-time-picker__clear-icon'>{renderIcon(props.clearIcon as string | Component, 'i-time-picker__icon')}</span> : '×'}</button>}
          {content}
        </span>
      );
    };
  }
});
