import { defineComponent, ref, type PropType } from 'vue';
import DatePicker from './date-picker';
import type { DateValue } from './date';
import type { Size } from '../config-provider/context';
import type { FloatingOptions, Placement } from '../../../src/utils/use-floating';
export default defineComponent({
  name: 'i-date-time-picker',
  props: {
    modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    type: { type: String as PropType<'datetime' | 'datetimerange'>, default: 'datetime' },
    format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    valueFormat: String,
    placeholder: String,
    startPlaceholder: String,
    endPlaceholder: String,
    disabled: Boolean,
    readonly: Boolean,
    clearable: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
    range: Boolean,
    rangeSeparator: { type: String, default: '-' },
    disabledDate: Function as PropType<(date: Date) => boolean>,
    disabledHours: Function as PropType<(...args: number[]) => number[]>,
    disabledMinutes: Function as PropType<(...args: number[]) => number[]>,
    disabledSeconds: Function as PropType<(...args: number[]) => number[]>,
    teleported: { type: Boolean, default: true },
    placement: String as PropType<Placement>,
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: [String, Object, Array] as PropType<string | Record<string, string> | Array<Record<string, string>>>,
    fallbackPlacements: Array as PropType<Placement[]>,
    popperOptions: Object as PropType<FloatingOptions>,
    emptyValues: Array as PropType<DateValue[]>,
    valueOnClear: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    defaultTime: { type: [Object, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    showConfirm: Boolean,
    automaticDropdown: { type: Boolean, default: true },
    showNow: { type: Boolean, default: true },
    showWeekNumber: Boolean,
    singlePanel: Boolean,
    unlinkPanels: Boolean,
    shortcuts: Array as PropType<Array<{ text: string; value: DateValue | DateValue[] | (() => DateValue | DateValue[]) }>>,
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    firstDayOfWeek: { type: Number, default: 0 },
    cellClassName: [String, Function] as PropType<string | ((date: Date) => string)>,
    showFooter: { type: Boolean, default: true },
    id: [String, Array] as PropType<string | string[]>,
    name: String,
    prefixIcon: [String, Object],
    clearIcon: [String, Object],
    size: String as PropType<Size>
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change', 'calendar-change', 'panel-change'],
  setup(props, { attrs, emit, expose }) {
    const picker = ref<{ focus: () => void; blur: () => void; handleOpen: () => void; handleClose: () => void }>();
    expose({
      focus: () => picker.value?.focus(),
      blur: () => picker.value?.blur(),
      handleOpen: () => picker.value?.handleOpen(),
      handleClose: () => picker.value?.handleClose()
    });
    return () => (
      <DatePicker
        ref={picker}
        {...attrs}
        {...props}
        type={props.type}
        value-format={props.valueFormat}
        range={props.range || props.type === 'datetimerange'}
        range-separator={props.rangeSeparator}
        teleported={props.teleported}
        placement={props.placement}
        popper-class={props.popperClass}
        popper-style={props.popperStyle}
        fallback-placements={props.fallbackPlacements}
        popper-options={props.popperOptions}
        empty-values={props.emptyValues}
        value-on-clear={props.valueOnClear}
        default-time={props.defaultTime}
        show-confirm={props.showConfirm}
        automatic-dropdown={props.automaticDropdown}
        show-now={props.showNow}
        show-week-number={props.showWeekNumber}
        single-panel={props.singlePanel}
        unlink-panels={props.unlinkPanels}
        shortcuts={props.shortcuts}
        default-value={props.defaultValue}
        first-day-of-week={props.firstDayOfWeek}
        cell-class-name={props.cellClassName}
        show-footer={props.showFooter}
        id={props.id}
        name={props.name}
        prefix-icon={props.prefixIcon}
        clear-icon={props.clearIcon}
        disabled-hours={props.disabledHours}
        disabled-minutes={props.disabledMinutes}
        disabled-seconds={props.disabledSeconds}
        onUpdate:modelValue={(value: DateValue | DateValue[] | null) => emit('update:modelValue', value)}
        onChange={(value: DateValue | DateValue[] | null) => emit('change', value)}
        onBlur={(event: FocusEvent) => emit('blur', event)}
        onFocus={(event: FocusEvent) => emit('focus', event)}
        onClear={() => emit('clear')}
        onVisible-change={(value: boolean) => emit('visible-change', value)}
        onCalendar-change={(value: unknown) => emit('calendar-change', value)}
        onPanel-change={(...value: unknown[]) => emit('panel-change', ...value)}
      />
    );
  }
});
