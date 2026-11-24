import { Teleport, computed, defineComponent, h, inject, markRaw, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch, type Component, type ComponentPublicInstance, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { useId } from '../../hooks/use-id';
import { createBEM } from '../../../src/utils/create';
import { useConfig, type Size } from '../config-provider/context';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { fieldDescription, formKey, useFieldControl } from '../form/context';
import { useFloating, useFloatingTheme, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';
import { emitValue, formatTimeParts, getPickerIds, parseTimeParts, timeInputValue, type DateModelValue, type DateValue, type TimeParts } from './date';
import TimePickerPanel, { type TimeDisabledRule, type TimeUnit } from './time-picker-panel';

export default defineComponent({
  name: 'i-time-picker',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean, Date, Array] as PropType<DateModelValue | boolean>, default: null },
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
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateModelValue>, default: null },
    saveOnBlur: { type: Boolean, default: true },
    emptyValues: Array as PropType<unknown[]>,
    id: [String, Array] as PropType<string | string[]>,
    name: String,
    tabindex: [String, Number],
    ariaLabel: String,
    prefixIcon: [String, Object],
    clearIcon: [String, Object],
    popperStyle: [String, Object, Array],
    popperOptions: Object as PropType<FloatingOptions>,
    valueOnClear: { type: [String, Number, Boolean, Date, Array, Function] as PropType<DateModelValue | boolean | (() => unknown)>, default: undefined },
    teleported: { type: Boolean, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    fallbackPlacements: Array as PropType<Placement[]>,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change'],
  setup(props, { attrs, emit, expose }) {
    const ns = useNamespace('time-picker');
    const bem = createBEM(ns.b);
    const controlNs = useNamespace('control');
    const config = useConfig();
    const field = useFieldControl(() => range.value ? undefined : inputRefs.value[0]?.id);
    const form = inject(formKey, undefined);
    const disabledOf = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
    const validate = (trigger: 'blur' | 'change') => {
      if (props.validateEvent) nextTick(() => field?.validate(trigger));
    };
    const root = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    const inputRefs = ref<Array<HTMLInputElement | undefined>>([]);
    const open = ref(false);
    const baseId = useId();
    const activeIndex = ref(0);
    const draft = ref<TimeParts>({ hour: 0, minute: 0, second: 0 });
    const rangeDraft = ref<Array<DateValue | null>>([null, null]);
    const draftValue = ref<DateValue | Array<DateValue | null> | null>(null);
    const lastInputValues: Array<string | undefined> = [];
    const pendingInputs: Array<string | undefined> = [];
    const { emptyValues, getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const model = computed<DateModelValue>(() => {
      const value = props.modelValue;
      return typeof value === 'boolean' || isEmptyValue(value) ? null : value;
    });
    const range = computed(() => props.isRange || Array.isArray(model.value));
    const values = computed(() => (Array.isArray(model.value) ? model.value : [model.value]));
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
    const panelTheme = useFloatingTheme(position.target, () => props.teleported);
    const disabledFor = (unit: TimeUnit, value: number, context = draft.value) => {
      if (unit === 'hour') return props.disabledHours?.()?.includes(value) || false;
      if (unit === 'minute') return props.disabledMinutes?.(context.hour)?.includes(value) || false;
      return props.disabledSeconds?.(context.hour, context.minute)?.includes(value) || false;
    };
    const parseAt = (index: number) => parseTimeParts(values.value[index]) || { hour: 0, minute: 0, second: 0 };
    const setOpen = (value: boolean) => {
      if (open.value === value || (value && (disabledOf() || props.readonly))) return;
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
      if (disabledOf() || props.readonly) return;
      if (draftValue.value !== null) {
        const value = draftValue.value;
        draftValue.value = null;
        emit('update:modelValue', value);
        emit('change', value); validate('change');
      }
      close();
    };
    const cancel = () => { draftValue.value = null; close(); };
    watch(disabledOf, (disabled) => {
      if (!disabled) return;
      pendingInputs.length = 0;
      cancel();
    });
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
        emit('change', next); validate('change');
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
        emit('change', nextValues); validate('change');
        close();
      }
    };
    const choose = (unit: TimeUnit, value: number) => {
      if (disabledOf() || props.readonly) return;
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
      if (disabledOf() || props.readonly) return;
      const value = pendingInputs[index ?? 0];
      if (value === undefined) return;
      if (value === '' || emptyValues.value.some((empty) => String(empty) === value)) {
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
        emit('change', next); validate('change');
      } else {
        const nextValues = [...rangeDraft.value];
        nextValues[index] = next;
        rangeDraft.value = nextValues;
        emit('update:modelValue', nextValues);
        emit('change', nextValues); validate('change');
      }
    };
    const renderInput = (ids: ReturnType<typeof getPickerIds>, value: DateValue | null | undefined, index?: number) => (
      <input
        {...attrs}
        ref={(element: Element | ComponentPublicInstance | null) => { inputRefs.value[index ?? 0] = element as HTMLInputElement | undefined; }}
        id={index === 1 ? ids.endId : ids.inputId}
        role='combobox'
        aria-haspopup='dialog'
        aria-expanded={open.value}
        aria-controls={open.value ? ids.panelId : undefined}
        aria-disabled={disabledOf() || undefined}
        aria-describedby={fieldDescription(field, attrs['aria-describedby'])}
        aria-label={props.ariaLabel}
        name={props.name}
        tabindex={props.tabindex}
        class={bem('input')}
        type='text'
        value={displayValue(value)}
        placeholder={index === 0 ? props.startPlaceholder || props.placeholder : props.endPlaceholder || props.placeholder}
        disabled={disabledOf()}
        readonly={props.readonly || !props.editable}
        onClick={() => {
          if (index != null) activeIndex.value = index;
          setOpen(true);
        }}
        onInput={(event: Event) => updateInput(index, (event.target as HTMLInputElement).value)}
        onChange={() => commitInput(index)}
        onFocus={(event: FocusEvent) => emit('focus', event)}
        onBlur={(event: FocusEvent) => { if (!props.showConfirm) commitInput(index); if (props.showConfirm && props.saveOnBlur) confirm(); emit('blur', event); validate('blur'); }}
        onKeydown={(event: KeyboardEvent) => {
          if (event.key === 'Escape') close();
          if (event.key === 'Enter') setOpen(!open.value);
        }}
      />
    );
    const clear = (index?: number) => {
      if (disabledOf() || props.readonly) return;
      lastInputValues.length = 0;
      pendingInputs.length = 0;
      const currentRange = rangeDraft.value.some((item) => item != null) ? rangeDraft.value : values.value;
      const fallback = range.value && index != null
        ? currentRange.map((item, itemIndex) => itemIndex === index ? null : item)
        : null;
      const next = getValueOnClear(fallback);
      rangeDraft.value = range.value && Array.isArray(next) ? next as Array<DateValue | null> : [null, null];
      emit('update:modelValue', next);
      emit('change', next); validate('change');
      emit('clear');
    };
    const onOutside = (event: MouseEvent) => {
      if (root.value && !root.value.contains(event.target as Node) && !floating.value?.contains(event.target as Node)) close();
    };
    onMounted(() => document.addEventListener('mousedown', onOutside));
    onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
    expose({ focus: () => inputRefs.value[activeIndex.value]?.focus(), blur: () => inputRefs.value[activeIndex.value]?.blur(), handleOpen: () => setOpen(true), handleClose: close });
    return () => {
      const ids = getPickerIds(baseId.value, range.value, props.id, field?.id, field?.availableId);
      const panel = open.value ? (
        <div ref={floating} id={ids.panelId} role='dialog' class={[bem('dropdown'), panelTheme.value.scopeClass, props.popperClass]} data-theme={panelTheme.value.theme} style={[panelTheme.value.style ?? {}, position.style.value, props.popperStyle as Record<string, string>]}>
          {props.arrowControl && <div class={bem('arrows')}>
            {(['hour', 'minute', 'second'] as TimeUnit[]).filter((unit) => props.format.includes(unit === 'hour' ? 'HH' : unit === 'minute' ? 'mm' : 'ss')).map((unit) => <><button type='button' aria-label={`增加${unit === 'hour' ? '小时' : unit === 'minute' ? '分钟' : '秒'}`} onClick={() => choose(unit, Math.min(unit === 'hour' ? 23 : 59, draft.value[unit] + 1))}>↑</button><button type='button' aria-label={`减少${unit === 'hour' ? '小时' : unit === 'minute' ? '分钟' : '秒'}`} onClick={() => choose(unit, Math.max(0, draft.value[unit] - 1))}>↓</button></>)}
          </div>}
          <TimePickerPanel value={draft.value} format={props.format} disabledHours={props.disabledHours} disabledMinutes={props.disabledMinutes} disabledSeconds={props.disabledSeconds} onSelect={choose} />
          {props.showConfirm && <div class={bem('footer')}><button type='button' aria-label='确认' onClick={confirm}>确认</button><button type='button' aria-label='取消' onClick={cancel}>取消</button></div>}
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      const value = model.value;
      return (
        <span ref={root} class={[bem(), controlNs.m(props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size), range.value && 'is-range']}>
          {range.value ? <><div ref={reference}>{props.prefixIcon && <span class={bem('prefix-icon')}>{renderIcon(props.prefixIcon as string | Component, bem('icon'))}</span>}{renderInput(ids, Array.isArray(value) ? value[0] : null, 0)}</div><span class={bem('separator')}>{props.rangeSeparator}</span><div>{renderInput(ids, Array.isArray(value) ? value[1] : null, 1)}</div></> : <div ref={reference}>{props.prefixIcon && <span class={bem('prefix-icon')}>{renderIcon(props.prefixIcon as string | Component, bem('icon'))}</span>}{renderInput(ids, value as DateValue | null)}</div>}
          {props.clearable && (range.value ? Array.isArray(value) && value.some((item) => item != null && !isEmptyValue(item)) : value != null) && <button type='button' class={bem('clear')} disabled={disabledOf() || props.readonly} aria-label='清空' onClick={() => clear()}>{props.clearIcon ? <span class={bem('clear-icon')}>{renderIcon(props.clearIcon as string | Component, bem('icon'))}</span> : '×'}</button>}
          {content}
        </span>
      );
    };
  }
});
