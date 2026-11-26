import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import localeData from 'dayjs/plugin/localeData.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import { computed, defineComponent, type ExtractPropTypes, type PropType, type Slots, type VNode } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useLocale } from '../config-provider/context';
import { DatePickerInline, type DatePickerType } from '../date-picker/date-picker';
import type { DatePickerPanelCell } from '../date-picker/date-picker-panel';
import { toDate } from '../date-picker/date';

dayjs.extend(localeData);
dayjs.extend(weekYear);

type DateValue = Date | number | string;
export type DatePickerPanelModelValue = DateValue | Array<DateValue> | boolean | null | undefined;
export type DatePickerPanelCalendarRange = [Date, Date | null];
export type DatePickerPanelNavigation = Date | [Date, Date];
export interface DatePickerPanelTimeRules {
  disabledHours?: (role: string, comparingDate?: Dayjs) => number[];
  disabledMinutes?: (hour: number, role: string, comparingDate?: Dayjs) => number[];
  disabledSeconds?: (hour: number, minute: number, role: string, comparingDate?: Dayjs) => number[];
}
type NavigationSlot = 'prev-month' | 'next-month' | 'prev-year' | 'next-year';
export type DatePickerPanelSlots = Partial<Record<NavigationSlot, () => VNode[]>> & {
  default?: (cell: DatePickerPanelCell) => VNode[];
  'date-cell'?: (cell: DatePickerPanelCell) => VNode[];
};
export type DatePickerPanelShortcut = {
  text: string;
  value?: DateValue | DateValue[] | (() => DateValue | DateValue[]);
  onClick?: (context: {
    attrs: Record<string, unknown>;
    slots: Slots;
    emit: (event: 'pick', value: Dayjs | Dayjs[]) => void;
  }) => void;
};

export const datePickerPanelProps = {
  modelValue: { type: [String, Number, Boolean, Date, Array] as PropType<DatePickerPanelModelValue>, default: '' },
  type: { type: String as PropType<DatePickerType>, default: 'date' },
  valueFormat: String,
  dateFormat: String,
  timeFormat: String,
  disabled: Boolean,
  disabledDate: Function as PropType<(date: Date) => boolean>,
  defaultValue: [Date, Array] as PropType<Date | [Date, Date]>,
  defaultTime: [Date, Array] as PropType<Date | [Date, Date]>,
  showFooter: Boolean,
  showConfirm: Boolean,
  showNow: { type: Boolean, default: true },
  showWeekNumber: Boolean,
  singlePanel: Boolean,
  unlinkPanels: Boolean,
  isRange: Boolean,
  arrowControl: Boolean,
  editable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true },
  border: { type: Boolean, default: true },
  cellClassName: Function as PropType<(date: Date) => string>,
  shortcuts: { type: Array as PropType<DatePickerPanelShortcut[]>, default: () => [] },
  disabledHours: Function as PropType<DatePickerPanelTimeRules['disabledHours']>,
  disabledMinutes: Function as PropType<DatePickerPanelTimeRules['disabledMinutes']>,
  disabledSeconds: Function as PropType<DatePickerPanelTimeRules['disabledSeconds']>,
  emptyValues: Array as PropType<unknown[]>,
  valueOnClear: { type: [String, Number, Boolean, Date, Array, Function] as PropType<DatePickerPanelModelValue | (() => unknown)>, default: undefined }
};
export type DatePickerPanelProps = Partial<ExtractPropTypes<typeof datePickerPanelProps>>;

export const datePickerPanelEmits = {
  'update:modelValue': (value: DatePickerPanelModelValue, locale: string) => (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date || Array.isArray(value)) && typeof locale === 'string',
  'calendar-change': (range: DatePickerPanelCalendarRange) => range[0] instanceof Date && (range[1] === null || range[1] instanceof Date),
  'panel-change': (date: DatePickerPanelNavigation, mode: 'month' | 'year', view?: string) => (date instanceof Date || (date.length === 2 && date.every((item) => item instanceof Date))) && (mode === 'month' || mode === 'year') && (view == null || typeof view === 'string'),
  'visible-change': (visible: boolean) => typeof visible === 'boolean',
  clear: () => true
};
export type DatePickerPanelEmits = typeof datePickerPanelEmits;

const sameValue = (a: unknown, b: unknown): boolean => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => sameValue(item, b[index]));
  return Object.is(a, b);
};

export default defineComponent({
  name: 'i-date-picker-panel',
  inheritAttrs: false,
  props: datePickerPanelProps,
  emits: datePickerPanelEmits,
  setup(props, { attrs, slots, emit }) {
    const { locale } = useLocale();
    const { isEmptyValue } = useEmptyValues({ emptyValues: computed(() => props.emptyValues) });
    const readDate = (value: DateValue) => {
      const format = props.valueFormat;
      if (value instanceof Date) return toDate(value);
      const date = format === 'x' || format === 'timestamp' ? dayjs(Number(value))
        : format === 'X' ? dayjs.unix(Number(value))
        : format ? dayjs(value, format, locale.value.name)
        : dayjs(value);
      return date.isValid() ? date.toDate() : null;
    };
    const modelValue = computed(() => {
      const value = props.modelValue;
      if (value == null || typeof value === 'boolean' || isEmptyValue(value)) return null;
      if (!Array.isArray(value)) return readDate(value);
      const dates = value.map(readDate);
      return dates.every((date): date is Date => date != null) ? dates : null;
    });
    const formatValue = (date: Date) => {
      if (!props.valueFormat) return date;
      if (props.valueFormat === 'x' || props.valueFormat === 'timestamp') return date.getTime();
      return dayjs(date).locale(locale.value.name).format(props.valueFormat);
    };
    const emitValue = (value: DatePickerPanelModelValue, clear = false) => {
      const output = clear ? value : Array.isArray(value) ? value.map((item) => item instanceof Date ? formatValue(item) : item)
        : value instanceof Date ? formatValue(value) : value;
      if (!sameValue(output, props.modelValue)) emit('update:modelValue', output, locale.value.name);
    };
    const shortcuts = computed(() => props.shortcuts.map((shortcut) => ({
      text: shortcut.text,
      value: shortcut.value,
      onClick: shortcut.onClick && ((pick: (value: Date | Date[]) => void) => {
        shortcut.onClick?.({
          attrs,
          slots,
          emit: (_, value) => pick(Array.isArray(value) ? value.map((date) => date.toDate()) : value.toDate())
        });
      })
    })));
    return () => <DatePickerInline
      {...Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'onPick'))}
      modelValue={modelValue.value}
      type={props.type}
      popperClass={!props.border ? 'is-borderless' : undefined}
      range={props.isRange}
      disabled={props.disabled}
      disabledDate={props.disabledDate}
      cellClassName={props.cellClassName}
      defaultValue={props.defaultValue}
      defaultTime={props.defaultTime}
      dateFormat={props.dateFormat}
      timeFormat={props.timeFormat}
      editable={props.editable}
      clearable={props.clearable}
      arrowControl={props.arrowControl}
      singlePanel={props.singlePanel}
      unlinkPanels={props.unlinkPanels}
      showFooter={props.showFooter}
      showConfirm={props.showConfirm}
      showNow={props.showNow}
      showWeekNumber={props.showWeekNumber}
      firstDayOfWeek={dayjs().locale(locale.value.name).localeData().firstDayOfWeek()}
      shortcuts={shortcuts.value}
      inlineTimeRules={props}
      emptyValues={props.emptyValues}
      valueOnClear={props.valueOnClear}
      teleported={false}
      validateEvent={false}
      onUpdate:modelValue={emitValue}
      onCalendar-change={(range: DatePickerPanelCalendarRange) => emit('calendar-change', range)}
      onInline-panel-change={(date: DatePickerPanelNavigation, mode: 'month' | 'year', view?: string) => emit('panel-change', date, mode, view)}
      onClear={() => emit('clear')}
    >{{ ...slots, default: slots.default ?? slots['date-cell'] }}</DatePickerInline>;
  }
});
