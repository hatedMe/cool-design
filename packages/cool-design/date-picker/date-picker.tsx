import { Teleport, computed, defineComponent, h, inject, markRaw, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch, type Component, type PropType, type StyleValue } from 'vue';
import dayjs from 'dayjs';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useConfig, type Size } from '../config-provider/context';
import { formKey, useField } from '../form/context';
import { emitValue, formatDate, getWeekStart, parseFormattedDate, parseTimeParts, toDate, type DateModelValue, type DateValue, type TimeParts } from './date';
import DatePickerPanel, { type DatePanelType } from './date-picker-panel';
import TimePickerPanel, { type TimeUnit } from './time-picker-panel';
import { useFloating, type Placement, type FloatingOptions } from '../../../src/utils/use-floating';
import type { DatePickerPanelTimeRules } from '../date-picker-panel/date-picker-panel';

export type DatePickerType = DatePanelType | 'months' | 'years' | 'quarter' | 'quarters' | 'quarterrange' | 'datetime' | 'daterange' | 'datetimerange' | 'monthrange' | 'yearrange';
type Model = DateValue | null | Array<DateValue | null>;
type Shortcut = {
  text: string;
  value?: DateValue | DateValue[] | (() => DateValue | DateValue[]);
  onClick?: (pick: (value: Date | Date[]) => void) => void;
};

const createDatePicker = (inline: boolean) => defineComponent({
  name: 'i-date-picker',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean, Date, Array] as PropType<Model | boolean>, default: null },
    type: { type: String as PropType<DatePickerType>, default: 'date' },
    format: String,
    dateFormat: String,
    timeFormat: String,
    arrowControl: Boolean,
    valueFormat: String,
    placeholder: String,
    startPlaceholder: String,
    endPlaceholder: String,
    rangeSeparator: { type: String, default: '-' },
    disabled: Boolean,
    readonly: Boolean,
    clearable: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
    range: Boolean,
    disabledDate: Function as PropType<(date: Date) => boolean>,
    disabledHours: Function as PropType<(...args: number[]) => number[]>,
    disabledMinutes: Function as PropType<(...args: number[]) => number[]>,
    disabledSeconds: Function as PropType<(...args: number[]) => number[]>,
    inlineTimeRules: Object as PropType<DatePickerPanelTimeRules>,
    firstDayOfWeek: { type: Number, default: 0 },
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateModelValue>, default: null },
    cellClassName: [String, Function] as PropType<string | ((date: Date) => string)>,
    showWeekNumber: Boolean,
    showFooter: { type: Boolean, default: true },
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Date, Array, Function] as PropType<DateModelValue | boolean | (() => unknown)>, default: undefined },
    id: [String, Array] as PropType<string | string[]>,
    name: String,
    prefixIcon: [String, Object],
    clearIcon: [String, Object],
    popperOptions: Object as PropType<FloatingOptions>,
    shortcuts: Array as PropType<Shortcut[]>,
    defaultTime: { type: [Object, Array] as PropType<DateModelValue>, default: null },
    showConfirm: Boolean,
    showNow: Boolean,
    automaticDropdown: { type: Boolean, default: true },
    size: String as PropType<Size>,
    teleported: { type: Boolean, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: [String, Object, Array] as PropType<string | Record<string, string> | Array<Record<string, string>>>,
    fallbackPlacements: Array as PropType<Placement[]>,
    unlinkPanels: Boolean,
    singlePanel: Boolean,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change', 'calendar-change', 'panel-change', 'inline-panel-change'],
  setup(props, { attrs, emit, expose, slots }) {
    const config = useConfig();
    const field = useField();
    const form = inject(formKey, undefined);
    const disabledOf = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
    const validate = (trigger: 'blur' | 'change') => {
      if (props.validateEvent) nextTick(() => field?.validate(trigger));
    };
    const panelId = `i-date-picker-panel-${Math.random().toString(36).slice(2)}`;
    const rangePanelCursors = ref<[DateValue | null, DateValue | null]>([null, null]);
    const root = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    const inputRef = ref<HTMLInputElement>();
    const open = ref(inline);
    const manualOpen = ref(false);
    const draftValue = ref<DateValue | Array<DateValue | null> | null>(null);
    const activeIndex = ref(0);
    const rangeDraft = ref<Array<DateValue | null>>([null, null]);
    // 范围选择时的悬停预览：已选起点、未选终点时高亮鼠标经过的区间。
    const hoverPreview = ref<Date | null>(null);
    const dateDraft = ref<DateValue[]>([]);
    const timeDraft = ref<TimeParts>({ hour: 0, minute: 0, second: 0 });
    const lastInputValues: Array<string | undefined> = [];
    const pendingInputs: Array<string | undefined> = [];
    const { emptyValues, getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const model = computed<Model>(() => {
      const value = props.modelValue;
      return typeof value === 'boolean' || isEmptyValue(value) ? null : value;
    });
    const isRange = computed(() => {
      if (isMultiple.value) return false;
      return props.range || props.type.endsWith('range') || (!inline && Array.isArray(model.value));
    });
    const isMultiple = computed(() => props.type === 'dates' || props.type === 'months' || props.type === 'years' || props.type === 'quarters');
    const panelType = computed<DatePanelType>(() => props.type === 'datetime' || props.type === 'datetimerange' || props.type === 'daterange' ? 'date' : props.type === 'monthrange' || props.type === 'months' ? 'month' : props.type === 'quarter' || props.type === 'quarters' || props.type === 'quarterrange' ? 'quarter' : props.type === 'yearrange' || props.type === 'years' ? 'year' : props.type as DatePanelType);
    const renderIcon = (icon: string | Component | undefined, className: string) => typeof icon === 'string' ? <i class={[className, icon]} aria-hidden='true' /> : icon ? h(markRaw(toRaw(icon))) : null;
    const formatValue = computed(() => props.format || (props.type === 'datetime' || props.type === 'datetimerange' ? 'YYYY-MM-DD HH:mm:ss' : props.type === 'week' ? 'YYYY-[第]ww[周]' : props.type === 'month' || props.type === 'months' || props.type === 'monthrange' ? 'YYYY-MM' : props.type === 'year' || props.type === 'years' || props.type === 'yearrange' ? 'YYYY' : props.type === 'quarter' || props.type === 'quarters' || props.type === 'quarterrange' ? 'YYYY-[Q]Q' : 'YYYY-MM-DD'));
    // 时间面板粒度跟随 format：不含 ss 则无秒列、不含 mm 则无分列。
    const timePanelFormat = computed(() => {
      if (props.timeFormat) return props.timeFormat;
      const format = formatValue.value;
      const hour = /H/.test(format) || /h/.test(format) ? 'HH' : '';
      const minute = /mm/.test(format) ? ':mm' : '';
      const second = /ss/.test(format) ? ':ss' : '';
      return `${hour}${minute}${second}` || 'HH:mm:ss';
    });
    const position = useFloating({ open: computed(() => open.value && !inline), reference, floating, placement: () => props.placement, fallbackPlacements: () => props.fallbackPlacements, options: () => props.popperOptions, close: () => close(), closeOnOutside: () => true });
    const currentValues = (): Array<DateValue | null> => Array.isArray(model.value) ? model.value : [model.value];
    const output = (date: Date): DateValue => inline ? date : emitValue(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`, props.valueFormat, props.type === 'datetime' || props.type === 'datetimerange') as DateValue;
    const hasTime = computed(() => props.type === 'datetime' || props.type === 'datetimerange');
    const calendarStep = computed(() => {
      if (panelType.value === 'year') return inline ? 120 : 12;
      if (panelType.value === 'quarter') return inline ? 12 : 3;
      return inline && panelType.value === 'month' ? 12 : 1;
    });
    const isDisabled = (date: Date) => Boolean(props.disabledDate?.(date));
    const mergeDateTime = (date: Date, time: TimeParts) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hour, time.minute, time.second);
    const commit = (value: DateValue | null | Array<DateValue | null>) => {
      if (disabledOf() || props.readonly) return;
      if (inline) {
        draftValue.value = value;
      } else if (props.showConfirm) {
        draftValue.value = value;
        return;
      }
      emit('update:modelValue', value);
      if (!inline) {
        emit('change', value);
        validate('change');
        if (!isRange.value && !isMultiple.value) close();
      }
    };
    const timeFor = (index: number, value?: DateValue | null) =>
      parseTimeParts(value ?? (Array.isArray(props.defaultTime) ? props.defaultTime[index] : props.defaultTime))
      ?? { hour: 0, minute: 0, second: 0 };
    const withDefaultTime = (date: Date, index = 0) =>
      props.defaultTime || hasTime.value ? mergeDateTime(date, timeFor(index)) : date;
    const inlineTimeRules = (index: number) => {
      const role = index === 0 ? 'start' : 'end';
      const other = isRange.value ? toDate(rangeDraft.value[1 - index]) : null;
      const comparing = other ? dayjs(other) : undefined;
      return {
        disabledHours: () => props.inlineTimeRules?.disabledHours?.(role, comparing) ?? [],
        disabledMinutes: (hour: number) => props.inlineTimeRules?.disabledMinutes?.(hour, role, comparing) ?? [],
        disabledSeconds: (hour: number, minute: number) => props.inlineTimeRules?.disabledSeconds?.(hour, minute, role, comparing) ?? []
      };
    };
    const disabledTime = (time: TimeParts, index: number) => {
      const rules = inlineTimeRules(index);
      return rules.disabledHours().includes(time.hour)
        || rules.disabledMinutes(time.hour).includes(time.minute)
        || rules.disabledSeconds(time.hour, time.minute).includes(time.second);
    };
    const updateInlineEndpoint = (index: number, date: Date) => {
      if (disabledOf() || isDisabled(date) || disabledTime(timeFor(index, date), index)) return;
      if (!isRange.value) {
        rangeDraft.value = [date, null];
        commit(date);
        return;
      }
      const values = [...rangeDraft.value];
      values[index] = date;
      const [start, end] = values.map(toDate);
      if (start && end && start > end) return;
      rangeDraft.value = values;
      if (start && end) commit(values);
    };
    const chooseTime = (unit: TimeUnit, value: number, index = activeIndex.value) => {
      if (inline) {
        const current = toDate(rangeDraft.value[index]);
        if (current) updateInlineEndpoint(index, mergeDateTime(current, { ...timeFor(index, current), [unit]: value }));
        return;
      }
      if (disabledOf() || props.readonly) return;
      timeDraft.value = { ...timeDraft.value, [unit]: value };
      // 粒度跟随 format：有秒等秒、有分等分、仅时则选时即完成。
      const complete =
        unit === 'second' ||
        (unit === 'minute' && !formatValue.value.includes('ss')) ||
        (unit === 'hour' && !formatValue.value.includes('mm'));
      if (!complete) return;
      const date = toDate(rangeDraft.value[activeIndex.value] || (Array.isArray(model.value) ? model.value[activeIndex.value] : model.value));
      if (!date) return;
      const next = output(mergeDateTime(date, timeDraft.value));
      if (isRange.value) {
        rangeDraft.value[activeIndex.value] = next;
        if (activeIndex.value === 0) {
          activeIndex.value = 1;
          const nextDate = toDate(currentValues()[1]);
          if (nextDate) timeDraft.value = { hour: nextDate.getHours(), minute: nextDate.getMinutes(), second: nextDate.getSeconds() };
          emit('calendar-change', rangeDraft.value);
        } else {
          const start = toDate(rangeDraft.value[0]);
          const end = toDate(rangeDraft.value[1]);
          if (start && end && end < start) return;
          commit(rangeDraft.value);
          activeIndex.value = 0;
        }
      } else commit(next);
    };
    const chooseNow = () => {
      const now = new Date();
      if (!inline) commit(output(now));
      else updateInlineEndpoint(0, now);
    };
    const applyShortcut = (value: DateValue | DateValue[]) => {
      if (!inline) {
        commit(value);
        return;
      }
      const values = (Array.isArray(value) ? value : [value]).map(toDate);
      if (!values.every((date): date is Date => date != null && !isDisabled(date))) return;
      if (isRange.value) {
        if (values.length !== 2) return;
        values.sort((start, end) => start.getTime() - end.getTime());
        rangeDraft.value = values;
        activeIndex.value = 0;
        hoverPreview.value = null;
      } else if (isMultiple.value) dateDraft.value = values;
      else if (hasTime.value) rangeDraft.value = [values[0], null];
      if (values[0]) rangePanelCursors.value = [values[0], shiftCursor(values[0], calendarStep.value)];
      commit(isRange.value || isMultiple.value ? values : values[0]);
    };
    const chooseShortcut = (shortcut: Shortcut) => {
      if (disabledOf() || props.readonly) return;
      const value = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value;
      if (value != null) applyShortcut(value);
      else if (inline) shortcut.onClick?.(applyShortcut);
    };
    const confirm = () => {
      if (disabledOf() || props.readonly) return;
      if (inline) {
        const value = isRange.value ? rangeDraft.value : isMultiple.value ? dateDraft.value : rangeDraft.value[0];
        if (value != null && (!isRange.value || (rangeDraft.value[0] != null && rangeDraft.value[1] != null))) {
          commit(value);
        } else if (!isRange.value && hasTime.value) {
          const now = new Date();
          const defaultDate = toDate(Array.isArray(props.defaultValue) ? props.defaultValue[0] : props.defaultValue) ?? now;
          updateInlineEndpoint(0, mergeDateTime(defaultDate, timeFor(0, props.defaultTime ? undefined : now)));
        }
        return;
      }
      if (draftValue.value !== null) {
        const value = draftValue.value;
        draftValue.value = null;
        emit('update:modelValue', value);
        emit('change', value); validate('change');
      }
      close();
    };
    const choose = (date: Date) => {
      if (disabledOf() || props.readonly) return;
      if (props.type === 'week') {
        date = getWeekStart(date, props.firstDayOfWeek);
      }
      if (!inline && isDisabled(date)) return;
      if (inline && hasTime.value && !isRange.value) {
        updateInlineEndpoint(0, mergeDateTime(date, timeFor(0, rangeDraft.value[0])));
        return;
      }
      if (!inline && hasTime.value) {
        const merged = mergeDateTime(date, timeDraft.value);
        if (isRange.value) {
          rangeDraft.value[activeIndex.value] = output(merged);
          emit('calendar-change', rangeDraft.value);
        } else {
          const next = output(merged);
          rangeDraft.value = [next, null];
          open.value = true;
          nextTick(() => position.update());
          if (props.showConfirm) draftValue.value = next;
        }
        return;
      }
      if (isMultiple.value) {
        const dates = [...dateDraft.value];
        const unit = panelType.value === 'date' || panelType.value === 'dates' || panelType.value === 'week' ? 'day' : panelType.value;
        const existing = dates.findIndex((item) => inline ? dayjs(item).isSame(date, unit) : toDate(item)?.getTime() === date.getTime());
        if (existing >= 0) dates.splice(existing, 1);
        else dates.push(inline ? withDefaultTime(date) : date);
        if (!inline) dates.sort((left, right) => toDate(left)!.getTime() - toDate(right)!.getTime());
        dateDraft.value = dates;
        commit(dates.map((date) => output(toDate(date)!)));
        return;
      }
      if (isRange.value) {
        if (activeIndex.value === 0) {
          const start = inline ? withDefaultTime(date) : date;
          rangeDraft.value = [output(start), null];
          activeIndex.value = 1;
          emit('calendar-change', inline ? [date, null] : rangeDraft.value);
          return;
        }
        const start = toDate(rangeDraft.value[0]);
        if (inline && start) {
          const first = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const [left, right] = first > date ? [date, first] : [first, date];
          const values = [withDefaultTime(left, 0), withDefaultTime(right, 1)];
          if (values[0] > values[1] || (hasTime.value && values.some((item, index) => disabledTime(timeFor(index, item), index)))) return;
          rangeDraft.value = values;
          hoverPreview.value = null;
          activeIndex.value = 0;
          emit('calendar-change', [left, right]);
          commit(values);
          return;
        }
        const values = start && start > date ? [output(date), output(start)] : [rangeDraft.value[0], output(date)];
        if (panelType.value === 'quarter') values.sort((left, right) => (toDate(left)?.getTime() || 0) - (toDate(right)?.getTime() || 0));
        rangeDraft.value = values;
        hoverPreview.value = null;
        commit(values);
        activeIndex.value = 0;
        return;
      }
      commit(output(inline ? withDefaultTime(date) : date));
    };
    const resetInlineSelection = () => {
      const [start, end] = currentValues();
      const defaults = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
      const base = toDate(start ?? defaults[0]) ?? new Date();
      const unlinked = props.unlinkPanels ? toDate(end ?? defaults[1]) : null;
      const next = shiftCursor(base, calendarStep.value);
      rangePanelCursors.value = [base, unlinked && unlinked >= next ? unlinked : next];
      rangeDraft.value = [start ?? null, end ?? null];
      dateDraft.value = currentValues().filter((item): item is DateValue => item != null);
      draftValue.value = null;
      activeIndex.value = 0;
      hoverPreview.value = null;
    };
    const shiftCursor = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
    const setOpen = (value: boolean) => {
      if (open.value === value || (value && (disabledOf() || props.readonly))) return;
      if (value && props.automaticDropdown === false && !manualOpen.value) return;
      open.value = value;
      emit('visible-change', value);
      if (value) {
        const values = currentValues();
        rangeDraft.value = [values[0] ?? null, values[1] ?? null];
        const base = toDate(values[0] ?? (Array.isArray(props.defaultValue) ? props.defaultValue[0] : props.defaultValue)) || new Date();
        rangePanelCursors.value = [base, new Date(base.getFullYear(), base.getMonth() + 1, 1)];
        const defaultTime = Array.isArray(props.defaultTime) ? props.defaultTime[activeIndex.value] : props.defaultTime;
        const initialTime = toDate(values[activeIndex.value] ?? defaultTime);
        if (initialTime) timeDraft.value = { hour: initialTime.getHours(), minute: initialTime.getMinutes(), second: initialTime.getSeconds() };
        dateDraft.value = values.filter(Boolean) as DateValue[];
        const initial = toDate(values[activeIndex.value]);
        if (initial) timeDraft.value = { hour: initial.getHours(), minute: initial.getMinutes(), second: initial.getSeconds() };
        nextTick(() => position.update());
      }
    };
    const close = () => { manualOpen.value = false; draftValue.value = null; hoverPreview.value = null; setOpen(false); };
    watch(disabledOf, (disabled) => {
      if (!disabled) return;
      pendingInputs.length = 0;
      if (!inline) close();
    });
    const updateInput = (index: number | undefined, value: string) => {
      pendingInputs[index ?? 0] = value;
    };
    const clearValue = () => {
      if (disabledOf() || props.readonly) return;
      lastInputValues.length = 0;
      pendingInputs.length = 0;
      const value = getValueOnClear(null);
      if (inline) {
        resetInlineSelection();
        rangeDraft.value = [null, null];
        draftValue.value = null;
      }
      if (inline) emit('update:modelValue', value, true);
      else {
        emit('update:modelValue', value);
        emit('change', value);
        validate('change');
      }
      emit('clear');
    };
    const commitInput = (index: number | undefined) => {
      if (disabledOf() || props.readonly) return;
      const value = pendingInputs[index ?? 0];
      if (value === undefined) return;
      if (value === '' || emptyValues.value.some((empty) => String(empty) === value)) {
        clearValue();
        return;
      }
      if (value === lastInputValues[index ?? 0]) return;
      const date = parseFormattedDate(value, formatValue.value) || toDate(value) || new Date(value);
      const time = props.type === 'datetime' || props.type === 'datetimerange' ? (date ? { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() } : null) : null;
      const disabledTime = time && (props.disabledHours?.()?.includes(time.hour) || props.disabledMinutes?.(time.hour)?.includes(time.minute) || props.disabledSeconds?.(time.hour, time.minute)?.includes(time.second));
      if (Number.isNaN(date.getTime()) || isDisabled(date) || disabledTime) return;
      lastInputValues[index ?? 0] = value;
      const next = output(date);
      if (index == null) commit(next);
      else {
        const values = Array.isArray(model.value) ? [...model.value] : [null, null];
        values[index] = next;
        commit(values);
      }
    };
    const renderInput = (value: DateValue | null | undefined, index?: number) => (
      <>
        {index === 0 && props.prefixIcon && <span class='i-date-picker__prefix-icon'>{renderIcon(props.prefixIcon as string | Component, 'i-date-picker__icon')}</span>}
        <input {...attrs} ref={index === 0 || index == null ? inputRef : undefined} class='i-date-picker__input' type='text' value={value != null ? formatDate(value, formatValue.value) : ''} placeholder={index === 0 ? props.startPlaceholder || props.placeholder : props.endPlaceholder || props.placeholder} disabled={disabledOf()} id={Array.isArray(props.id) ? props.id[index ?? 0] : props.id ?? (index == null ? field?.id : undefined)} name={props.name} readonly={props.readonly || !props.editable} role='combobox' aria-haspopup='dialog' aria-expanded={open.value} aria-controls={panelId} aria-disabled={disabledOf() || undefined} onClick={() => { if (index != null) activeIndex.value = index; setOpen(true); }} onInput={(event: Event) => updateInput(index, (event.target as HTMLInputElement).value)} onChange={() => commitInput(index)} onFocus={(event: FocusEvent) => emit('focus', event)} onBlur={(event: FocusEvent) => { commitInput(index); emit('blur', event); validate('blur'); }} onKeydown={(event: KeyboardEvent) => { if (event.key === 'Escape') close(); if (event.key === 'Enter') setOpen(!open.value); }} />
      </>
    );
    const clear = clearValue;
    const onOutside = (event: MouseEvent) => { if (root.value && !root.value.contains(event.target as Node) && !floating.value?.contains(event.target as Node)) close(); };
    const movePanel = (index: 0 | 1, date: Date, mode: 'month' | 'year', view: string) => {
      rangePanelCursors.value[index] = date;
      if (!props.unlinkPanels) rangePanelCursors.value[1 - index] = shiftCursor(date, index === 0 ? calendarStep.value : -calendarStep.value);
      if (inline) {
        const [left, right] = rangePanelCursors.value.map(toDate);
        emit('inline-panel-change', isRange.value ? [left, right] : date, mode, isRange.value ? undefined : view);
      } else emit('panel-change', date, panelType.value);
    };
    const chooseCalendar = (date: Date) => {
      choose(date);
      if (!inline || isRange.value || (panelType.value !== 'month' && panelType.value !== 'year')) return;
      const panelDate = isMultiple.value ? toDate(rangePanelCursors.value[0]) ?? date : date;
      rangePanelCursors.value[0] = panelDate;
      emit('inline-panel-change', panelDate, panelType.value, panelType.value);
    };
    const renderCalendar = (index: 0 | 1) => {
      const selected = isMultiple.value ? dateDraft.value : isRange.value || (inline && hasTime.value) ? rangeDraft.value : model.value;
      return <DatePickerPanel
        standalone={inline}
        rangeSelection={isRange.value}
        disabled={inline && disabledOf()}
        showWeekNumber={props.showWeekNumber}
        cursorValue={rangePanelCursors.value[index]}
        firstDayOfWeek={props.firstDayOfWeek}
        cellClassName={props.cellClassName}
        defaultValue={props.defaultValue}
        modelValue={!inline && props.showConfirm && draftValue.value !== null ? draftValue.value : inline && !isRange.value && !isMultiple.value && !hasTime.value ? draftValue.value ?? selected : selected}
        type={panelType.value}
        disabledDate={props.disabledDate}
        onSelect={chooseCalendar}
        hoverValue={hoverPreview.value}
        onHover={(date: Date | null) => (hoverPreview.value = date)}
        onPanel-change={(date: Date, mode: 'month' | 'year', view: string) => movePanel(index, date, mode, view)}
      >{{ ...inline ? slots : {}, date: slots.default }}</DatePickerPanel>;
    };
    const updateInlineInput = (index: number, value: string, unit: 'date' | 'time') => {
      const [cursor] = rangePanelCursors.value;
      const current = toDate(rangeDraft.value[index]);
      const base = current ?? toDate(cursor) ?? new Date();
      if (unit === 'date') {
        const date = parseFormattedDate(value, props.dateFormat || 'YYYY-MM-DD');
        if (date) updateInlineEndpoint(index, mergeDateTime(date, timeFor(index, current)));
      } else {
        const parsed = parseFormattedDate(value, timePanelFormat.value);
        if (parsed) updateInlineEndpoint(index, mergeDateTime(base, timeFor(index, parsed)));
      }
    };
    const renderInlineTime = (index: number) => {
      const current = rangeDraft.value[index];
      const prefix = isRange.value ? (index === 0 ? '开始' : '结束') : '';
      return <div class='i-date-picker-panel__time'>
        <input aria-label={prefix + '日期'} value={formatDate(current, props.dateFormat || 'YYYY-MM-DD')} readonly={!props.editable} disabled={disabledOf()} onChange={(event: Event) => updateInlineInput(index, (event.target as HTMLInputElement).value, 'date')} />
        <input aria-label={prefix + '时间'} value={formatDate(current, timePanelFormat.value)} readonly={!props.editable} disabled={disabledOf()} onChange={(event: Event) => updateInlineInput(index, (event.target as HTMLInputElement).value, 'time')} />
        <TimePickerPanel
          value={timeFor(index, current)}
          format={timePanelFormat.value}
          {...inlineTimeRules(index)}
          disabled={disabledOf()}
          arrowControl={props.arrowControl}
          onSelect={(unit: TimeUnit, value: number) => chooseTime(unit, value, index)}
        />
      </div>;
    };
    const renderShortcuts = () => props.shortcuts?.map((shortcut) => <button key={shortcut.text} type='button' data-shortcut={shortcut.text} disabled={inline && disabledOf()} onClick={() => chooseShortcut(shortcut)}>{shortcut.text}</button>);
    const renderFooter = () => {
      if (!props.showFooter) return null;
      const showNow = props.showNow && !isRange.value && !isMultiple.value && (inline ? hasTime.value : props.type === 'date' || props.type === 'datetime');
      const showClear = inline && isRange.value && hasTime.value && props.clearable;
      const showConfirm = props.showConfirm && (!inline || isMultiple.value || hasTime.value);
      if (inline && !showNow && !showClear && !showConfirm) return null;
      const incomplete = inline && isRange.value && rangeDraft.value.some((item) => item == null);
      return <div class='i-date-picker__footer'>
        {showNow && <button type='button' aria-label='现在' disabled={inline && disabledOf()} onClick={chooseNow}>现在</button>}
        {!inline && renderShortcuts()}
        {showClear && <button type='button' aria-label='清空' disabled={disabledOf()} onClick={clear}>清空</button>}
        {showConfirm && <button type='button' aria-label='确认' disabled={inline && (incomplete || disabledOf())} onClick={confirm}>确认</button>}
      </div>;
    };
    if (inline) {
      resetInlineSelection();
      watch([() => props.defaultValue, () => props.unlinkPanels, () => props.type], resetInlineSelection);
      watch(model, (value) => {
        const selected = Array.isArray(value) ? value : [value];
        const draft = Array.isArray(draftValue.value) ? draftValue.value : [draftValue.value];
        if (selected.length !== draft.length || selected.some((item, index) => toDate(item)?.getTime() !== toDate(draft[index])?.getTime())) {
          resetInlineSelection();
        }
      });
    } else {
      onMounted(() => document.addEventListener('mousedown', onOutside));
      onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
    }
    expose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur(), handleOpen: () => { manualOpen.value = true; setOpen(true); }, handleClose: close });
    return () => {
      const value = model.value;
      const panel = open.value ? <div {...inline ? attrs : { id: panelId }} ref={floating} class={[inline ? 'i-date-picker-panel' : 'i-date-picker__dropdown', props.popperClass, inline && attrs.class, inline && disabledOf() && 'is-disabled']} style={[inline ? attrs.style as StyleValue : position.style.value, props.popperStyle]} aria-disabled={inline && disabledOf() || undefined}>
        {inline && props.shortcuts?.length ? <div class='i-date-picker-panel__shortcuts'>{renderShortcuts()}</div> : null}
        <div class='i-date-picker__datetime-panel'>
          {inline && hasTime.value && <div class='i-date-picker-panel__times'>{renderInlineTime(0)}{isRange.value && renderInlineTime(1)}</div>}
          {isRange.value && !props.singlePanel ? <div class='i-date-picker__range-panels'>{renderCalendar(0)}{renderCalendar(1)}</div> : renderCalendar(0)}
          {!inline && hasTime.value && <TimePickerPanel value={timeDraft.value} format={timePanelFormat.value} disabledHours={props.disabledHours} disabledMinutes={props.disabledMinutes} disabledSeconds={props.disabledSeconds} onSelect={chooseTime} />}
        </div>
        {renderFooter()}
      </div> : null;
      if (inline) return panel;

      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      return <span ref={root} class={['i-date-picker', `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`, isRange.value && 'is-range']}><div ref={reference}>{isRange.value ? <>{renderInput(Array.isArray(value) ? value[0] : null, 0)}<span class='i-date-picker__separator'>{props.rangeSeparator}</span>{renderInput(Array.isArray(value) ? value[1] : null, 1)}</> : renderInput(value as DateValue | null)}</div>{props.clearable && (Array.isArray(value) ? value.some((item) => item != null && !isEmptyValue(item)) : value != null) && <button type='button' class='i-date-picker__clear' aria-label='清空' disabled={disabledOf() || props.readonly} onClick={clear}>{props.clearIcon ? <span class='i-date-picker__clear-icon'>{renderIcon(props.clearIcon as string | Component, 'i-date-picker__icon')}</span> : '×'}</button>}{content}</span>;
    };
  }
});

export const DatePickerInline = createDatePicker(true);
export default createDatePicker(false);
