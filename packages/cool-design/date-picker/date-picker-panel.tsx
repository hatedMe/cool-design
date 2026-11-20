import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { getWeekNumber, getWeekStart, monthLabel, sameDay, toDate, type DateModelValue, type DateValue } from './date';

export type DatePanelType = 'date' | 'dates' | 'week' | 'month' | 'year' | 'quarter';
export interface DatePickerPanelCell {
  date: Date;
  dayjs: Dayjs;
  text: number;
  renderText?: string;
  type: 'normal' | 'today' | 'prev-month' | 'next-month';
  row: number;
  column: number;
  timestamp: number;
  disabled: boolean;
  customClass?: string;
  isCurrent: boolean;
  isSelected: boolean;
  selected?: Dayjs;
  inRange: boolean;
  start: boolean;
  end: boolean;
}

export default defineComponent({
  name: 'i-date-picker-calendar-panel',
  props: {
    modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | Array<DateValue | null> | null>, default: null },
    type: { type: String as PropType<DatePanelType>, default: 'date' },
    standalone: Boolean,
    disabled: Boolean,
    rangeSelection: Boolean,
    disabledDate: Function as PropType<(date: Date) => boolean>,
    firstDayOfWeek: { type: Number, default: 0 },
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateModelValue>, default: null },
    cellClassName: [String, Function] as PropType<string | ((date: Date) => string)>,
    showWeekNumber: Boolean,
    cursorValue: { type: [String, Number, Date] as PropType<DateValue | null>, default: null },
    hoverValue: { type: [String, Number, Date] as PropType<DateValue | null>, default: null }
  },
  emits: ['select', 'panel-change', 'hover'],
  setup(props, { emit, slots }) {
    const cursor = ref(toDate(props.cursorValue) || toDate(Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue) || toDate(Array.isArray(props.defaultValue) ? props.defaultValue[0] : props.defaultValue) || new Date());
    watch(() => props.cursorValue, (value) => { if (value != null) cursor.value = toDate(value) || cursor.value; });
    const days = computed(() => {
      const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
      const offset = (first.getDay() - props.firstDayOfWeek + 7) % 7;
      const count = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0).getDate();
      return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => new Date(cursor.value.getFullYear(), cursor.value.getMonth(), index - offset + 1));
    });
    const selectedValues = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]).map(toDate).filter((date): date is Date => date != null));
    const isCalendar = computed(() => props.type === 'date' || props.type === 'dates' || props.type === 'week');
    const move = (amount: number, mode: 'month' | 'year') => {
      if (props.disabled) return;
      const next = dayjs(cursor.value).add(amount, mode);
      cursor.value = (props.standalone ? next : next.startOf('month')).toDate();
      emit('panel-change', cursor.value, mode, isCalendar.value ? 'date' : props.type);
    };
    const select = (date: Date) => {
      if (!props.disabled && !props.disabledDate?.(date)) emit('select', date);
    };
    const navigation = (slot: string, label: string, amount: number, mode: 'month' | 'year') =>
      <button type='button' aria-label={label} disabled={props.disabled} onClick={() => move(amount, mode)}>
        {slots[slot]?.() ?? (amount < 0 ? '‹' : '›')}
      </button>;
    const renderCalendarHeader = () => <header class={['i-date-picker__panel-header', props.standalone && 'has-year-navigation']}>
      {props.standalone && navigation('prev-year', '上一年', -1, 'year')}
      {navigation('prev-month', '上个月', -1, 'month')}
      <strong>{monthLabel(cursor.value)}</strong>
      {navigation('next-month', '下个月', 1, 'month')}
      {props.standalone && navigation('next-year', '下一年', 1, 'year')}
    </header>;
    const unitView = computed(() => {
      const year = cursor.value.getFullYear();
      const month = cursor.value.getMonth();
      if (props.type === 'year') {
        const start = props.standalone ? year - year % 10 : year - 5;
        const length = props.standalone ? 10 : 12;
        return { label: start + ' - ' + (start + length - 1), step: 10,
          dates: Array.from({ length }, (_, index) => new Date(start + index, props.standalone ? 0 : month, 1)) };
      }
      const step = props.type === 'quarter' ? 3 : 1;
      return { label: year + '年', step: 1,
        dates: Array.from({ length: 12 / step }, (_, index) => new Date(year, index * step, 1)) };
    });
    const renderUnit = (date: Date, index: number) => {
      const unit = props.type === 'year' ? 'year' : props.type === 'quarter' ? 'quarter' : 'month';
      const start = dayjs(date);
      const end = start.add(1, unit);
      const allowed = props.standalone && props.disabledDate
        ? Array.from({ length: end.diff(start, 'day') }, (_, index) => start.add(index, 'day').toDate()).find((day) => !props.disabledDate?.(day))
        : date;
      const blockedQuarter = !props.standalone && unit === 'quarter' && props.disabledDate
        && Array.from({ length: end.diff(start, 'day') }, (_, index) => start.add(index, 'day').toDate()).some(props.disabledDate);
      const disabled = props.disabled || !allowed || !!blockedQuarter;
      const value = unit === 'year' ? String(date.getFullYear()) : unit === 'quarter' ? String(start.quarter()) : start.format('MM');
      const label = unit === 'year' ? value : unit === 'quarter' ? 'Q' + value : (date.getMonth() + 1) + '月';
      const selected = selectedValues.value.some((item) => dayjs(item).isSame(start, unit));
      let rangeStart: number | undefined;
      let rangeEnd: number | undefined;
      if (props.standalone && props.rangeSelection) {
        const [first, second] = selectedValues.value;
        const last = second ?? toDate(props.hoverValue);
        if (first) {
          rangeStart = dayjs(first).startOf(unit).valueOf();
          if (last) {
            rangeEnd = dayjs(last).startOf(unit).valueOf();
            if (rangeEnd < rangeStart) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
          }
        }
      }
      const timestamp = start.valueOf();
      const cell: DatePickerPanelCell = {
        date, dayjs: start, timestamp, text: unit === 'year' ? date.getFullYear() : index,
        renderText: unit === 'year' ? undefined : label, type: 'normal', row: Math.floor(index / 4), column: index % 4,
        disabled, isCurrent: false, isSelected: selected,
        inRange: rangeStart !== undefined && rangeEnd !== undefined && timestamp >= rangeStart && timestamp <= rangeEnd,
        start: timestamp === rangeStart, end: timestamp === rangeEnd
      };
      return <button key={value} type='button' role='gridcell' data-value={value} class={{ 'is-selected': selected }} disabled={disabled} aria-disabled={disabled || undefined} onClick={() => allowed && !disabled && select(allowed)} onMouseenter={() => props.standalone && props.rangeSelection && emit('hover', date)}>
        {(props.standalone && slots.date?.(cell)) || label}
      </button>;
    };
    const renderDay = (date: Date, index: number) => {
      const matching = selectedValues.value.find((item) => sameDay(item, date));
      const rangeStart = selectedValues.value[0];
      const rangeEnd = selectedValues.value[1];
      const hasRange = !props.standalone || props.rangeSelection;
      const inRange = hasRange && !!rangeStart && !!rangeEnd && date >= rangeStart && date <= rangeEnd;
      const hoverEnd = toDate(props.hoverValue);
      const rawValue = Array.isArray(props.modelValue) ? props.modelValue : null;
      const pendingRange = hasRange && rawValue?.length === 2 && rawValue[0] != null && rawValue[1] == null;
      const hovered = pendingRange && hoverEnd && ((date >= rangeStart && date <= hoverEnd) || (date >= hoverEnd && date <= rangeStart));
      const weekStart = getWeekStart(date, props.firstDayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const selectedWeek = props.type === 'week' && selectedValues.value.some((item) => item >= weekStart && item <= weekEnd);
      const start = hasRange && !!rangeStart && sameDay(rangeStart, date);
      const end = hasRange && !!rangeEnd && sameDay(rangeEnd, date);
      const today = sameDay(date, new Date());
      const otherMonth = date.getMonth() !== cursor.value.getMonth();
      const customClass = typeof props.cellClassName === 'function' ? props.cellClassName(date) : props.cellClassName;
      const disabled = props.disabled || Boolean(props.disabledDate?.(date));
      const value = dayjs(date).format('YYYY-MM-DD');
      const isCurrent = !!matching && !props.rangeSelection && props.type === 'date';
      const isSelected = !!matching && !props.rangeSelection && props.type === 'dates';
      const cell: DatePickerPanelCell = {
        date, dayjs: dayjs(date), text: date.getDate(), timestamp: date.getTime(),
        type: otherMonth ? (date < cursor.value ? 'prev-month' : 'next-month') : today ? 'today' : 'normal',
        row: Math.floor(index / 7), column: index % 7, disabled, customClass, isCurrent,
        isSelected, selected: matching && isSelected ? dayjs(matching) : undefined, inRange, start, end
      };
      return <>
        {props.showWeekNumber && index % 7 === 0 && <span class='i-date-picker__week-number-row'>{getWeekNumber(date, props.firstDayOfWeek)}</span>}
        <button key={value} type='button' role='gridcell' data-value={value} class={[customClass, {
          'is-other-month': otherMonth, 'is-selected': matching, 'is-in-week': selectedWeek,
          'is-in-range': inRange || hovered, 'is-start-date': start, 'is-end-date': end, 'is-today': today
        }]} aria-selected={!!matching} disabled={disabled} onClick={() => select(date)} onMouseenter={() => emit('hover', date)}>
          {slots.date?.(props.standalone ? cell : { date }) ?? date.getDate()}
        </button>
      </>;
    };
    return () => {
      if (!isCalendar.value) {
        const { label, step, dates } = unitView.value;
        return <>
          <header class='i-date-picker__panel-header'>
            {navigation('prev-year', props.type === 'year' ? '上一组年份' : '上一年', -step, 'year')}
            <strong>{label}</strong>
            {navigation('next-year', props.type === 'year' ? '下一组年份' : '下一年', step, 'year')}
          </header>
          <div class='i-date-picker__panel' role='grid' data-view={props.type} onMouseleave={() => props.standalone && props.rangeSelection && emit('hover', null)}>{dates.map(renderUnit)}</div>
        </>;
      }
      return (
        <div class='i-date-picker__calendar-panel' role='dialog'>
          {renderCalendarHeader()}
          <div class='i-date-picker__week'>
            {props.showWeekNumber && <span class='i-date-picker__week-number'>周</span>}
            {Array.from({ length: 7 }, (_, index) => ['日', '一', '二', '三', '四', '五', '六'][(index + props.firstDayOfWeek) % 7]).map((day) => <span key={day}>{day}</span>)}
          </div>
          <div class={['i-date-picker__grid', props.showWeekNumber && 'has-week-number']} onMouseleave={() => emit('hover', null)}>{days.value.map(renderDay)}</div>
        </div>
      );
    };
  }
});
