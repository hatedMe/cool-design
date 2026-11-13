import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { getWeekNumber, getWeekStart, monthLabel, sameDay, toDate, type DateValue } from './date';

export type DatePanelType = 'date' | 'dates' | 'week' | 'month' | 'year' | 'quarter';

export default defineComponent({
  name: 'i-date-picker-panel',
  props: {
    modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | Array<DateValue | null> | null>, default: null },
    type: { type: String as PropType<DatePanelType>, default: 'date' },
    disabledDate: Function as PropType<(date: Date) => boolean>,
    firstDayOfWeek: { type: Number, default: 0 },
    defaultValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
    cellClassName: [String, Function] as PropType<string | ((date: Date) => string)>,
    showWeekNumber: Boolean,
    cursorValue: { type: [String, Number, Date] as PropType<DateValue | null>, default: null }
  },
  emits: ['select', 'panel-change'],
  setup(props, { emit, slots }) {
    const cursor = ref(toDate(props.cursorValue) || toDate(Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue) || toDate(Array.isArray(props.defaultValue) ? props.defaultValue[0] : props.defaultValue) || new Date());
    watch(() => props.cursorValue, (value) => { if (value) cursor.value = toDate(value) || cursor.value; });
    const days = computed(() => {
      const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
      const offset = (first.getDay() - props.firstDayOfWeek + 7) % 7;
      const count = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0).getDate();
      return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => new Date(cursor.value.getFullYear(), cursor.value.getMonth(), index - offset + 1));
    });
    const selectedValues = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]).map(toDate).filter(Boolean) as Date[]);
    const move = (amount: number) => {
      cursor.value = props.type === 'year' ? new Date(cursor.value.getFullYear() + amount, cursor.value.getMonth(), 1) : new Date(cursor.value.getFullYear(), cursor.value.getMonth() + amount, 1);
      emit('panel-change', cursor.value);
    };
    const select = (date: Date) => {
      if (props.disabledDate?.(date)) return;
      emit('select', date);
    };
    const localValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const yearOptions = () => Array.from({ length: 12 }, (_, index) => cursor.value.getFullYear() - 5 + index);
    const monthOptions = () => Array.from({ length: 12 }, (_, index) => new Date(cursor.value.getFullYear(), index, 1));
    return () => {
      if (props.type === 'year') return <><header class='i-date-picker__panel-header'><button type='button' aria-label='上一组年份' onClick={() => move(-10)}>‹</button><strong>{cursor.value.getFullYear() - 5} - {cursor.value.getFullYear() + 6}</strong><button type='button' aria-label='下一组年份' onClick={() => move(10)}>›</button></header><div class='i-date-picker__panel' role='grid' data-view='year'>{yearOptions().map((year) => <button type='button' role='gridcell' data-value={String(year)} class={{ 'is-selected': selectedValues.value.some((date) => date.getFullYear() === year) }} onClick={() => select(new Date(year, cursor.value.getMonth(), 1))}>{year}</button>)}</div></>;
      if (props.type === 'quarter') return <><header class='i-date-picker__panel-header'><button type='button' aria-label='上一年' onClick={() => move(-12)}>‹</button><strong>{cursor.value.getFullYear()}年</strong><button type='button' aria-label='下一年' onClick={() => move(12)}>›</button></header><div class='i-date-picker__panel' role='grid' data-view='quarter'>{[0, 1, 2, 3].map((quarter) => { const date = new Date(cursor.value.getFullYear(), quarter * 3, 1); const selected = selectedValues.value.some((item) => item.getFullYear() === date.getFullYear() && Math.floor(item.getMonth() / 3) === quarter); const disabled = props.disabledDate ? Array.from({ length: 3 }, (_, month) => new Date(date.getFullYear(), date.getMonth() + month, 1)).some((monthStart) => Array.from({ length: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate() }, (_, index) => new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1)).some(props.disabledDate!)) : false; return <button type='button' role='gridcell' data-value={String(quarter + 1)} class={{ 'is-selected': selected }} disabled={disabled} aria-disabled={disabled || undefined} onClick={() => select(date)}>Q{quarter + 1}</button>; })}</div></>;
      if (props.type === 'month') return <><header class='i-date-picker__panel-header'><button type='button' aria-label='上一年' onClick={() => move(-12)}>‹</button><strong>{cursor.value.getFullYear()}年</strong><button type='button' aria-label='下一年' onClick={() => move(12)}>›</button></header><div class='i-date-picker__panel' role='grid' data-view='month'>{monthOptions().map((date) => <button type='button' role='gridcell' data-value={String(date.getMonth() + 1).padStart(2, '0')} class={{ 'is-selected': selectedValues.value.some((item) => item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth()) }} onClick={() => select(date)}>{date.getMonth() + 1}月</button>)}</div></>;
      return (
        <div class='i-date-picker__calendar-panel' role='dialog'>
          <header class='i-date-picker__panel-header'><button type='button' aria-label='上个月' onClick={() => move(-1)}>‹</button><strong>{monthLabel(cursor.value)}</strong><button type='button' aria-label='下个月' onClick={() => move(1)}>›</button></header>
          <div class='i-date-picker__week'>{props.showWeekNumber && <span class='i-date-picker__week-number'>周</span>}{Array.from({ length: 7 }, (_, index) => ['日', '一', '二', '三', '四', '五', '六'][(index + props.firstDayOfWeek) % 7]) .map((day) => <span key={day}>{day}</span>)}</div>
          <div class={['i-date-picker__grid', props.showWeekNumber && 'has-week-number']}>{days.value.map((date, index) => { const disabled = Boolean(props.disabledDate?.(date)); const selected = selectedValues.value.some((item) => sameDay(item, date)); const rangeStart = selectedValues.value[0]; const rangeEnd = selectedValues.value[1]; const inRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd; const weekStart = getWeekStart(date, props.firstDayOfWeek); const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); const selectedWeek = props.type === 'week' && selectedValues.value.some((item) => item >= weekStart && item <= weekEnd); return <>{props.showWeekNumber && index % 7 === 0 && <span class='i-date-picker__week-number-row'>{getWeekNumber(date, props.firstDayOfWeek)}</span>}<button type='button' role='gridcell' data-value={localValue(date)} class={{ 'is-other-month': date.getMonth() !== cursor.value.getMonth(), 'is-selected': selected, 'is-in-week': selectedWeek, 'is-in-range': inRange, 'is-start-date': rangeStart && sameDay(rangeStart, date), 'is-end-date': rangeEnd && sameDay(rangeEnd, date), 'is-today': sameDay(date, new Date()), ...(typeof props.cellClassName === 'function' ? { [props.cellClassName(date)]: true } : { [props.cellClassName || '']: Boolean(props.cellClassName) }) }} aria-selected={selected} disabled={disabled} onClick={() => select(date)}>{slots.date?.({ date }) ?? date.getDate()}</button></>; })}</div>
        </div>
      );
    };
  }
});
